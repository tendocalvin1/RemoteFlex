import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  upload,
  uploadImage,
  uploadImageFile,
  uploadResume,
} from "../controllers/upload.controllers.js";

const router = Router();

router.route("/resume").post(protect,upload.single("resume"),uploadResume);
router.route("/image").post(protect, uploadImageFile.single("image"), uploadImage);

export default router;
