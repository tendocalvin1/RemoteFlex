import mongoose from "mongoose";
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


// Get All Jobs (with advanced filters)
const getJobs = async (req, res) => {
  try {
    const {
      category,
      remoteType,
      minSalary,
      maxSalary,
      search,
      keyword,
      location,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      datePosted // 'today', 'week', 'month'
    } = req.query;

    let query = { status: "active" };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Remote type filter
    if (remoteType && remoteType !== 'all') {
      query.remoteType = remoteType;
    }

    // Location filter (case-insensitive partial match)
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Salary range filter - fixed to prevent CastError
    if (minSalary && minSalary !== '{}' && minSalary.trim() !== '') {
      const min = Number(minSalary);
      if (!isNaN(min) && min >= 0) {
        query.salaryMin = { $gte: min };
      }
    }

    if (maxSalary && maxSalary !== '{}' && maxSalary.trim() !== '') {
      const max = Number(maxSalary);
      if (!isNaN(max) && max >= 0) {
        query.salaryMax = { $lte: max };
      }
    }

    // Date posted filter
    if (datePosted) {
      const now = new Date();
      switch (datePosted) {
        case 'today':
          query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case 'week':
          query.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          query.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => new RegExp(tag.trim(), 'i')) };
    }

    // Text search (title, description, company name, tags)
    const searchTerm = search || keyword;
    if (searchTerm && searchTerm.trim()) {
      query.$text = { $search: searchTerm.trim() };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    const allowedSortFields = ['createdAt', 'salaryMin', 'salaryMax', 'title', 'companyName', 'views'];
    const allowedSortOrders = ['asc', 'desc'];

    if (allowedSortFields.includes(sortBy)) {
      sortOptions[sortBy] = allowedSortOrders.includes(sortOrder) ? (sortOrder === 'desc' ? -1 : 1) : -1;
    } else {
      sortOptions.createdAt = -1; // default sort
    }

    // Execute query with aggregation for better text search scoring
    let jobsQuery = Job.find(query).populate(
      "employer",
      "name avatar companyName companyLogo companyWebsite companyTagline companyDescription"
    );

    // Add text score meta if using text search
    if (query.$text) {
      jobsQuery = jobsQuery.select({ score: { $meta: "textScore" } });
      sortOptions.score = { $meta: "textScore" };
    }

    jobsQuery = jobsQuery.sort(sortOptions).skip(skip).limit(limitNum);

    const [jobs, total] = await Promise.all([
      jobsQuery,
      Job.countDocuments(query)
    ]);

    // Get filter options for frontend
    const filterOptions = await getFilterOptions();

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      jobs,
      filters: filterOptions
    });

  } catch (err) {
    console.error('Jobs search error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to get filter options
const getFilterOptions = async () => {
  try {
    const [categories, remoteTypes, locations, tags] = await Promise.all([
      Job.distinct('category', { status: 'active' }),
      Job.distinct('remoteType', { status: 'active' }),
      Job.distinct('location', { status: 'active' }),
      Job.distinct('tags', { status: 'active' })
    ]);

    return {
      categories: categories.filter(Boolean),
      remoteTypes: remoteTypes.filter(Boolean),
      locations: locations.filter(Boolean).slice(0, 20), // Limit locations
      tags: tags.filter(Boolean).flat().slice(0, 50) // Limit tags
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {};
  }
};


//  Get Single Job
const getJobById = async (req, res) => {
  try {
    // ✅ Validate ObjectId first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    // ✅ Atomic view increment + whitelist employer fields in one query
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate(
      "employer",
      "name avatar companyName companyLogo companyWebsite companyTagline companyDescription"
    );

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

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