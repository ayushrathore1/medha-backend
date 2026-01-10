const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const auth = require("../middleware/auth");
const teamAuth = require("../middleware/teamAuth");

// Protected routes (require login)
router.use(auth);

// Join team via invitation code (any authenticated user)
router.post("/join", teamController.verifyTeamInvite);

// ============================================
// TEAM DASHBOARD ROUTES (requires team/admin role)
// ============================================

// Check if user has team access
router.get("/check", teamAuth, teamController.checkTeamAccess);

// Get all users (team members can view but with limited info)
router.get("/users", teamAuth, teamController.getTeamUsers);

// Get team members list
router.get("/members", teamAuth, teamController.getTeamMembers);

module.exports = router;
