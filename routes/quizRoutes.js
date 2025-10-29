const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const auth = require("../middleware/auth");

// Manual creation from frontend MCQs
router.post("/", auth, quizController.createQuiz);
// AI Generation
router.post("/generate-ai", auth, quizController.generateAIQuiz);
// List quizzes, filtered
router.get("/", auth, quizController.getQuizzes);
// Read one quiz (details)
router.get("/:id", auth, quizController.getQuizById);
// Attempt/submit answers
router.post("/:id/attempt", auth, quizController.attemptQuiz);
// View quiz results/attempts
router.get("/:id/results", auth, quizController.quizResults);
// Update quiz (optional, put)
router.put("/:id", auth, quizController.updateQuiz);
router.delete("/:id", auth, quizController.deleteQuiz);

module.exports = router;
