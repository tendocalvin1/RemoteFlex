import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    // 🔗 Job reference
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    // 🔗 Applicant (User)
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📄 Resume (Cloudinary or storage URL)
    resumeUrl: {
      type: String,
      required: [true, "Resume URL is required"],
      trim: true,
    },

    resumePublicId: {
      type: String,
      required: [true, "Resume public ID is required"],
    },

    // 📌 Application status (important for real systems)
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected"],
      default: "pending",
      index: true,
    },

    // ⏱️ Application date
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


// 🚨 CRITICAL: Prevent duplicate applications
applicationSchema.index(
  { job: 1, applicant: 1 },
  { unique: true }
);


// ⚡ Useful compound indexes for queries
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });


// 🧠 Middleware: Increment job application count
applicationSchema.post("save", async function (doc, next) {
  try {
    await mongoose.model("Job").findByIdAndUpdate(doc.job, {
      $inc: { applicationsCount: 1 },
    });
    next();
  } catch (err) {
    next(err);
  }
});


// 🧠 Middleware: Decrement if application removed
applicationSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Job").findByIdAndUpdate(doc.job, {
      $inc: { applicationsCount: -1 },
    });
  }
});


export const Application = mongoose.model(
  "Application",
  applicationSchema
);