const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const auth = require("../middleware/auth");

// Protected routes (require login)
router.use(auth);

// Join team via invitation code
router.post("/join", teamController.verifyTeamInvite);

module.exports = router;
