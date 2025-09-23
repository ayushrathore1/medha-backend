const express = require("express");
const router = express.Router();

const Subject = require("../models/Subject");
const auth = require("../middleware/auth");

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Private
router.post("/", auth, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    // Check for duplicate subject for this user
    const existing = await Subject.findOne({ name, user: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: "Subject already exists" });
    }
    const subject = new Subject({
      name,
      description,
      user: req.user.userId,
    });
    await subject.save();
    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/subjects
// @desc    Get all subjects for the logged-in user
// @access  Private
router.get("/", auth, async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user.userId }).sort({
      name: 1,
    });
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/subjects/:id
// @desc    Get a specific subject by ID
// @access  Private
router.get("/:id", auth, async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json({ subject });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject (name/description)
// @access  Private
router.put("/:id", auth, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    // Check for duplicate subject name for this user (excluding current subject)
    const existing = await Subject.findOne({
      name,
      user: req.user.userId,
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Subject with this name already exists" });
    }
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { name, description, updatedAt: Date.now() },
      { new: true }
    );
    if (!subject) {
      return res
        .status(404)
        .json({ message: "Subject not found or unauthorized" });
    }
    res.json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject
// @access  Private
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!subject) {
      return res
        .status(404)
        .json({ message: "Subject not found or unauthorized" });
    }
    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
