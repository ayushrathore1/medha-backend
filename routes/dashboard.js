const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

router.get("/stats", auth, dashboardController.getDashboardStats);
router.post("/plan", auth, dashboardController.generateDailyPlan);
router.get("/plan", auth, dashboardController.getDailyPlan);

// Public endpoint - no auth required for daily quote (accessible during tours/guest mode)
router.get("/quote", dashboardController.getDailyQuote);

module.exports = router;
