const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendWelcomeEmail } = require("./authExtraRoutes");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// @route     POST /api/auth/register
// @desc      Register a new user (alias of /signup)
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, emailVerified, clerkUserId } = req.body;

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

    user = new User({
      name,
      email,
      password: hashedPassword,
      // Clerk integration fields (optional - defaults to false/null if not provided)
      emailVerified: emailVerified === true,
      clerkUserId: clerkUserId || null,
    });

    await user.save();
    console.log("✅ User saved to database:", user.email, emailVerified ? "(email verified via Clerk)" : "");

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
