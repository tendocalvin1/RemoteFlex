
import {Router } from "express";
import { protect } from '../middleware/auth.middleware.js';
import {applyToJob, getMyApplications, getApplicationsForJob,updateApplicationStatus  } from "../controllers/applications.controllers.js";

const router = Router();

// end points
router.route('/apply').post(applyToJob);
router.route('/:jobId/applications').get(protect, getApplicationsForJob);
router.route('/update').patch(updateApplicationStatus);
router.route('/getApplications').get(getMyApplications);

export default router;