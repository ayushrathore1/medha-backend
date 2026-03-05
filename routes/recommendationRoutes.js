const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const ApprovedChannel = require("../models/ApprovedChannel");
const SearchHistory = require("../models/SearchHistory");
const Syllabus = require("../models/Syllabus");
const {
  getRecommendations,
  TRENDING_TOPICS,
} = require("../utils/recommendationService");

// ─── POST /search — Smart lecture search ────────────────────
router.post("/search", authMiddleware, async (req, res) => {
  try {
    const { topic, subject, unit } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid topic (at least 2 characters)",
      });
    }

    const sanitizedTopic = topic.trim().substring(0, 100);

    const results = await getRecommendations(
      sanitizedTopic,
      subject || "",
      unit || ""
    );

    // Log search to history
    try {
      await SearchHistory.create({
        userId: req.user?._id,
        query: sanitizedTopic,
        subject: subject || "",
        unit: unit || "",
        resultCount: results.totalResults,
      });
    } catch (logErr) {
      console.warn("[Lectures] Failed to log search:", logErr.message);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("[Lectures] Search error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lecture recommendations. Please try again.",
    });
  }
});

// ─── GET /trending — Trending topics ────────────────────────
router.get("/trending", async (req, res) => {
  try {
    res.json({ success: true, topics: TRENDING_TOPICS });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch trending topics" });
  }
});

// ─── GET /subjects — All subjects from syllabus ─────────────
router.get("/subjects", async (req, res) => {
  try {
    const syllabi = await Syllabus.find({}, "subjectName subjectCode semester").lean();
    const subjects = syllabi.map((s) => ({
      name: s.subjectName,
      code: s.subjectCode,
      semester: s.semester,
    }));
    res.json({ success: true, subjects });
  } catch (error) {
    console.error("[Lectures] Subjects error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch subjects" });
  }
});

// ─── GET /units/:subjectName — Units for a subject ──────────
router.get("/units/:subjectName", async (req, res) => {
  try {
    const { subjectName } = req.params;
    const syllabus = await Syllabus.findOne({
      subjectName: { $regex: new RegExp(subjectName, "i") },
    }).lean();

    if (!syllabus) {
      return res.json({ success: true, units: [] });
    }

    const units = (syllabus.units || []).map((u) => ({
      unitNumber: u.unitNumber,
      title: u.title,
      topics: u.topics || [],
    }));

    res.json({ success: true, units, subjectName: syllabus.subjectName });
  } catch (error) {
    console.error("[Lectures] Units error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch units" });
  }
});

// ─── GET /channels — List all approved channels ─────────────
router.get("/channels", authMiddleware, async (req, res) => {
  try {
    const channels = await ApprovedChannel.find()
      .sort({ priority: -1, channelName: 1 })
      .lean();
    res.json({ success: true, channels });
  } catch (error) {
    console.error("[Lectures] Channels error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch channels" });
  }
});

// ─── POST /channels — Add approved channel ──────────────────
router.post("/channels", authMiddleware, async (req, res) => {
  try {
    const { channelId, channelName, channelUrl, subjectTags, priority, notes } = req.body;

    if (!channelId || !channelName || !channelUrl) {
      return res.status(400).json({
        success: false,
        message: "channelId, channelName, and channelUrl are required",
      });
    }

    const channel = await ApprovedChannel.create({
      channelId,
      channelName,
      channelUrl,
      subjectTags: subjectTags || [],
      priority: priority || 5,
      notes: notes || "",
    });

    res.status(201).json({ success: true, channel });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Channel already exists" });
    }
    console.error("[Lectures] Add channel error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add channel" });
  }
});

// ─── PATCH /channels/:id — Update channel ───────────────────
router.patch("/channels/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};
    const allowed = ["channelName", "channelUrl", "subjectTags", "priority", "isActive", "notes"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const channel = await ApprovedChannel.findByIdAndUpdate(id, update, { new: true });
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    res.json({ success: true, channel });
  } catch (error) {
    console.error("[Lectures] Update channel error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update channel" });
  }
});

// ─── DELETE /channels/:id — Remove channel ──────────────────
router.delete("/channels/:id", authMiddleware, async (req, res) => {
  try {
    const channel = await ApprovedChannel.findByIdAndDelete(req.params.id);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }
    res.json({ success: true, message: "Channel removed" });
  } catch (error) {
    console.error("[Lectures] Delete channel error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete channel" });
  }
});

module.exports = router;
