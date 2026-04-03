
import {Router } from "express";
import { protect } from '../middleware/auth.middleware.js';
import { registerUser,loginUser,getCurrentUser } from "../controllers/users.controllers.js";

const router = Router();

// end points
router.route('/currentUser').get(protect, getCurrentUser);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);


export default router;
