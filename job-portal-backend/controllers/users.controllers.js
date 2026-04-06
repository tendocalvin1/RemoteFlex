

import { User } from "../models/users.models.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../config/email.js";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from "../config/email-templates.js";

// ─── Generate JWT ──────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ─── Register ─────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const template = emailVerificationTemplate(name, verificationUrl);

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ─── Verify Email ──────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    res.status(200).json({ message: "Email verified successfully. You can now log in." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        error: "Please verify your email before logging in.",
      });
    }

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const token = generateToken(user);
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Current User ──────────────────────────────────────────
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const template = passwordResetTemplate(user.name, resetUrl);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Reset Password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};