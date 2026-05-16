
const aiCareerCopilotService = require('../services/aiCareerCopilotService');

const matchJobs = async (req, res, next) => {
  try {
    const { resumeText, jobs } = req.body;

    // Basic validation
    if (!resumeText || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'resumeText and jobs are required.',
      });
    }

    // Call FastAPI AI service
    const result = await aiCareerCopilotService.matchJobs(
      resumeText,
      jobs
    );

    // Return standardized response
    res.status(200).json({
      success: true,
      message: 'AI job matching completed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchJobs,
};