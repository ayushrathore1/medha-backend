const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const React = require("react");

const User = require("../models/User");
const Otp = require("../models/Otp");
const auth = require("../middleware/auth");
const { sendWelcomeEmail } = require("./authExtraRoutes");
const { sendEmail } = require("../utils/sendEmail");
const { OtpEmail } = require("../emails/OtpEmail");
const { renderEmail } = require("../emails/renderEmail");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

// ── Generate 6-digit OTP ──
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
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

    // Render React Email component to HTML
    const html = await renderEmail(
      React.createElement(OtpEmail, { code, type, expiryMinutes: OTP_EXPIRY_MINUTES })
    );

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: type === "login"
        ? "Your MEDHA Login Code 🔐"
        : "Verify Your Email — MEDHA ✉️",
      html,
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

    let user = await User.findOne({ email }).select("+password");
    if (user) {
      // If user exists via Google but has no password, let them add one
      if (user.googleId && !user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.authProvider = "both";
        if (name) user.name = name;
        await user.save();

        const payload = { userId: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).json({
          message: "Password added to your Google account. You can now use both methods.",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified || false,
          },
        });
      }
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
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
        .status(401)
        .json({ message: "This account uses Google sign-in. Please click 'Continue with Google' to log in." });
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

// ═══════════════════════════════════════════════════════
// @route   GET /api/auth/google
// @desc    Redirect to Google OAuth2 consent screen
// ═══════════════════════════════════════════════════════
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: "Google OAuth is not configured" });
  }

  const redirectUri = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`;
  const scope = encodeURIComponent("openid email profile");
  const state = crypto.randomBytes(16).toString("hex"); // CSRF protection

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`;

  res.redirect(googleAuthUrl);
});

// ═══════════════════════════════════════════════════════
// @route   GET /api/auth/google/callback
// @desc    Google OAuth2 callback — exchange code, find/create user, redirect
// ═══════════════════════════════════════════════════════
router.get("/google/callback", async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=google_no_code`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("❌ Google token exchange failed:", tokenData);
      return res.redirect(`${frontendUrl}/login?error=google_token_failed`);
    }

    // 2. Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();
    if (!profile.email) {
      return res.redirect(`${frontendUrl}/login?error=google_no_email`);
    }

    const normalizedEmail = profile.email.toLowerCase().trim();
    const googleId = profile.id;

    // 3. Find-or-create user logic (handles account linking)
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    }).select("+password");

    if (user) {
      // ── Existing user ──
      if (!user.googleId) {
        // User registered via email/password — link their Google account
        user.googleId = googleId;
        user.authProvider = user.password ? "both" : "google";
        user.emailVerified = true;
        // Use Google avatar if user doesn't have one
        if (!user.avatar && profile.picture) {
          user.avatar = profile.picture;
        }
      }
      // If user already has googleId, just log them in (no changes needed)
    } else {
      // ── Brand new user via Google ──
      user = new User({
        name: profile.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId,
        authProvider: "google",
        emailVerified: true,
        avatar: profile.picture || "",
      });

      // Send welcome email (fire-and-forget)
      sendWelcomeEmail(user).catch((err) => {
        console.error("❌ Welcome email failed for Google user:", err.message);
      });
    }

    // 4. Update streak & activity (same logic as password login)
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

    // 5. Generate JWT
    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // 6. Redirect to frontend with token & user data
    const userData = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        branch: user.branch,
        gender: user.gender,
        isAdmin: user.isAdmin,
        streak: user.streak,
        emailVerified: true,
        avatar: user.avatar,
      })
    );

    console.log(`✅ Google login successful for ${normalizedEmail}`);
    const redirectUrl = `${frontendUrl}/auth/google/success?token=${token}` + String.fromCharCode(38) + `user=${userData}`;
    console.log(`🔗 Redirecting to: ${redirectUrl.substring(0, 80)}...`);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Google OAuth error:", err);
    res.redirect(`${frontendUrl}/login?error=google_server_error`);
  }
});

module.exports = router;
