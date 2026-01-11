const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// ============================================
// PUBLIC ROUTES (require auth but open to all users)
// ============================================

// GET /api/practice/questions - Get all questions with filters
router.get("/questions", authMiddleware, practiceController.getAllQuestions);

// GET /api/practice/questions/:id - Get a specific question
router.get(
  "/questions/:id",
  authMiddleware,
  practiceController.getQuestionById
);

// GET /api/practice/categories - Get categories with counts
router.get("/categories", authMiddleware, practiceController.getCategories);

// POST /api/practice/execute - Execute C/C++ code
router.post("/execute", authMiddleware, practiceController.executeCode);

// POST /api/practice/questions/:id/submit - Submit solution for a question
router.post(
  "/questions/:id/submit",
  authMiddleware,
  practiceController.submitSolution
);

// POST /api/practice/questions/:id/hint - Get hint for a question
router.post("/questions/:id/hint", authMiddleware, practiceController.getHint);

// GET /api/practice/questions/:id/solution - Get solution (marks as viewed)
router.get(
  "/questions/:id/solution",
  authMiddleware,
  practiceController.getSolution
);

// GET /api/practice/stats - Get user's practice statistics
router.get("/stats", authMiddleware, practiceController.getUserStats);

// ============================================
// ADMIN ROUTES
// ============================================

// POST /api/practice/admin/questions - Create new question
router.post(
  "/admin/questions",
  authMiddleware,
  adminAuth,
  practiceController.createQuestion
);

// PUT /api/practice/admin/questions/:id - Update question
router.put(
  "/admin/questions/:id",
  authMiddleware,
  adminAuth,
  practiceController.updateQuestion
);

// DELETE /api/practice/admin/questions/:id - Delete question (soft delete)
router.delete(
  "/admin/questions/:id",
  authMiddleware,
  adminAuth,
  practiceController.deleteQuestion
);

module.exports = router;
