const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// ==================== USER ROUTES ====================

// Create a new message (feedback/feature request/bug report)
router.post("/", auth, async (req, res) => {
  try {
    const { type, subject, message, priority } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ error: "Subject and message are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newMessage = new Message({
      user: req.userId,
      userName: user.name,
      userEmail: user.email,
      type: type || "general",
      subject,
      message,
      priority: priority || "medium",
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get user's own messages
router.get("/my-messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all messages (admin only)
router.get("/admin/all", auth, adminAuth, async (req, res) => {
  try {
    const { status, type, isRead, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const skip = (page - 1) * limit;

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments(filter);
    const unreadCount = await Message.countDocuments({ isRead: false });

    res.json({
      success: true,
      messages,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get message stats (admin only)
router.get("/admin/stats", auth, adminAuth, async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });
    const pendingMessages = await Message.countDocuments({ status: "pending" });
    const featureRequests = await Message.countDocuments({
      type: "feature_request",
    });
    const bugReports = await Message.countDocuments({ type: "bug_report" });

    res.json({
      success: true,
      stats: {
        total: totalMessages,
        unread: unreadMessages,
        pending: pendingMessages,
        featureRequests,
        bugReports,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Mark message as read (admin only)
router.patch("/admin/:id/read", auth, adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Update message status (admin only)
router.patch("/admin/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const message = await Message.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete message (admin only)
router.delete("/admin/:id", auth, adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Check if current user is admin or team member
router.get("/check-admin", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const hasAccess =
      user?.isAdmin || user?.role === "admin" || user?.role === "team";
    res.json({
      isAdmin: hasAccess,
      isFullAdmin: user?.isAdmin || user?.role === "admin",
      role: user?.role || "user",
    });
  } catch (error) {
    res.json({ isAdmin: false, isFullAdmin: false, role: "user" });
  }
});

module.exports = router;
