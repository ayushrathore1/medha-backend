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

// @route   GET /api/users/profile/:userId
// @desc    Get public profile data (info + stats)
// @access  Protected (requires auth to check follow status)
const Note = require("../models/Note");
const Follow = require("../models/Follow");

// @route   GET /api/users/search
// @desc    Search users by name/email for suggestions
// @access  Public (so guests can search too)
router.get("/search", async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ users: [] });

    // Assuming regular users, not just public ones? 
    // Profile visibility is not defined yet, but profiles seem public.
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("name email avatar avatarIndex university branch").limit(5);

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get("/profile/:userId", auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const user = await User.findById(userId).select("name email avatar avatarIndex university branch gender karma rank role customFlair createdAt");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parallel data fetching for performance
    const [notesCount, followersCount, followingCount, isFollowing] = await Promise.all([
      Note.countDocuments({ owner: userId, isPublic: true }),
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
      Follow.findOne({ follower: currentUserId, following: userId })
    ]);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        // Only show email domain/mask for privacy unless admin/same user? 
        // For now, let's just show it as is or maybe omitted if privacy is key.
        // User requested showing uploader, so maybe just name is enough.
        // Let's keep email for now as per Profile.jsx logic
        email: user.email, 
        avatar: user.avatar, // You might need getAvatarByIndex logic on backend or frontend
        avatarIndex: user.avatarIndex,
        university: user.university,
        branch: user.branch,
        gender: user.gender,
        karma: user.karma,
        rank: user.rank,
        role: user.role,
        customFlair: user.customFlair,
        createdAt: user.createdAt
      },
      stats: {
        notesShared: notesCount,
        followers: followersCount,
        following: followingCount
      },
      isFollowing: !!isFollowing
    });

  } catch (err) {
    next(err);
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Follow a user
// @access  Private
router.post("/:userId/follow", auth, async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const followerId = req.user.userId;

    // Can't follow yourself
    if (targetUserId === followerId.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: targetUserId,
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: targetUserId,
    });

    // Update follower/following counts
    await User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } });
    await User.updateOne({ _id: targetUserId }, { $inc: { followerCount: 1 } });

    const newFollowerCount = await Follow.countDocuments({ following: targetUserId });

    res.json({
      message: "Successfully followed user",
      followerCount: newFollowerCount,
      isFollowing: true,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/users/:userId/follow
// @desc    Unfollow a user
// @access  Private
router.delete("/:userId/follow", auth, async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const followerId = req.user.userId;

    // Check if following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: targetUserId,
    });

    if (!existingFollow) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove follow relationship
    await Follow.deleteOne({ _id: existingFollow._id });

    // Update follower/following counts
    await User.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } });
    await User.updateOne({ _id: targetUserId }, { $inc: { followerCount: -1 } });

    const newFollowerCount = await Follow.countDocuments({ following: targetUserId });

    res.json({
      message: "Successfully unfollowed user",
      followerCount: newFollowerCount,
      isFollowing: false,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/users/me
// @desc    Update profile info (name, college, year, branch, avatar)
// @access  Private
const cloudinary = require("../utils/cloudinary");

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
    
    // Handle Avatar Upload to Cloudinary
    if (avatar !== undefined) {
      if (avatar && avatar.startsWith("data:image")) {
        try {
           const uploadRes = await cloudinary.uploader.upload(avatar, {
             folder: "medha_avatars",
             width: 300,
             crop: "scale"
           });
           updates.avatar = uploadRes.secure_url;
        } catch (uploadErr) {
           console.error("Cloudinary Upload Error:", uploadErr);
           return res.status(500).json({ message: "Image upload failed" });
        }
      } else {
        // If empty string (remove avatar) or already a URL
        updates.avatar = avatar;
      }
    }

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
