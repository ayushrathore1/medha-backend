const Subject = require("../models/Subject");

// Get all subjects for the logged-in user
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id }).sort({
      name: 1,
    });
    res.json({ subjects });
  } catch (err) {
    console.error("Get Subjects Error:", err);
    res.status(500).json({ message: "Error fetching subjects." });
  }
};

// Add a new subject for the logged-in user
exports.createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Subject name is required." });
    }
    // Enforce uniqueness, case-insensitive
    const existing = await Subject.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      user: req.user.id,
    });
    if (existing) {
      return res.status(409).json({ message: "Subject already exists." });
    }
    console.log("DEBUG: Creating subject with:", { name, user: req.user.id });

    const subject = await Subject.create({ name, user: req.user.id });
    res.status(201).json({ message: "Subject added.", subject });
  } catch (err) {
    console.error("Create Subject Error:", err);
    res.status(500).json({ message: "Error adding subject." });
  }
};

// Delete a subject by id
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subject.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Subject not found." });
    }
    res.json({ message: "Subject deleted." });
  } catch (err) {
    console.error("Delete Subject Error:", err);
    res.status(500).json({ message: "Error deleting subject." });
  }
};

// Edit/update a subject
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Subject name is required." });

    // Check for another subject with the new name (no duplicates)
    const exists = await Subject.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      user: req.user.id,
      _id: { $ne: id },
    });
    if (exists)
      return res.status(409).json({ message: "Subject name already in use." });

    const updated = await Subject.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { name },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Subject not found." });

    res.json({ message: "Subject updated.", subject: updated });
  } catch (err) {
    console.error("Update Subject Error:", err);
    res.status(500).json({ message: "Error updating subject." });
  }
};
