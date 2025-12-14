require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendEmail } = require("../utils/sendEmail");

const router = express.Router();

// Welcome email helper with fixed template
async function sendWelcomeEmail(user) {
  const html = `
    <div style="font-family:Inter, Arial, sans-serif; background: #f8fafc; padding: 28px 0; text-align:center;">
      <div style="background:#fff; border-radius:12px; max-width:480px; margin:auto; padding:36px 32px; box-shadow:0 4px 18px 0 #0002;">
        <h2 style="color:#2563eb; margin-top:0;">Welcome to <span style="color:#0ea5e9;">Medha</span> 🎉</h2>
        <p style="font-size:1.18rem; color:#334155; margin-bottom:22px;">
          Hi <b>${user.name}</b>, <br>
          We're thrilled to welcome you to India's smartest notes & revision platform.<br>
          Medha is now your personal space for superfast note-making, AI-powered quizzes, and deep revision.
        </p>
        <p style="font-size:1.08rem; color:#64748b;">
          🚀 Start exploring all features now:<br>
          <a href="https://medha-revision.vercel.app" style="background:#2563eb; color:#fff; padding:12px 20px; border-radius:8px;
          text-decoration:none; font-weight:600; letter-spacing:0.5px; display:inline-block; margin-top:10px;">Open Medha</a>
        </p>
        <hr style="margin:32px 0; border: none; border-top:2px solid #eef2f7;">
        <p style="color:#64748b; font-size:1rem;">
          If you didn't sign up, ignore this message.<br>
          For any questions: reply to this email — we reply fast!
        </p>
        <div style="margin-top:16px; font-size:0.97rem; color:#94a3b8;">Happy learning,<br>The Medha Team 🌟</div>
      </div>
    </div>
  `;

  console.log("📧 Attempting to send welcome email to:", user.email);
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

    const html = `
      <div style="font-family:sans-serif">
        <h2>Reset your Medha password</h2>
        <p>This link will expire in ${process.env.RESET_TOKEN_TTL_MIN || 30} minutes.</p>
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>`;

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

module.exports = { router, sendWelcomeEmail };
