

const express = require('express');
const router = express.Router();

const {
  matchJobs,
} = require('../controllers/aiCareerCopilotController');

// POST /api/ai-career-copilot/match-jobs
router.post('/match-jobs', matchJobs);

module.exports = router;