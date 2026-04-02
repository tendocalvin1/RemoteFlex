import { Job } from "../models/jobs.models.js";


// ➕ Create Job
const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Only employers can create jobs" });
    }

    const job = await Job.create({
      ...req.body,
      employer: req.user.id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 📄 Get All Jobs (with filters)
const getJobs = async (req, res) => {
  try {
    const { category, remoteType, minSalary, maxSalary, search } = req.query;

    let query = {};

    if (category) query.category = category;
    if (remoteType) query.remoteType = remoteType;

    if (minSalary || maxSalary) {
      query.salaryMin = { $gte: minSalary || 0 };
      query.salaryMax = { $lte: maxSalary || Infinity };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔍 Get Single Job
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 📈 increment views
    job.views += 1;
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ Close Job
const closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    job.status = "closed";
    await job.save();

    res.json({ message: "Job closed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export{
  createJob,
  getJobs,
  getJobById,
  closeJob
}