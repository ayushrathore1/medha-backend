// controllers/noteController.js
const Note = require("../models/Note");

// List notes (optionally filtered by subject/user)
exports.getNotes = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = { owner: req.user._id };
    if (subject) filter.subject = subject;
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload a note with file (PDF or Image) via Cloudinary
exports.uploadNote = async (req, res) => {
  try {
    const { title, subject } = req.body;
    const owner = req.user._id;
    if (!subject) {
      return res.status(400).json({ error: "Subject is required." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const note = new Note({
      title,
      subject,
      owner,
      fileUrl: file.path,
      fileType: file.mimetype,
      originalName: file.originalname,
      content: "",
      extractedText: "", // OCR logic can be handled separately
    });

    await note.save();
    res.status(201).json({ message: "Note uploaded successfully!", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a note from pasted text (no file)
exports.createTextNote = async (req, res) => {
  try {
    const { title, content, subject } = req.body;
    const owner = req.user._id; // Use _id attached by auth middleware

    if (!content || !subject) {
      return res
        .status(400)
        .json({ error: "Content and subject are required." });
    }

    const note = new Note({
      title,
      content,
      subject,
      owner,
      fileUrl: null,
      fileType: null,
      originalName: null,
      extractedText: content,
    });

    await note.save();
    res.status(201).json({ message: "Text note created successfully!", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update/Edit a note by ID - NEW FUNCTION
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, subject } = req.body;

    // Validate required fields
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required." });
    }

    if (!subject) {
      return res.status(400).json({ error: "Subject is required." });
    }

    // Find and update the note
    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: noteId,
        owner: req.user._id, // Ensure user owns the note
      },
      {
        title: title?.trim() || "",
        content: content.trim(),
        subject,
        extractedText: content.trim(), // Update extracted text as well for consistency
        updatedAt: new Date(),
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedNote) {
      return res.status(404).json({
        error: "Note not found or you don't have permission to update it.",
      });
    }

    res.json({
      message: "Note updated successfully!",
      note: updatedNote,
    });
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({
      error: "Server error updating note: " + err.message,
    });
  }
};

// Delete a note by ID
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({
      _id: noteId,
      owner: req.user._id,
    });
    if (!note) return res.status(404).json({ error: "Note not found." });
    res.json({ message: "Note deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOne({ _id: noteId, owner: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found." });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
