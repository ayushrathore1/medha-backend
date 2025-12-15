// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const auth = require("../middleware/auth");

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

// @route   PATCH /api/users/me
// @desc    Update profile info (name, college, year, branch, avatar)
// @access  Private
router.patch("/me", auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, college, year, branch, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (college !== undefined) updates.college = college;
    if (year !== undefined) updates.year = year;
    if (branch !== undefined) updates.branch = branch;
    if (avatar !== undefined) updates.avatar = avatar;

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

module.exports = router;
