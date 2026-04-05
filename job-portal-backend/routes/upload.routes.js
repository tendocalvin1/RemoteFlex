import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { upload, uploadResume } from "../controllers/upload.controllers.js";

const router = Router();

router.route("/resume").post(protect,upload.single("resume"),uploadResume);

export default router;