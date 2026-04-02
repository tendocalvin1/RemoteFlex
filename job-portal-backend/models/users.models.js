import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
      maxlength: [255, "Email cannot exceed 255 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [72, "Password cannot exceed 72 characters"], // bcrypt hard limit
      select: false, // never returned in queries unless explicitly asked
    },

    role: {
      type: String,
      enum: {
        values: ["job_seeker", "employer"],
        message: "Role must be job_seeker or employer",
      },
      required: [true, "Role is required"],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    // Only relevant for job_seekers — enforced at controller level
    resumeUrl: {
      type: String,
      default: null,
    },

    // Cloudinary public_id — needed to delete old resume before uploading new one
    // select: false so it never leaks into API responses
    resumePublicId: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

// Hooks

// Hash password before saving — only runs when password field is modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12); // 12 rounds is the sweet spot
  next();
});

//  Instance Methods 

// Compare entered password against stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields from all JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resumePublicId;
  return obj;
};

export const User = mongoose.model("User", userSchema);