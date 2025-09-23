const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// List notes (optionally by subject)
router.get("/", auth, noteController.getNotes);

// Upload a note (file upload)
router.post("/", auth, upload.single("file"), noteController.uploadNote);

// Create a text-only note
router.post("/text", auth, noteController.createTextNote);

// Update/Edit a note by ID
router.put("/:noteId", auth, noteController.updateNote);

// Delete a note by ID
router.delete("/:noteId", auth, noteController.deleteNote);

// Get a single note by ID
router.get("/:noteId", auth, noteController.getNoteById);

module.exports = router;
