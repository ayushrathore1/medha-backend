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
  try {
    console.log(`[WELCOME EMAIL] Attempting to send to ${user.email}`);

    const html = `
    <div style="font-family:Inter, Arial, sans-serif; background: #f8fafc; padding: 28px 0; text-align:center;">
      <div style="background:#fff; border-radius:12px; max-width:480px; margin:auto; padding:36px 32px; box-shadow:0 4px 18px 0 #0002;">
        <h2 style="color:#2563eb; margin-top:0;">Welcome to <span style="color:#0ea5e9;">Medha</span> 🎉</h2>
        <p style="font-size:1.18rem; color:#334155; margin-bottom:22px;">
          Hi <b>${user.name}</b>, <br>
          We're thrilled to welcome you to India’s smartest notes & revision platform.<br>
          Medha is now your personal space for superfast note-making, AI-powered quizzes, and deep revision.
        </p>
        <p style="font-size:1.08rem; color:#64748b;">
          🚀 Start exploring all features now:<br>
          <a href="https://medha-revision.vercel.app" style="background:#2563eb; color:#fff; padding:12px 20px; border-radius:8px;
          text-decoration:none; font-weight:600; letter-spacing:0.5px; display:inline-block; margin-top:10px;">Open Medha</a>
        </p>
        <hr style="margin:32px 0; border: none; border-top:2px solid #eef2f7;">
        <p style="color:#64748b; font-size:1rem;">
          If you didn’t sign up, ignore this message.<br>
          For any questions: reply to this email — we reply fast!
        </p>
        <div style="margin-top:16px; font-size:0.97rem; color:#94a3b8;">Happy learning,<br>The Medha Team 🌟</div>
      </div>
    </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Welcome to Medha!",
      html,
    });

    console.log(`[WELCOME EMAIL] Successfully sent to ${user.email}`);
  } catch (error) {
    console.error(
      `[WELCOME EMAIL ERROR] Failed to send to ${user.email}:`,
      error.message
    );
    throw error;
  }
}

// ...other routes (forgot-password, reset-password) BELOW...
// These routes work as in your previous file, unchanged.

module.exports = { router, sendWelcomeEmail };
