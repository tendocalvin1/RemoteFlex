import { Application } from "../models/applications.models.js";


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
    }).populate("job");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🏢 Get Applications for a Job (Employer)
const getApplicationsForJob = async (req, res) => {
  try {
    // ROLE GUARD — only employers can access this endpoint
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Only employers can view job applications" });
    }

    // VALIDATE jobId — prevent malformed ObjectId from crashing Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    // OWNERSHIP CHECK — verify this job belongs to the requesting employer
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not have permission to view these applications" });
    }

    // PAGINATION — never return unbounded results
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20); // cap at 50
    const skip  = (page - 1) * limit;

    // OPTIONAL STATUS FILTER — employer filters by pending/reviewed/shortlisted/rejected
    const filter = { job: req.params.jobId };
    const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected"];

    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({ error: "Invalid status filter" });
      }
      filter.status = req.query.status;
    }

    // QUERY — populate only the fields you need from applicant, not the whole document
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("applicant", "name email avatar resumeUrl bio") // ← whitelist fields
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    // STRUCTURED RESPONSE
    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      applications,
    });

  } catch (err) {
    res.status(500).json({message: "Internal server error"}); // never leak err.message in production
  }
};


// 🔄 Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export {
 applyToJob,
 getMyApplications,
 getApplicationsForJob,
 updateApplicationStatus 
}