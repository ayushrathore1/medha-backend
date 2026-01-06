const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// All routes here are protected by auth AND adminAuth
router.use(auth);
router.use(adminAuth);

// Get all users
router.get("/users", adminController.getAllUsers);

// Send Email
router.post("/send-email", adminController.sendAdminEmail);

// Generate Email Content (AI)
router.post("/generate-email", adminController.generateEmailContent);

// Delete user (admin only)
router.delete('/users/:id', adminController.deleteUser);

// Team management (admin only)
router.put('/users/:id/role', adminController.updateUserRole);

// Get team members 
router.get('/team', adminController.getTeamMembers);

// Invite Team Member
router.post('/invite-team', adminController.inviteTeamMember);

// Get Email History
router.get("/history", adminController.getEmailHistory);

module.exports = router;
