
import {Router } from "express";
import { protect } from '../middleware/auth.middleware.js';
import { createJob,getJobs,getJobById, closeJob } from "../controllers/jobs.controllers.js";

const router = Router();

// end points
router.route('/create').post(protect, createJob);
router.route('/get').get(getJobs);
router.route('/job/:id').get(getJobById);
router.route('/job/:id').delete(protect, closeJob);
router.route('/job/:id/close').patch(protect, closeJob);

export default router;
