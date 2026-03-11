const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const Otp = require("../models/Otp");
const auth = require("../middleware/auth");
const { sendWelcomeEmail } = require("./authExtraRoutes");
const { sendEmail } = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

// ── Generate 6-digit OTP ──
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ── Themed OTP email HTML ──
function getOtpEmailHtml(code, type = "verification") {
  const title = type === "login" ? "Login Verification" : "Verify Your Email";
  const subtitle = type === "login"
    ? "Use this code to log in to your MEDHA account"
    : "Use this code to complete your MEDHA registration";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#F2EDE4; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <center style="width:100%; background-color:#F2EDE4; padding:40px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;">
      <!-- Header -->
      <tr>
        <td style="background:#1A1A2E; padding:28px 32px; border-radius:20px 20px 0 0; text-align:center;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center">
                <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#7DC67A,#8B5CF6); display:inline-block; text-align:center; line-height:44px; font-size:20px; font-weight:800; color:white;">M</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:12px;">
                <div style="font-size:20px; font-weight:700; color:white; letter-spacing:1px;">MEDHA</div>
                <div style="font-size:12px; color:#7DC67A; margin-top:4px;">Your Study Companion</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="background:white; padding:40px 36px; border-left:1px solid #E8E4DC; border-right:1px solid #E8E4DC;">
          <h1 style="margin:0 0 8px; font-size:24px; font-weight:700; color:#1A1A2E; text-align:center;">${title}</h1>
          <p style="margin:0 0 28px; font-size:15px; color:#6B6B6B; text-align:center; line-height:1.5;">${subtitle}</p>
          
          <!-- OTP Box -->
          <div style="background:#F9F6F1; border:2px solid #7DC67A; border-radius:16px; padding:24px; text-align:center; margin:0 auto 28px;">
            <div style="font-size:36px; font-weight:800; letter-spacing:12px; color:#1A1A2E; font-family:'Courier New',monospace;">${code}</div>
            <div style="font-size:12px; color:#9A9A9A; margin-top:8px;">Expires in ${OTP_EXPIRY_MINUTES} minutes</div>
          </div>

          <p style="margin:0 0 8px; font-size:13px; color:#9A9A9A; text-align:center;">If you didn't request this code, please ignore this email.</p>
          <p style="margin:0; font-size:13px; color:#9A9A9A; text-align:center;">Do not share this code with anyone.</p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#F9F6F1; padding:24px 32px; border-radius:0 0 20px 20px; border:1px solid #E8E4DC; border-top:none; text-align:center;">
          <p style="margin:0; font-size:11px; color:#9A9A9A; letter-spacing:1px;">MADE WITH ❤️ BY MEDHA REVISION</p>
          <p style="margin:8px 0 0;">
            <a href="https://medha-revision.vercel.app" style="color:#7DC67A; text-decoration:none; font-size:12px; font-weight:600;">Visit Website</a>
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════
// @route   POST /api/auth/send-otp
// @desc    Send OTP to email for registration, login, or verification
// ═══════════════════════════════════════════════════════
router.post("/send-otp", async (req, res) => {
  try {
    const { email, type = "registration" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting: check cooldown
    const recentOtp = await Otp.findOne({
      email: normalizedEmail,
      createdAt: { $gt: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000) },
    });

    if (recentOtp) {
      const waitSeconds = Math.ceil(
        (OTP_COOLDOWN_SECONDS * 1000 - (Date.now() - recentOtp.createdAt.getTime())) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${waitSeconds}s before requesting another code`,
        retryAfter: waitSeconds,
      });
    }

    // For login type, check user exists
    if (type === "login") {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ message: "No account found with this email" });
      }
    }

    // Invalidate previous unused OTPs
    await Otp.updateMany(
      { email: normalizedEmail, used: false },
      { $set: { used: true } }
    );

    // Generate and save new OTP
    const code = generateOTP();
    await Otp.create({
      email: normalizedEmail,
      code,
      type,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: type === "login"
        ? "Your MEDHA Login Code 🔐"
        : "Verify Your Email — MEDHA ✉️",
      html: getOtpEmailHtml(code, type),
    });

    console.log(`✅ OTP sent to ${normalizedEmail} (type: ${type})`);
    res.json({ message: "Verification code sent to your email", expiresIn: OTP_EXPIRY_MINUTES * 60 });
  } catch (err) {
    console.error("❌ Send OTP error:", err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});

// ═══════════════════════════════════════════════════════
// @route   POST /api/auth/verify-otp
// @desc    Verify an OTP code (for registration / email verification)
// ═══════════════════════════════════════════════════════
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otp = await Otp.findOne({
      email: normalizedEmail,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res.status(400).json({ message: "Code expired or not found. Request a new one." });
    }

    // Check attempts
    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      otp.used = true;
      await otp.save();
      return res.status(400).json({ message: "Too many attempts. Request a new code." });
    }

    // Verify
    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({
        message: "Invalid code. Please try again.",
        attemptsLeft: MAX_OTP_ATTEMPTS - otp.attempts,
      });
    }

    // Mark used
    otp.used = true;
    await otp.save();

    console.log(`✅ OTP verified for ${normalizedEmail}`);
    res.json({ verified: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

// ═══════════════════════════════════════════════════════
// @route   POST /api/auth/login-otp
// @desc    Login via OTP (passwordless) — verify code then return token
// ═══════════════════════════════════════════════════════
router.post("/login-otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const otp = await Otp.findOne({
      email: normalizedEmail,
      type: "login",
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res.status(400).json({ message: "Code expired or not found. Request a new one." });
    }

    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      otp.used = true;
      await otp.save();
      return res.status(400).json({ message: "Too many attempts. Request a new code." });
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({
        message: "Invalid code",
        attemptsLeft: MAX_OTP_ATTEMPTS - otp.attempts,
      });
    }

    otp.used = true;
    await otp.save();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Mark email verified if not already
    if (!user.emailVerified) {
      user.emailVerified = true;
    }

    // Streak logic (same as password login)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = user.streak || 0;
    let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(Math.abs(today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    } else {
      streak = 1;
    }
    user.streak = streak;
    user.lastActiveDate = new Date();

    const todayStr = today.toISOString().split("T")[0];
    const alreadyLogged = user.activityHistory?.some(
      (d) => d.toISOString().split("T")[0] === todayStr
    );
    if (!alreadyLogged) {
      user.activityHistory = user.activityHistory || [];
      user.activityHistory.push(today);
    }

    if (user.avatarIndex === undefined || user.avatarIndex === null || user.avatarIndex < 0) {
      user.avatarIndex = 0;
    } else if (user.avatarIndex > 19) {
      user.avatarIndex = 19;
    }

    await user.save();

    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    console.log(`✅ OTP login successful for ${normalizedEmail}`);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        branch: user.branch,
        gender: user.gender,
        isAdmin: user.isAdmin,
        streak: user.streak,
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error("❌ OTP login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// @route     POST /api/auth/register
// @desc      Register a new user (alias of /signup)
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, emailVerified } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    user = new User({
      name,
      email,
      password: hashedPassword,
      emailVerified: emailVerified === true,
    });

    await user.save();
    console.log("✅ User saved to database:", user.email, emailVerified ? "(email verified)" : "");

    // Send welcome email - improved error handling
    sendWelcomeEmail(user)
      .then(() => {
        console.log("✅ Welcome email sent successfully to:", user.email);
      })
      .catch((emailError) => {
        console.error("❌ FAILED to send welcome email to:", user.email);
        console.error("Email error details:", emailError.message);
        console.error("Full error:", emailError);
      });

    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified || false,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    next(err);
  }
});

// @route     POST /api/auth/login
// @desc      Login a user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res
        .status(500)
        .json({ message: "Password not set for this user. Signup required." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Streak Logic - calculate and update based on login date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = user.streak || 0;
    let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        streak += 1;
      } else if (diffDays > 1) {
        // Missed a day or more - reset streak
        streak = 1;
      }
      // If diffDays === 0 (same day), keep current streak
    } else {
      // First time login or no previous record
      streak = 1;
    }

    // Update user with new streak and last active date
    user.streak = streak;
    user.lastActiveDate = new Date();
    
    // Record activity for calendar - add today if not already logged
    const todayStr = today.toISOString().split('T')[0];
    const alreadyLogged = user.activityHistory?.some(
      d => d.toISOString().split('T')[0] === todayStr
    );
    if (!alreadyLogged) {
      user.activityHistory = user.activityHistory || [];
      user.activityHistory.push(today);
    }
    
    // Defensive validation: Ensure avatarIndex is valid before saving
    // This prevents validation errors if database has invalid data
    if (user.avatarIndex === undefined || user.avatarIndex === null || user.avatarIndex < 0) {
      user.avatarIndex = 0;
    } else if (user.avatarIndex > 19) {
      user.avatarIndex = 19;
    }
    
    await user.save();

    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        branch: user.branch,
        gender: user.gender,
        isAdmin: user.isAdmin,
        streak: user.streak,
        emailVerified: user.emailVerified || false,
      },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: String(err) });
  }
});

// @route     POST /api/auth/change-password
// @desc      Change user password (requires current password)
router.post("/change-password", auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is wrong" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully!" });
  } catch (err) {
    next(err);
  }
});

// @route     GET /api/auth/me
// @desc      Get current logged-in user
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
