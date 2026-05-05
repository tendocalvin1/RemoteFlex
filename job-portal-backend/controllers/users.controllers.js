import { CLIENT_URL, JWT_SECRET, JWT_REFRESH_SECRET } from "../config/env.js";
import { User } from "../models/users.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import crypto from "crypto";
import { sendEmail } from "../config/email.js";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
  passwordResetSuccessTemplate,
} from "../config/email-templates.js";
import { clearCsrfToken, setCsrfToken } from "../middleware/csrf.middleware.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
};

const hashRefreshToken = (refreshToken) => hashToken(refreshToken);

// ─── Generate Access Token (short lived) ──────────────────────
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// ─── Generate Refresh Token (long lived) ──────────────────────
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
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

    await User.create({
      name,
      email,
      password,
      role,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: verificationExpires,
    });

    const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    const template = emailVerificationTemplate(name, verificationUrl);

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });

  } catch (err) {
    logger.error("REGISTRATION ERROR: %O", err);
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
      emailVerificationToken: hashToken(token),
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

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const unlockTime = new Date(user.lockUntil).toLocaleString();
      return res.status(423).json({
        error: `Account locked until ${unlockTime}. Please try again later.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const updates = {
        $inc: { failedLoginAttempts: 1 },
      };

      if (user.failedLoginAttempts + 1 >= 5) {
        updates.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await User.findByIdAndUpdate(user._id, updates, { new: true });

      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ⚠️ DEVELOPMENT ONLY: Auto-verify email for testing
    if (!user.isEmailVerified && process.env.NODE_ENV === "development") {
      await User.findByIdAndUpdate(user._id, { isEmailVerified: true });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        error: "Please verify your email before logging in.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
      refreshToken: refreshTokenHash,
      failedLoginAttempts: 0,
      lockUntil: undefined,
    });

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    setCsrfToken(res);

    res.json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Refresh Access Token ──────────────────────────────────────
export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select("+refreshToken");
    const incomingTokenHash = hashRefreshToken(token);

    if (!user || user.refreshToken !== incomingTokenHash) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await User.findByIdAndUpdate(user._id, { refreshToken: refreshTokenHash });
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    setCsrfToken(res);

    res.json({ message: "Token refreshed" });

  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

// ─── Logout ───────────────────────────────────────────────────
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch {
        logger.warn("Logout request contained invalid refresh token");
      }
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });
    clearCsrfToken(res);

    res.status(200).json({ message: "Logged out successfully" });

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

// ─── Update Current User Profile ─────────────────────────────────
export const updateUserProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'avatar'];

    if (req.user.role === 'employer') {
      allowedFields.push(
        'companyName',
        'companyLogo',
        'companyWebsite',
        'companyTagline',
        'companyDescription'
      );
    }

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
      passwordResetToken: hashToken(resetToken),
      passwordResetExpires: resetExpires,
    });

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
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

// Verify Reset Token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Reset token is valid" });
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
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // ✅ Hash manually — bypass pre-save hook
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      refreshToken: null,
    });

    const template = passwordResetSuccessTemplate(user.name);
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    res.status(200).json({ message: "Password reset successfully. You can now log in." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
