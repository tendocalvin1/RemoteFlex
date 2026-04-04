
import { protect } from '../middleware/auth.middleware.js';
import { Router } from "express";
import { applyToJob, getMyApplications, getApplicationsForJob, updateApplicationStatus } from "../controllers/applications.controllers.js";

const router = Router();

// All routes protected
router.route('/apply').post(protect, applyToJob);
router.route('/getApplications').get(protect, getMyApplications);
router.route('/:jobId/applications').get(protect, getApplicationsForJob);
router.route('/update/:id').patch(protect, updateApplicationStatus);

export default router;