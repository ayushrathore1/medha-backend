const express = require("express");
const router = express.Router();
const rtuController = require("../controllers/rtuController");
const rtuWeightageController = require("../controllers/rtuWeightageController");
const authMiddleware = require("../middleware/auth");

// GET /api/rtu/3rd-sem
// Fetches (and creates if needed) the default RTU 3rd Sem subject and topics
router.get("/3rd-sem", authMiddleware, rtuController.getRTU3rdSemTopics);

// GET /api/rtu/subjects/:subjectName/years
// Returns available years for a subject
router.get("/subjects/:subjectName/years", authMiddleware, rtuWeightageController.getAvailableYears);

// GET /api/rtu/subjects/:subjectName/years/:year/weightage
// Returns unit weightage data for a specific year
router.get("/subjects/:subjectName/years/:year/weightage", authMiddleware, rtuWeightageController.getUnitWeightage);

module.exports = router;
