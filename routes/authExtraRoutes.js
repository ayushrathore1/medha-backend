require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const React = require("react");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendEmail } = require("../utils/sendEmail");
const { WelcomeEmail } = require("../emails/WelcomeEmail");
const { PasswordResetEmail } = require("../emails/PasswordResetEmail");
const { renderEmail } = require("../emails/renderEmail");

const router = express.Router();

// Welcome email helper using React Email component
async function sendWelcomeEmail(user) {
  console.log("📧 Attempting to send welcome email to:", user.email);
  const html = await renderEmail(
    React.createElement(WelcomeEmail, { name: user.name })
  );
  await sendEmail({
    to: user.email,
    subject: "Welcome to Medha! 🎉",
    html,
  });
  console.log("✅ Email sent successfully");
}

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent." });
    }
    console.log(`✅ Password reset requested for existing user: ${email}`);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(
      Date.now() + Number(process.env.RESET_TOKEN_TTL_MIN || 30) * 60 * 1000
    );

    await PasswordResetToken.updateMany(
      { userId: user._id, used: false },
      { $set: { used: true } }
    );

    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const jwtWrapper = jwt.sign(
      { uid: user._id.toString(), t: rawToken },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: `${process.env.RESET_TOKEN_TTL_MIN || 30}m` }
    );

    const resetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(jwtWrapper)}`;

    // Render React Email component to HTML
    const ttlMinutes = Number(process.env.RESET_TOKEN_TTL_MIN || 30);
    const html = await renderEmail(
      React.createElement(PasswordResetEmail, {
        name: user.name || 'Student',
        resetUrl,
        ttlMinutes,
      })
    );

    await sendEmail({ to: user.email, subject: "Medha password reset", html });

    res
      .status(200)
      .json({ message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Error processing request" });
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and new password required" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { uid, t: rawToken } = payload;
    const record = await PasswordResetToken.findOne({
      userId: uid,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record)
      return res.status(400).json({ message: "Invalid or expired token" });

    const ok = await bcrypt.compare(rawToken, record.tokenHash);
    if (!ok) return res.status(400).json({ message: "Invalid token" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await User.updateOne({ _id: uid }, { $set: { password: hash } });
    await PasswordResetToken.updateOne(
      { _id: record._id },
      { $set: { used: true } }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Admin-only: Trigger password reset for a user
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

router.post("/admin/trigger-reset", auth, adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    console.log(`🔐 Admin triggered password reset for: ${email}`);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(
      Date.now() + Number(process.env.RESET_TOKEN_TTL_MIN || 30) * 60 * 1000
    );

    // Invalidate any existing tokens
    await PasswordResetToken.updateMany(
      { userId: user._id, used: false },
      { $set: { used: true } }
    );

    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const jwtWrapper = jwt.sign(
      { uid: user._id.toString(), t: rawToken },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: `${process.env.RESET_TOKEN_TTL_MIN || 30}m` }
    );

    const resetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(jwtWrapper)}`;

    // Render React Email component to HTML (reuses same PasswordResetEmail component)
    const adminTtlMinutes = Number(process.env.RESET_TOKEN_TTL_MIN || 30);
    const html = await renderEmail(
      React.createElement(PasswordResetEmail, {
        name: user.name || 'Student',
        resetUrl,
        ttlMinutes: adminTtlMinutes,
      })
    );

    await sendEmail({ 
      to: user.email, 
      subject: "Reset Your Medha Password 🔐", 
      html 
    });

    res.status(200).json({ 
      success: true,
      message: `Password reset link sent to ${user.email}`,
      userName: user.name
    });
  } catch (err) {
    console.error("❌ Admin trigger reset error:", err);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

module.exports = { router, sendWelcomeEmail };

