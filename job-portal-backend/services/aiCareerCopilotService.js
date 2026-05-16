
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

class AICareerCopilotService {
  async matchJobs(resumeText, jobs) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/v1/match-jobs`,
        {
          resume_text: resumeText,
          jobs,
        },
        {
          timeout: 60000, // 60 seconds
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI Career Copilot request failed:', error.message);

      if (error.response) {
        throw new Error(
          error.response.data?.detail ||
            'AI Career Copilot service returned an error.'
        );
      }

      throw new Error('Unable to connect to AI Career Copilot service.');
    }
  }
}

module.exports = new AICareerCopilotService();