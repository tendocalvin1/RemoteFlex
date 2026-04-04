import { Job } from "../models/jobs.models.js";


//  Create Job
const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ error: "Only employers can create jobs" });
    }

    // ✅ Prevent duplicate job postings
    const existingJob = await Job.findOne({
      employer: req.user.id,
      title: req.body.title,
      companyName: req.body.companyName,
      status: "active"
    });

    if (existingJob) {
      return res.status(400).json({ 
        error: "You already have an active posting for this position at this company" 
      });
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


// Get All Jobs (with filters)
const getJobs = async (req, res) => {
  try {
    const { category, remoteType, minSalary, maxSalary, search, keyword } = req.query;

    let query = { status: "active" }; // ← also add this, never return closed jobs

    if (category) query.category = category;
    if (remoteType) query.remoteType = remoteType;

    if (minSalary || maxSalary) {
      query.salaryMin = { $gte: Number(minSalary) || 0 };
      query.salaryMax = { $lte: Number(maxSalary) || Infinity };
    }

    // ✅ Accept both 'search' and 'keyword'
    const searchTerm = search || keyword;
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      jobs
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//  Get Single Job
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


// Close Job
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