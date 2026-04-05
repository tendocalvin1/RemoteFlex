
import { cloudinary } from "../config/cloudinary.js";
import { User } from "../models/users.models.js";
import multer from "multer";
import { Readable } from "stream";

//  Multer — store file in memory, not disk 
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Upload Resume Controller 
export const uploadResume = async (req, res) => {
  try {
    // ROLE GUARD
    if (req.user.role !== "job_seeker") {
      return res.status(403).json({ error: "Only job seekers can upload resumes" });
    }

    // CHECK FILE EXISTS
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a PDF file" });
    }

    // DELETE OLD RESUME FROM CLOUDINARY
    const user = await User.findById(req.user.id).select("+resumePublicId");
    if (user.resumePublicId) {
      await cloudinary.uploader.destroy(user.resumePublicId, {
        resource_type: "raw",
      });
    }

    // STREAM FILE BUFFER TO CLOUDINARY
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "remoteflex/resumes",
          resource_type: "raw",
          public_id: `resume_${req.user.id}_${Date.now()}`,
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const readable = new Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });

    // SAVE URL TO USER PROFILE
    await User.findByIdAndUpdate(req.user.id, {
      resumeUrl: uploadResult.secure_url,
      resumePublicId: uploadResult.public_id,
    });

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: uploadResult.secure_url,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};