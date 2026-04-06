
import { Router } from "express";
import { protect } from '../middleware/auth.middleware.js';
import { registerUser, loginUser, getCurrentUser, verifyEmail, forgotPassword,resetPassword} from "../controllers/users.controllers.js";

const router = Router();

// Public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-email').get(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').patch(resetPassword);

// Protected routes
router.route('/currentUser').get(protect, getCurrentUser);

export default router;