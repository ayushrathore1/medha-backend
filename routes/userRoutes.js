// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const auth = require("../middleware/auth");

// @route   GET /api/users/stats
// @desc    Get public stats (total users) for welcome page
// @access  Public
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ totalUsers: 0 });
  }
});

// @route   GET /api/users/me
// @desc    Get current logged-in user's profile (excluding password)
// @access  Private
router.get("/me", auth, async (req, res, next) => {
  try {
    // req.user.userId is set by your JWT middleware!
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/users/activity-history
// @desc    Get user's activity history for calendar display
// @access  Private
router.get("/activity-history", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("activityHistory streak");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ 
      activityHistory: user.activityHistory || [],
      streak: user.streak || 0
    });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/users/me
// @desc    Update profile info (name, college, year, branch, avatar)
// @access  Private
router.patch("/me", auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, college, university, year, branch, gender, avatar, avatarIndex } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (college !== undefined) updates.college = college;
    if (university !== undefined) updates.university = university;
    if (year !== undefined) updates.year = year;
    if (branch !== undefined) updates.branch = branch;
    if (gender !== undefined) updates.gender = gender;
    if (avatar !== undefined) updates.avatar = avatar;
    if (avatarIndex !== undefined) updates.avatarIndex = avatarIndex;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user's password
// @access  Private
router.put("/change-password", auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/users/increment-notification-view
// @desc    Increment the feature notification view count
// @access  Private
router.post("/increment-notification-view", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.featureNotificationViews = (user.featureNotificationViews || 0) + 1;
    await user.save();

    res.json({ 
      success: true, 
      views: user.featureNotificationViews 
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/users/verify-email
// @desc    Mark user's email as verified (after Clerk verification for existing users)
// @access  Private
router.post("/verify-email", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark email as verified
    // Note: clerkUserId is deprecated - Clerk is only used for OTP delivery
    user.emailVerified = true;
    await user.save();

    console.log("✅ Email verified for user:", user.email);

    res.json({ 
      success: true, 
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    });
  } catch (err) {
    console.error("Email verification error:", err);
    next(err);
  }
});

// @route   DELETE /api/users/me
// @desc    Delete user account permanently
// @access  Private
router.delete("/me", auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { reason } = req.body || {};
    
    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log deletion with reason for analytics
    console.log("🗑️ Account deleted:", {
      email: user.email,
      reason: reason || "No reason provided",
      deletedAt: new Date().toISOString()
    });

    // Here you could also:
    // - Store reason in a separate analytics collection
    // - Send the reason to an analytics service
    // - Delete user's notes, chat history, etc.

    res.json({ 
      success: true, 
      message: "Account deleted successfully" 
    });
  } catch (err) {
    console.error("Account deletion error:", err);
    next(err);
  }
});

module.exports = router;
