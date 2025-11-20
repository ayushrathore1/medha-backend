const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

router.get("/stats", auth, dashboardController.getDashboardStats);
router.post("/plan", auth, dashboardController.generateDailyPlan);
router.get("/plan", auth, dashboardController.getDailyPlan);

module.exports = router;
