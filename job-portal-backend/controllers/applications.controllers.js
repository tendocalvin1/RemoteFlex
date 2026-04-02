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
    const applications = await Application.find({
      job: req.params.jobId,
    }).populate("applicant");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
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