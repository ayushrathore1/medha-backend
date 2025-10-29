require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendEmail } = require("../utils/sendEmail");

const router = express.Router();

// Welcome email helper
async function sendWelcomeEmail(user) {
  const html = `
    <div style="font-family:sans-serif">
      <h2>Welcome to Medha, ${user.name || "Learner"} 🎉</h2>
      <p>Your account is ready. Generate AI quizzes, revise faster, and track progress.</p>
      <a href="${process.env.APP_BASE_URL}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open Medha</a>
      <p style="color:#64748b">If you didn’t sign up, ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Welcome to Medha!", html });
}

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(200)
      .json({ message: "If this email exists, a reset link has been sent." });
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
      <p>If you didn’t request this, you can safely ignore this email.</p>
    </div>`;
  await sendEmail({ to: user.email, subject: "Medha password reset", html });
  res
    .status(200)
    .json({ message: "If this email exists, a reset link has been sent." });
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "Token and new password required" });
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
});

module.exports = { router, sendWelcomeEmail };
