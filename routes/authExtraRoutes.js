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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #fffaf0; color: #4338ca; font-family: 'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Bitstream Vera Sans', Geneva, sans-serif; }
    .main-card { background-color: #ffffff; border-radius: 24px; border: 1px solid #fde68a; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.1); }
    .serif-header { font-family: 'Georgia', 'Times New Roman', serif; color: #b45309; }
    .relatable-message { background-color: #fffbeb; border: 1px dashed #fbbf24; border-radius: 16px; padding: 30px; margin: 25px 0; }
    .decoration-text { color: #d97706; font-size: 20px; }
    @media screen and (max-width: 600px) {
        .email-container { width: 100% !important; }
        .padding-mobile { padding: 30px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fffaf0;">
  <center style="width: 100%; table-layout: fixed; background-color: #fffaf0; padding-bottom: 50px;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      Reset your Medha Revision password. Link expires in ${process.env.RESET_TOKEN_TTL_MIN || 30} minutes.
    </div>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container main-card" style="max-width: 600px;">
      <tr>
        <td align="center" style="padding: 40px 20px 0 20px;">
          <span class="decoration-text">✨ 🔐 ✨</span>
          <div style="padding-top: 15px;">
            <img src="https://ik.imagekit.io/ayushrathore1/Medha/image.png?updatedAt=1766938759500" alt="Medha Revision" width="160" style="display: block; outline: none;" />
          </div>
        </td>
      </tr>
      <tr>
        <td class="padding-mobile" style="padding: 30px 60px 40px 60px; font-size: 17px; line-height: 1.8; color: #57534e; text-align: left;">
          <h1 class="serif-header" style="margin: 0 0 20px 0; font-size: 32px; text-align: center; font-weight: normal;">
            Reset Password
          </h1>
          <p style="text-align: center; color: #78716c;">
            Hi <strong>${user.name || 'Student'}</strong>, you requested to reset your password.
          </p>
          <div class="relatable-message" style="text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #92400e; font-family: 'Georgia', serif; line-height: 1.6;">
              "No worries! It happens to the best of us. Let's get you back to your revision."
            </p>
          </div>
          <p style="text-align: center;">
            Click the button below to set a new password. This link is valid for <strong>${process.env.RESET_TOKEN_TTL_MIN || 30} minutes</strong>.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #d97706; color: #ffffff; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.2);">Set New Password</a>
          </div>
          <p style="margin: 0; text-align: center; font-size: 14px; color: #a8a29e;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td class="padding-mobile" style="padding: 0 60px 50px 60px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #fef3c7;">
            <tr>
              <td style="padding-top: 30px; text-align: center;">
                <p style="margin: 0; color: #a8a29e; font-size: 15px; letter-spacing: 0.5px;">
                  Sent with warmth,<br>
                  <strong style="color: #78350f; font-size: 18px; font-family: 'Georgia', serif;">Medha Revision</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 30px; background-color: #fffcf2; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; font-size: 12px; color: #a8a29e; border-top: 1px solid #fef3c7;">
          <p style="margin: 0; letter-spacing: 1px;">MADE WITH ❤️ BY <strong>MEDHA REVISION</strong></p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://medha-revision.vercel.app/" style="color: #d97706; text-decoration: none; font-weight: bold;">Visit the Website</a>
          </p>
        </td>
      </tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>
    </table>
  </center>
</body>
</html>
    `;

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

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #fffaf0; color: #4338ca; font-family: 'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', 'Bitstream Vera Sans', Geneva, sans-serif; }
    .main-card { background-color: #ffffff; border-radius: 24px; border: 1px solid #fde68a; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.1); }
    .serif-header { font-family: 'Georgia', 'Times New Roman', serif; color: #b45309; }
    .relatable-message { background-color: #fffbeb; border: 1px dashed #fbbf24; border-radius: 16px; padding: 30px; margin: 25px 0; }
    .decoration-text { color: #d97706; font-size: 20px; }
    @media screen and (max-width: 600px) {
        .email-container { width: 100% !important; }
        .padding-mobile { padding: 30px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fffaf0;">
  <center style="width: 100%; table-layout: fixed; background-color: #fffaf0; padding-bottom: 50px;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      Reset your Medha Revision password. Link expires in ${process.env.RESET_TOKEN_TTL_MIN || 30} minutes.
    </div>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container main-card" style="max-width: 600px;">
      <tr>
        <td align="center" style="padding: 40px 20px 0 20px;">
          <span class="decoration-text">✨ 🔐 ✨</span>
          <div style="padding-top: 15px;">
            <img src="https://ik.imagekit.io/ayushrathore1/Medha/image.png?updatedAt=1766938759500" alt="Medha Revision" width="160" style="display: block; outline: none;" />
          </div>
        </td>
      </tr>
      <tr>
        <td class="padding-mobile" style="padding: 30px 60px 40px 60px; font-size: 17px; line-height: 1.8; color: #57534e; text-align: left;">
          <h1 class="serif-header" style="margin: 0 0 20px 0; font-size: 32px; text-align: center; font-weight: normal;">
            Reset Password
          </h1>
          <p style="text-align: center; color: #78716c;">
            Hi <strong>${user.name || 'Student'}</strong>, you requested to reset your password.
          </p>
          <div class="relatable-message" style="text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #92400e; font-family: 'Georgia', serif; line-height: 1.6;">
              "No worries! It happens to the best of us. Let's get you back to your revision."
            </p>
          </div>
          <p style="text-align: center;">
            Click the button below to set a new password. This link is valid for <strong>${process.env.RESET_TOKEN_TTL_MIN || 30} minutes</strong>.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #d97706; color: #ffffff; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.2);">Set New Password</a>
          </div>
          <p style="margin: 0; text-align: center; font-size: 14px; color: #a8a29e;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td class="padding-mobile" style="padding: 0 60px 50px 60px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #fef3c7;">
            <tr>
              <td style="padding-top: 30px; text-align: center;">
                <p style="margin: 0; color: #a8a29e; font-size: 15px; letter-spacing: 0.5px;">
                  Sent with warmth,<br>
                  <strong style="color: #78350f; font-size: 18px; font-family: 'Georgia', serif;">Medha Revision</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 30px; background-color: #fffcf2; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; font-size: 12px; color: #a8a29e; border-top: 1px solid #fef3c7;">
          <p style="margin: 0; letter-spacing: 1px;">MADE WITH ❤️ BY <strong>MEDHA REVISION</strong></p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://medha-revision.vercel.app/" style="color: #d97706; text-decoration: none; font-weight: bold;">Visit the Website</a>
          </p>
        </td>
      </tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      <tr><td height="50" style="font-size: 50px; line-height: 50px;">&nbsp;</td></tr>
    </table>
  </center>
</body>
</html>
    `;

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

