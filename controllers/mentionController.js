const Mention = require("../models/Mention");
const User = require("../models/User");
const { searchUsersByUsername } = require("../utils/usernameGenerator");

/**
 * Get mentions for current user
 */
exports.getMentions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { mentionedUser: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const mentions = await Mention.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('mentioner', 'charchaUsername avatarIndex')
      .populate({
        path: 'sourceId',
        select: 'title content',
      })
      .lean();
    
    const total = await Mention.countDocuments(query);
    const unreadCount = await Mention.countDocuments({
      mentionedUser: userId,
      isRead: false,
    });
    
    res.json({
      mentions,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get mentions error:", error);
    res.status(500).json({ message: "Error fetching mentions", error: error.message });
  }
};

/**
 * Mark mentions as read
 */
exports.markMentionsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mentionIds } = req.body;
    
    if (mentionIds && mentionIds.length > 0) {
      await Mention.updateMany(
        { _id: { $in: mentionIds }, mentionedUser: userId },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await Mention.updateMany(
        { mentionedUser: userId, isRead: false },
        { isRead: true }
      );
    }
    
    res.json({ message: "Mentions marked as read" });
  } catch (error) {
    console.error("Mark mentions read error:", error);
    res.status(500).json({ message: "Error marking mentions as read", error: error.message });
  }
};

/**
 * Get @admin mentions (Admin only)
 */
exports.getAdminMentions = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { isAdminMention: true };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const mentions = await Mention.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('mentioner', 'charchaUsername avatarIndex name email')
      .populate({
        path: 'sourceId',
        select: 'title content',
      })
      .lean();
    
    const total = await Mention.countDocuments(query);
    const unreadCount = await Mention.countDocuments({
      isAdminMention: true,
      isRead: false,
    });
    
    res.json({
      mentions,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get admin mentions error:", error);
    res.status(500).json({ message: "Error fetching admin mentions", error: error.message });
  }
};

/**
 * Mark admin mentions as read (Admin only)
 */
exports.markAdminMentionsRead = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const { mentionIds } = req.body;
    
    if (mentionIds && mentionIds.length > 0) {
      await Mention.updateMany(
        { _id: { $in: mentionIds }, isAdminMention: true },
        { isRead: true }
      );
    } else {
      await Mention.updateMany(
        { isAdminMention: true, isRead: false },
        { isRead: true }
      );
    }
    
    res.json({ message: "Admin mentions marked as read" });
  } catch (error) {
    console.error("Mark admin mentions read error:", error);
    res.status(500).json({ message: "Error marking admin mentions as read", error: error.message });
  }
};

/**
 * Search users for @mention autocomplete
 */
exports.searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({ users: [] });
    }
    
    const users = await searchUsersByUsername(q, parseInt(limit));
    
    // Add admin as option if query starts with 'a'
    const results = [...users];
    if ('admin'.startsWith(q.toLowerCase())) {
      results.unshift({
        charchaUsername: 'admin',
        name: 'Admin',
        avatarIndex: -1,
        isAdmin: true,
      });
    }
    
    res.json({ users: results });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};
