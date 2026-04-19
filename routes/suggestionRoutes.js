const express = require("express");
const router = express.Router();
const Suggestion = require("../models/Suggestion");

// ───────── PUBLIC: Submit a suggestion (NO auth required) ─────────
router.post("/", async (req, res) => {
  try {
    const { message, emoji } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ message: "Message too long (max 2000 chars)" });
    }

    const suggestion = await Suggestion.create({
      message: message.trim(),
      emoji: emoji || null,
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.status(201).json({ success: true, id: suggestion._id });
  } catch (error) {
    console.error("Error submitting suggestion:", error);
    res.status(500).json({ message: "Failed to submit suggestion" });
  }
});

// ───────── ADMIN: Get all suggestions ─────────
router.get("/admin/all", async (req, res) => {
  try {
    // Auth check — require admin token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || (user.role !== "admin" && user.role !== "team")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { status, isRead } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (isRead === "true") filter.isRead = true;
    if (isRead === "false") filter.isRead = false;

    const suggestions = await Suggestion.find(filter).sort({ createdAt: -1 });
    const stats = {
      total: await Suggestion.countDocuments(),
      unread: await Suggestion.countDocuments({ isRead: false }),
      new: await Suggestion.countDocuments({ status: "new" }),
      planned: await Suggestion.countDocuments({ status: "planned" }),
      done: await Suggestion.countDocuments({ status: "done" }),
    };

    res.json({ suggestions, stats });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
});

// ───────── ADMIN: Update a suggestion ─────────
router.patch("/admin/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || (user.role !== "admin" && user.role !== "team")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { status, isRead, adminNote } = req.body;
    const update = {};
    if (status) update.status = status;
    if (isRead !== undefined) update.isRead = isRead;
    if (adminNote !== undefined) update.adminNote = adminNote;

    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    res.json({ success: true, suggestion });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    res.status(500).json({ message: "Failed to update suggestion" });
  }
});

// ───────── ADMIN: Delete a suggestion ─────────
router.delete("/admin/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || (user.role !== "admin" && user.role !== "team")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Suggestion.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    res.status(500).json({ message: "Failed to delete suggestion" });
  }
});

module.exports = router;
