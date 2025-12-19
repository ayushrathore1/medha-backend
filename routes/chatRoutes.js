const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// ==================== USER & ADMIN ROUTES ====================

// Get all conversations for current user
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { participants: req.userId },
        { isBroadcast: true, broadcastRecipients: req.userId }
      ]
    })
      .populate("participants", "name email avatar isAdmin")
      .populate("lastMessage.sender", "name")
      .sort({ "lastMessage.timestamp": -1 })
      .lean();

    // Transform conversations for frontend
    const transformedConversations = conversations.map(conv => {
      const unreadCount = conv.unreadCount?.get?.(req.userId.toString()) || 
                          conv.unreadCount?.[req.userId.toString()] || 0;
      return {
        ...conv,
        unreadCount,
        otherParticipant: conv.participants.find(p => p._id.toString() !== req.userId.toString())
      };
    });

    res.json({ success: true, conversations: transformedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages in a conversation
router.get("/conversations/:id/messages", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is part of conversation or if it's a broadcast they received
    const isParticipant = conversation.participants.some(p => p.toString() === req.userId.toString());
    const isBroadcastRecipient = conversation.isBroadcast && 
      conversation.broadcastRecipients.some(r => r.toString() === req.userId.toString());
    
    if (!isParticipant && !isBroadcastRecipient) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await ChatMessage.find({ conversation: req.params.id })
      .populate("sender", "name email avatar isAdmin")
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read by this user
    await ChatMessage.updateMany(
      { 
        conversation: req.params.id,
        sender: { $ne: req.userId },
        readBy: { $ne: req.userId }
      },
      { $addToSet: { readBy: req.userId } }
    );

    // Reset unread count for this user in conversation
    await Conversation.findByIdAndUpdate(req.params.id, {
      $set: { [`unreadCount.${req.userId}`]: 0 }
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message in a conversation
router.post("/conversations/:id/messages", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is part of conversation
    const isParticipant = conversation.participants.some(p => p.toString() === req.userId.toString());
    const isBroadcastRecipient = conversation.isBroadcast && 
      conversation.broadcastRecipients.some(r => r.toString() === req.userId.toString());
    
    if (!isParticipant && !isBroadcastRecipient) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get current user info
    const currentUser = await User.findById(req.userId);

    // Non-admin users cannot send messages in broadcast/announcement conversations
    if (conversation.isBroadcast && !currentUser.isAdmin) {
      return res.status(403).json({ error: "Only admin can send messages in announcements" });
    }

    // For regular users in normal conversations, check they can only message admin
    if (!currentUser.isAdmin && !conversation.isBroadcast) {
      const otherParticipant = conversation.participants.find(p => p.toString() !== req.userId.toString());
      const other = await User.findById(otherParticipant);
      if (!other?.isAdmin) {
        return res.status(403).json({ error: "You can only message the admin" });
      }
    }

    // Create the message
    const message = new ChatMessage({
      conversation: req.params.id,
      sender: req.userId,
      text: text.trim(),
      readBy: [req.userId],
      isBroadcast: conversation.isBroadcast,
    });
    await message.save();

    // Update conversation's last message and increment unread for other participants
    const updateObj = {
      lastMessage: {
        text: text.trim().substring(0, 100),
        sender: req.userId,
        timestamp: new Date(),
      }
    };

    // Increment unread count for all other participants
    const otherParticipants = conversation.participants.filter(p => p.toString() !== req.userId.toString());
    for (const participantId of otherParticipants) {
      updateObj[`unreadCount.${participantId}`] = (conversation.unreadCount?.get?.(participantId.toString()) || 0) + 1;
    }

    await Conversation.findByIdAndUpdate(req.params.id, { $set: updateObj });

    // Populate and return the message
    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("sender", "name email avatar isAdmin")
      .lean();

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Start new conversation (admin can start with anyone, users can only start with admin)
router.post("/conversations", auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }

    const currentUser = await User.findById(req.userId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Non-admin users can only message admin
    if (!currentUser.isAdmin && !recipient.isAdmin) {
      return res.status(403).json({ error: "You can only message the admin" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] },
      isBroadcast: false,
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.userId, recipientId],
        unreadCount: new Map(),
        isBroadcast: false,
      });
      await conversation.save();
    }

    // Populate and return
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatar isAdmin")
      .lean();

    res.status(201).json({ success: true, conversation: populatedConversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get unread message count for current user
router.get("/unread-count", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { participants: req.userId },
        { isBroadcast: true, broadcastRecipients: req.userId }
      ]
    }).lean();

    let totalUnread = 0;
    for (const conv of conversations) {
      const count = conv.unreadCount?.[req.userId.toString()] || 0;
      totalUnread += count;
    }

    res.json({ success: true, unreadCount: totalUnread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// Mark message as read
router.patch("/messages/:id/read", auth, async (req, res) => {
  try {
    const message = await ChatMessage.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.userId } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

// Get admin user info (for regular users to start conversation)
router.get("/get-admin", auth, async (req, res) => {
  try {
    const admin = await User.findOne({ isAdmin: true })
      .select("_id name email avatar")
      .lean();
    
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ success: true, admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ error: "Failed to fetch admin" });
  }
});

// ==================== ADMIN ONLY ROUTES ====================

// Get all users for admin contact list
router.get("/admin/users", auth, adminAuth, async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = { _id: { $ne: req.userId } }; // Exclude self
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email avatar college branch year createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Broadcast message to all users
router.post("/broadcast", auth, adminAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    // Get all non-admin users
    const users = await User.find({ isAdmin: { $ne: true } }).select("_id").lean();
    const userIds = users.map(u => u._id);

    if (userIds.length === 0) {
      return res.status(400).json({ error: "No users to broadcast to" });
    }

    // Create or find broadcast conversation
    let broadcastConv = await Conversation.findOne({ isBroadcast: true });
    
    if (!broadcastConv) {
      broadcastConv = new Conversation({
        participants: [req.userId],
        isBroadcast: true,
        broadcastRecipients: userIds,
        unreadCount: new Map(),
      });
    } else {
      // Update recipients to include any new users
      broadcastConv.broadcastRecipients = [...new Set([...broadcastConv.broadcastRecipients.map(id => id.toString()), ...userIds.map(id => id.toString())])].map(id => id);
    }

    // Create the broadcast message
    const message = new ChatMessage({
      conversation: broadcastConv._id,
      sender: req.userId,
      text: text.trim(),
      readBy: [req.userId],
      isBroadcast: true,
    });

    // Update unread count for all recipients
    const unreadMap = new Map();
    for (const userId of userIds) {
      const currentCount = broadcastConv.unreadCount?.get?.(userId.toString()) || 0;
      unreadMap.set(userId.toString(), currentCount + 1);
    }
    broadcastConv.unreadCount = unreadMap;

    // Update last message
    broadcastConv.lastMessage = {
      text: text.trim().substring(0, 100),
      sender: req.userId,
      timestamp: new Date(),
    };

    await broadcastConv.save();
    await message.save();

    res.status(201).json({ 
      success: true, 
      message: "Broadcast sent to all users",
      recipientCount: userIds.length 
    });
  } catch (error) {
    console.error("Error broadcasting message:", error);
    res.status(500).json({ error: "Failed to broadcast message" });
  }
});

// Delete a message (admin only)
router.delete("/messages/:id", auth, adminAuth, async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const conversationId = message.conversation;

    // Delete the message
    await ChatMessage.findByIdAndDelete(req.params.id);

    // Update the conversation's last message if this was the last one
    const latestMessage = await ChatMessage.findOne({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .populate("sender", "name")
      .lean();

    if (latestMessage) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: latestMessage.text.substring(0, 100),
          sender: latestMessage.sender._id,
          timestamp: latestMessage.createdAt,
        }
      });
    } else {
      // No messages left in conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: "",
          sender: null,
          timestamp: new Date(),
        }
      });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Get admin contact list with conversation preview
router.get("/admin/contacts", auth, adminAuth, async (req, res) => {
  try {
    // Get all users except admin
    const users = await User.find({ isAdmin: { $ne: true } })
      .select("name email avatar college branch year createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Get existing conversations
    const conversations = await Conversation.find({
      participants: req.userId,
      isBroadcast: false,
    }).lean();

    // Map users with their conversation info
    const contacts = users.map(user => {
      const conv = conversations.find(c => 
        c.participants.some(p => p.toString() === user._id.toString())
      );
      return {
        ...user,
        hasConversation: !!conv,
        conversationId: conv?._id,
        lastMessage: conv?.lastMessage,
        unreadCount: conv?.unreadCount?.[req.userId.toString()] || 0,
      };
    });

    res.json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

module.exports = router;
