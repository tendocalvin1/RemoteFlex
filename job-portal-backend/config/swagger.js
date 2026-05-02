import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description: 'A comprehensive job portal platform API for connecting employers and job seekers',
      contact: {
        name: 'Tendo Calvin',
        email: 'support@jobportal.com'
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? process.env.API_URL || 'https://api.jobportal.com'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['job_seeker', 'employer'] },
            isEmailVerified: { type: 'boolean' },
            avatar: { type: 'string' },
            bio: { type: 'string' },
            resumeUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            companyName: { type: 'string' },
            description: { type: 'string' },
            category: {
              type: 'string',
              enum: ['engineering', 'design', 'marketing', 'sales', 'finance', 'ops', 'other']
            },
            remoteType: {
              type: 'string',
              enum: ['remote', 'onsite', 'hybrid']
            },
            salaryMin: { type: 'number' },
            salaryMax: { type: 'number' },
            location: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
            responsibilities: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['active', 'closed'] },
            views: { type: 'number' },
            employer: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };