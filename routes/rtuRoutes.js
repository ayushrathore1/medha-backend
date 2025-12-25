const express = require("express");
const router = express.Router();
const rtuController = require("../controllers/rtuController");
const rtuWeightageController = require("../controllers/rtuWeightageController");
const questionImageController = require("../controllers/questionImageController");
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// GET /api/rtu/3rd-sem
// Fetches (and creates if needed) the default RTU 3rd Sem subject and topics
router.get("/3rd-sem", authMiddleware, rtuController.getRTU3rdSemTopics);

// GET /api/rtu/subjects/:subjectName/years
// Returns available years for a subject
router.get("/subjects/:subjectName/years", authMiddleware, rtuWeightageController.getAvailableYears);

// GET /api/rtu/subjects/:subjectName/years/:year/weightage
// Returns unit weightage data for a specific year
router.get("/subjects/:subjectName/years/:year/weightage", authMiddleware, rtuWeightageController.getUnitWeightage);

// ============================================================================
// QUESTION IMAGE ROUTES (Admin Only)
// ============================================================================

// GET /api/rtu/imagekit-auth
// Returns ImageKit authentication parameters for frontend upload
router.get("/imagekit-auth", authMiddleware, adminAuth, questionImageController.getImageKitAuth);

// POST /api/rtu/subjects/:subjectName/years/:year/units/:unitSerial/questions/:qCode/image
// Upload or replace question image
router.post(
  "/subjects/:subjectName/years/:year/units/:unitSerial/questions/:qCode/image",
  authMiddleware,
  adminAuth,
  questionImageController.uploadQuestionImage
);

// DELETE /api/rtu/subjects/:subjectName/years/:year/units/:unitSerial/questions/:qCode/image
// Delete question image
router.delete(
  "/subjects/:subjectName/years/:year/units/:unitSerial/questions/:qCode/image",
  authMiddleware,
  adminAuth,
  questionImageController.deleteQuestionImage
);

module.exports = router;

