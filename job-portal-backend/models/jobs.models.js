import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    // 🔗 Employer (User reference)
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🏢 Company Info
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
      index: true,
    },

    companyLogo: {
      type: String, // Cloudinary URL
      default: "",
    },

    companyWebsite: {
      type: String,
      trim: true,
      default: "",
    },

    // 💼 Job Details
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [150, "Title too long"],
      index: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      minlength: [50, "Description too short"],
    },

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],

    // 💰 Salary
    salaryMin: {
      type: Number,
      required: true,
      min: 0,
    },

    salaryMax: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.salaryMin;
        },
        message: "Max salary must be >= min salary",
      },
    },

    currency: {
      type: String,
      default: "USD",
    },

    // 🌍 Work Type
    remoteType: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      required: true,
      index: true,
    },

    location: {
      type: String, // Optional for remote jobs
      trim: true,
    },

    // 📊 Category
    category: {
      type: String,
      enum: [
        "engineering",
        "design",
        "marketing",
        "sales",
        "finance",
        "ops",
        "other",
      ],
      required: true,
      index: true,
    },

    // 📌 Job Status
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },

    // ⏳ Expiration
    expiresAt: {
      type: Date,
      index: true,
    },

    // 📈 Analytics (important for SaaS thinking)
    views: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },

    // 🏷️ Tags (for search/filtering)
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);


// 🔍 TEXT SEARCH (critical for job boards)
jobSchema.index({
  title: "text",
  description: "text",
  companyName: "text",
  tags: "text",
});


// ⚡ COMPOUND INDEXES (performance boost)
jobSchema.index({ category: 1, remoteType: 1 });
jobSchema.index({ salaryMin: 1, salaryMax: 1 });


// 🧠 VIRTUAL: Salary Range Label
jobSchema.virtual("salaryRange").get(function () {
  return `${this.salaryMin} - ${this.salaryMax} ${this.currency}`;
});


// 🔒 Ensure virtuals show in JSON
jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });


export const Job = mongoose.model("Job", jobSchema);