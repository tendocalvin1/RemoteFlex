import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    // 📧 Email
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
      maxlength: [255, "Email cannot exceed 255 characters"],
      index: true,
    },

    // 🔒 Password
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [72, "Password cannot exceed 72 characters"],
      select: false,
    },

    // 🎭 Role
    role: {
      type: String,
      enum: ["job_seeker", "employer"],
      required: true,
      index: true,
    },

    // 👤 Basic Info
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

    avatar: {
      type: String,
      default: "", // profile image URL
    },

    // 📄 Resume (Job Seekers)
    resumeUrl: {
      type: String,
      default: null,
    },

    resumePublicId: {
      type: String,
      default: null,
      select: false,
    },

    // 🔐 Auth Enhancements (important for real apps)
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    // 🔑 Password Reset (production feature)
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // 📊 Analytics mindset
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  //next();
});


// 🧠 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


// 🧠 Hide sensitive fields globally
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.resumePublicId;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;

  return obj;
};


export const User = mongoose.model("User", userSchema);