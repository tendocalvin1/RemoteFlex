
import {Router } from "express";
import { protect } from '../middleware/auth.middleware.js';
import { validateJobCreation } from '../middleware/validation.middleware.js';
import { createJob, getJobs, getMyJobs, getJobById, closeJob } from "../controllers/jobs.controllers.js";

const router = Router();

/**
 * @swagger
 * /api/jobs/create:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - companyName
 *               - description
 *               - category
 *               - remoteType
 *               - salaryMin
 *               - salaryMax
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 150
 *               companyName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 50
 *               category:
 *                 type: string
 *                 enum: [engineering, design, marketing, sales, finance, ops, other]
 *               remoteType:
 *                 type: string
 *                 enum: [remote, onsite, hybrid]
 *               salaryMin:
 *                 type: number
 *                 minimum: 0
 *               salaryMax:
 *                 type: number
 *                 minimum: 0
 *               location:
 *                 type: string
 *                 maxLength: 100
 *               companyWebsite:
 *                 type: string
 *                 format: uri
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 5
 *                   maxLength: 200
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 5
 *                   maxLength: 200
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   maxLength: 30
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Only employers can create jobs
 *       401:
 *         description: Not authenticated
 */
router.route('/create').post(protect, validateJobCreation, createJob);

/**
 * @swagger
 * /api/jobs/get:
 *   get:
 *     summary: Get jobs with advanced filtering
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, description, company, or tags
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [engineering, design, marketing, sales, finance, ops, other]
 *         description: Job category filter
 *       - in: query
 *         name: remoteType
 *         schema:
 *           type: string
 *           enum: [remote, onsite, hybrid]
 *         description: Remote work type filter
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location filter (partial match)
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *         description: Minimum salary filter
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: number
 *         description: Maximum salary filter
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags to filter by
 *       - in: query
 *         name: datePosted
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         description: Filter by posting date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, salaryMin, salaryMax, title, companyName, views]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   description: Total number of jobs matching filters
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 pages:
 *                   type: integer
 *                   description: Total number of pages
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 filters:
 *                   type: object
 *                   description: Available filter options
 */
router.route('/get').get(getJobs);

router.route('/mine').get(protect, getMyJobs);

/**
 * @swagger
 * /api/jobs/job/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       400:
 *         description: Invalid job ID
 */
router.route('/job/:id').get(getJobById);

/**
 * @swagger
 * /api/jobs/job/{id}/close:
 *   patch:
 *     summary: Close a job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job closed successfully
 *       403:
 *         description: Not authorized to close this job
 *       404:
 *         description: Job not found
 *       401:
 *         description: Not authenticated
 */
router.route('/job/:id/close').patch(protect, closeJob);

export default router;
