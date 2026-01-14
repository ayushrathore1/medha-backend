// controllers/noteController.js
const Note = require("../models/Note");
const User = require("../models/User");
const mongoose = require("mongoose");
const notifications = require("./notificationController");

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
    
    // Use aggregation for searching by owner name
    const pipeline = [
      { $match: { isPublic: true } },
      // Lookup owner details
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerData"
        }
      },
      { $unwind: { path: "$ownerData", preserveNullAndEmptyArrays: true } },
      // Lookup subject details
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectData"
        }
      },
      { $unwind: { path: "$subjectData", preserveNullAndEmptyArrays: true } },
    ];
    
    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
            { subjectTag: { $regex: search, $options: "i" } },
            { "ownerData.name": { $regex: search, $options: "i" } },
            { "ownerData.email": { $regex: search, $options: "i" } },
          ]
        }
      });
    }
    
    // Add subject filter if provided
    if (subject) {
      const mongoose = require("mongoose");
      pipeline.push({
        $match: { subject: new mongoose.Types.ObjectId(subject) }
      });
    }
    
    // Project the final shape
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          subjectTag: 1,
          fileUrl: 1,
          fileType: 1,
          originalName: 1,
          extractedText: 1,
          likes: 1,
          isPublic: 1,
          createdAt: 1,
          owner: {
            _id: "$ownerData._id",
            name: "$ownerData.name",
            email: "$ownerData.email",
            avatar: "$ownerData.avatar"
          },
          subject: {
            _id: "$subjectData._id",
            name: "$subjectData.name"
          }
        }
      }
    );
    
    const notes = await Note.aggregate(pipeline);
    
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
    const { title, subject, subjectTag, isPublic } = req.body;
    const owner = req.user._id;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }
    
    // Support both old subject ObjectId and new subjectTag
    if (!subject && !subjectTag) {
      return res.status(400).json({ error: "Subject or subject tag is required." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const noteData = {
      title: title.trim(),
      owner,
      fileUrl: file.path,
      fileType: file.mimetype,
      originalName: file.originalname,
      content: req.body.content || "",
      extractedText: req.body.content || "",
      isPublic: isPublic === 'true' || isPublic === true, // Support string or boolean
    };

    // Set either subject ref or subjectTag
    if (subjectTag) {
      noteData.subjectTag = subjectTag.trim();
    } else if (subject) {
      noteData.subject = subject;
    }

    const note = new Note(noteData);
    await note.save();
    
    // Populate owner info before returning
    await note.populate("owner", "name email avatar");
    
    res.status(201).json({ message: "Note uploaded successfully!", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a note from pasted text (no file)
exports.createTextNote = async (req, res) => {
  try {
    const { title, content, subject, subjectTag } = req.body;
    const owner = req.user._id;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required." });
    }

    // Support both old subject ObjectId and new subjectTag
    if (!subject && !subjectTag) {
      return res.status(400).json({ error: "Subject or subject tag is required." });
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      owner,
      fileUrl: null,
      fileType: null,
      originalName: null,
      extractedText: content.trim(),
      isPublic: false, // Private by default
    };

    // Set either subject ref or subjectTag
    if (subjectTag) {
      noteData.subjectTag = subjectTag.trim();
    } else if (subject) {
      noteData.subject = subject;
    }

    const note = new Note(noteData);
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
    const { title, content, subject, subjectTag, isPublic } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required." });
    }

    // Support both old subject ObjectId and new subjectTag
    if (!subject && !subjectTag) {
      return res.status(400).json({ error: "Subject or subject tag is required." });
    }

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      extractedText: content.trim(),
      updatedAt: new Date(),
    };

    // Set either subject ref or subjectTag
    if (subjectTag) {
      updateData.subjectTag = subjectTag.trim();
      updateData.subject = null; // Clear old subject ref if using tag
    } else if (subject) {
      updateData.subject = subject;
    }
    
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

// Toggle Like on a Note
exports.toggleLike = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(noteId).populate("owner", "name");
    
    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    // Check if user already liked this note (using efficient atomic logic check)
    // We check if userId exists in the likes array
    const isLiked = note.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      // Unlike: Atomic pull from both Note and User
      await Note.findByIdAndUpdate(noteId, { $pull: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { likedNotes: noteId } });
      
      // Update local note object for response
      note.likes = note.likes.filter(id => id.toString() !== userId.toString());
      
      return res.json({ 
        success: true, 
        isLiked: false, 
        likesCount: note.likes.length 
      });

    } else {
      // Like: Atomic addToSet to avoid duplicates in both Note and User
      await Note.findByIdAndUpdate(noteId, { $addToSet: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $addToSet: { likedNotes: noteId } });
      
      // Update local note object for response
      note.likes.push(userId);

      // Create notification for owner if not self-like
      if (note.owner && note.owner._id.toString() !== userId.toString()) {
        try {
          const liker = await User.findById(userId).select("name");
          const likerName = liker ? liker.name : "Someone";

          await notifications.createNotification({
             recipient: note.owner._id,
             type: "like",
             title: "New Like",
             message: `${likerName} liked your note "${note.title}"`,
             link: `/notes?view=${note._id}`,
             sender: userId
          });
        } catch (error) {
           console.error("Notification error:", error);
        }
      }

      return res.json({ 
        success: true, 
        isLiked: true, 
        likesCount: note.likes.length 
      });
    }

  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ error: err.message });
  }
};
