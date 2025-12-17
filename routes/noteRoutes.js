const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Get all public notes (explore feature) - must be before /:noteId
router.get("/public", auth, noteController.getPublicNotes);

// List user's own notes (optionally by subject)
router.get("/", auth, noteController.getNotes);

// Upload a note (file upload)
router.post("/", auth, upload.single("file"), noteController.uploadNote);

// Create a text-only note
router.post("/text", auth, noteController.createTextNote);

// Toggle note visibility (public/private)
router.patch("/:noteId/visibility", auth, noteController.toggleVisibility);

// Toggle Like
router.post("/:noteId/like", auth, noteController.toggleLike);

// Update/Edit a note by ID
router.put("/:noteId", auth, noteController.updateNote);

// Delete a note by ID
router.delete("/:noteId", auth, noteController.deleteNote);

// Get a single note by ID
router.get("/:noteId", auth, noteController.getNoteById);

module.exports = router;
