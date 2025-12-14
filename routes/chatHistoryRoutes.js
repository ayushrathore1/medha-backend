const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ChatSession = require("../models/ChatSession");

// Get all chat sessions for user (sorted by most recent)
router.get("/sessions", auth, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .lean();
    
    // Add message count and last message preview
    const sessionsWithMeta = sessions.map(session => ({
      _id: session._id,
      title: session.title,
      messageCount: session.messages?.length || 0,
      lastMessage: session.messages?.length > 0 
        ? session.messages[session.messages.length - 1].content.substring(0, 50) + "..."
        : null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
    
    res.json(sessionsWithMeta);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

// Get single session with all messages
router.get("/sessions/:sessionId", auth, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
    });
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Create new chat session
router.post("/sessions", auth, async (req, res) => {
  try {
    const session = new ChatSession({
      user: req.user._id,
      title: req.body.title || "New Chat",
      messages: [],
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Update session title
router.patch("/sessions/:sessionId", auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.sessionId, user: req.user._id },
      { title },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// Delete session
router.delete("/sessions/:sessionId", auth, async (req, res) => {
  try {
    const result = await ChatSession.findOneAndDelete({
      _id: req.params.sessionId,
      user: req.user._id,
    });
    
    if (!result) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// Clear all sessions for user
router.delete("/sessions", auth, async (req, res) => {
  try {
    await ChatSession.deleteMany({ user: req.user._id });
    res.json({ message: "All sessions cleared" });
  } catch (error) {
    console.error("Error clearing sessions:", error);
    res.status(500).json({ error: "Failed to clear sessions" });
  }
});

// Add message to session (called internally or via API)
router.post("/sessions/:sessionId/messages", auth, async (req, res) => {
  try {
    const { role, content } = req.body;
    
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.sessionId, user: req.user._id },
      { 
        $push: { messages: { role, content } },
        // Auto-generate title from first user message if still "New Chat"
        ...(role === "user" && { 
          $set: { 
            title: await generateTitle(req.params.sessionId, content) 
          } 
        })
      },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// Helper to generate title from first message
async function generateTitle(sessionId, content) {
  const session = await ChatSession.findById(sessionId);
  if (session && session.title === "New Chat" && session.messages.length === 0) {
    // Take first 30 chars of first user message as title
    return content.substring(0, 30) + (content.length > 30 ? "..." : "");
  }
  return session?.title || "New Chat";
}

module.exports = router;
