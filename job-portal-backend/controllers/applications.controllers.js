import { Application } from "../models/applications.models.js";
import { Job } from "../models/jobs.models.js";
import mongoose from "mongoose";
import { sendEmail } from "../config/email.js";
import { applicationStatusTemplate } from "../config/email-templates.js";
import { io, connectedUsers } from "../index.js";

// 📨 Apply to Job
const applyToJob = async (req, res) => {
  try {
    if (req.user.role !== "job_seeker") {
      return res.status(403).json({ error: "Only job seekers can apply" });
    }

    const application = await Application.create({
      job: req.body.jobId,
      applicant: req.user.id,
      resumeUrl: req.body.resumeUrl,
      resumePublicId: req.body.resumePublicId,
    });

    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: "You have already applied to this job",
      });
    }
    res.status(400).json({ error: err.message });
  }
};

// 📄 Get My Applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.id,
    })
      .populate("job", "title companyName remoteType location salaryMin salaryMax currency status")
      .select("-resumePublicId")
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      total: applications.length,
      applications,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🏢 Get Applications for a Job (Employer)
const getApplicationsForJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Only employers can view job applications" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not have permission to view these applications" });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { job: req.params.jobId };
    const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected"];

    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({ error: "Invalid status filter" });
      }
      filter.status = req.query.status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("applicant", "name email avatar resumeUrl bio")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      applications,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔄 Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Only employers can update application status" });
    }

    const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    console.log("DB name:", Application.db.name);
    console.log("Collection:", Application.collection.name);
    console.log("Looking for application:", req.params.id);

    const application = await Application.findById(req.params.id).populate("job");
    console.log("Found:", application);

    const raw = await mongoose.connection.db.collection('applications').findOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });
    console.log("Raw query result:", raw);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not have permission to update this application" });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate("applicant", "name email avatar")
      .select("-resumePublicId");

    const template = applicationStatusTemplate(
      updated.applicant.name,
      application.job.title,
      application.job.companyName,
      req.body.status
    );

    await sendEmail({
      to: updated.applicant.email,
      subject: template.subject,
      html: template.html,
    });

    const recipientSocketId = connectedUsers.get(updated.applicant._id.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('applicationStatusUpdate', {
        message: `Your application for ${application.job.title} has been ${req.body.status}`,
        status: req.body.status,
        jobTitle: application.job.title,
        companyName: application.job.companyName,
      });
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${req.body.status}`,
      application: updated,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};