// controllers/noteController.js
const Note = require("../models/Note");
const mongoose = require("mongoose");

// List user's own notes (optionally filtered by subject)
exports.getNotes = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = { owner: req.user._id };

    if (subject) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ error: "Invalid subject ID format." });
      }
      filter.subject = subject;
    }

    const notes = await Note.find(filter)
      .populate("owner", "name email")
      .populate("subject", "name")
      .sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all public notes (for explore/discover feature)
exports.getPublicNotes = async (req, res) => {
  try {
    const { search, subject } = req.query;
    const filter = { isPublic: true };
    
    if (subject) {
      filter.subject = subject;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter)
      .populate("owner", "name email")
      .populate("subject", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle note visibility (public/private)
exports.toggleVisibility = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await Note.findOne({ _id: noteId, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ error: "Note not found or not owned by you." });
    }
    
    note.isPublic = !note.isPublic;
    await note.save();
    
    res.json({ 
      message: `Note is now ${note.isPublic ? 'public' : 'private'}`,
      note 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload a note with file (PDF or Image) via Cloudinary
exports.uploadNote = async (req, res) => {
  try {
    const { title, subject } = req.body;
    const owner = req.user._id;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }
    
    if (!subject) {
      return res.status(400).json({ error: "Subject is required." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const note = new Note({
      title: title.trim(),
      subject,
      owner,
      fileUrl: file.path,
      fileType: file.mimetype,
      originalName: file.originalname,
      content: req.body.content || "",
      extractedText: req.body.content || "",
      isPublic: false, // Private by default
    });

    await note.save();
    
    // Populate owner info before returning
    await note.populate("owner", "name email");
    
    res.status(201).json({ message: "Note uploaded successfully!", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a note from pasted text (no file)
exports.createTextNote = async (req, res) => {
  try {
    const { title, content, subject } = req.body;
    const owner = req.user._id;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!content || !subject) {
      return res
        .status(400)
        .json({ error: "Content and subject are required." });
    }

    const note = new Note({
      title: title.trim(),
      content,
      subject,
      owner,
      fileUrl: null,
      fileType: null,
      originalName: null,
      extractedText: content,
      isPublic: false, // Private by default
    });

    await note.save();
    await note.populate("owner", "name email");
    
    res.status(201).json({ message: "Text note created successfully!", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update/Edit a note by ID
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, subject, isPublic } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required." });
    }

    if (!subject) {
      return res.status(400).json({ error: "Subject is required." });
    }

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      subject,
      extractedText: content.trim(),
      updatedAt: new Date(),
    };
    
    // Only update isPublic if explicitly provided
    if (typeof isPublic === 'boolean') {
      updateData.isPublic = isPublic;
    }

    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: noteId,
        owner: req.user._id,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("owner", "name email");

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

// Get a single note by ID (owner or public)
exports.getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    // First try to find as owner
    let note = await Note.findOne({ _id: noteId, owner: req.user._id })
      .populate("owner", "name email")
      .populate("subject", "name");
    
    // If not owner, check if it's public
    if (!note) {
      note = await Note.findOne({ _id: noteId, isPublic: true })
        .populate("owner", "name email")
        .populate("subject", "name");
    }
    
    if (!note) return res.status(404).json({ error: "Note not found." });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
