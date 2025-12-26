const Follow = require("../models/Follow");
const User = require("../models/User");

/**
 * Follow a user
 */
exports.followUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.user._id;
    
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
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Error following user", error: error.message });
  }
};

/**
 * Unfollow a user
 */
exports.unfollowUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.user._id;
    
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
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Error unfollowing user", error: error.message });
  }
};

/**
 * Get followers of a user
 */
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const followers = await Follow.find({ following: userId })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('follower', 'charchaUsername avatarIndex karma rank customFlair')
      .lean();
    
    const total = await Follow.countDocuments({ following: userId });
    
    // Check if current user is following each
    let followingMap = {};
    if (req.user) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        following: { $in: followers.map(f => f.follower._id) },
      }).lean();
      myFollows.forEach(f => {
        followingMap[f.following.toString()] = true;
      });
    }
    
    const followerList = followers.map(f => ({
      ...f.follower,
      isFollowing: followingMap[f.follower._id.toString()] || false,
    }));
    
    res.json({
      followers: followerList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Error fetching followers", error: error.message });
  }
};

/**
 * Get users that a user is following
 */
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const following = await Follow.find({ follower: userId })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('following', 'charchaUsername avatarIndex karma rank customFlair')
      .lean();
    
    const total = await Follow.countDocuments({ follower: userId });
    
    // Check if current user is following each
    let followingMap = {};
    if (req.user) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        following: { $in: following.map(f => f.following._id) },
      }).lean();
      myFollows.forEach(f => {
        followingMap[f.following.toString()] = true;
      });
    }
    
    const followingList = following.map(f => ({
      ...f.following,
      isFollowing: followingMap[f.following._id.toString()] || false,
    }));
    
    res.json({
      following: followingList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Error fetching following", error: error.message });
  }
};

/**
 * Check if current user is following another user
 */
exports.checkFollowing = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.user._id;
    
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: targetUserId,
    });
    
    res.json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error("Check following error:", error);
    res.status(500).json({ message: "Error checking follow status", error: error.message });
  }
};
