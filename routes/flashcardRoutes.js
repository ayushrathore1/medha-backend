const express = require("express");
const router = express.Router();
const flashcardController = require("../controllers/flashcardController");
const auth = require("../middleware/auth");

// Manual creation
router.post("/", auth, flashcardController.createFlashcard);

// AI generation
router.post("/generate-ai", auth, flashcardController.generateAIFlashcards);

// Get all flashcards (optionally filter by note/subject)
router.get("/", auth, flashcardController.getFlashcards);

// Get a single flashcard by ID
router.get("/:id", auth, flashcardController.getFlashcardById);

// Update a flashcard by ID
router.put("/:id", auth, flashcardController.updateFlashcard);

// Delete a flashcard by ID
router.delete("/:id", auth, flashcardController.deleteFlashcard);

module.exports = router;
