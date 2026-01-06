const User = require("../models/User");
const TeamInvitation = require("../models/TeamInvitation");

exports.verifyTeamInvite = async (req, res) => {
  const { code, email } = req.body; // Email might come from body or req.user

  if (!code) {
    return res.status(400).json({ message: "Invitation code is required." });
  }

  try {
    // 1. Find the invitation
    // We strictly check the code. Checking email is optional but recommended for security.
    // If email is provided in body, check against it. Else check against logged in user.
    const userEmail = req.user.email;
    
    // Find valid invitation
    const invitation = await TeamInvitation.findOne({
      code: code,
      used: false,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation code." });
    }

    // 2. Validate Email Mismatch
    // The invitation was sent to a specific email. The user claiming it MUST be logged in as that email.
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ message: `This code belongs to ${invitation.email}, but you are logged in as ${userEmail}.` });
    }

    // 3. Update User Role
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === 'team' || user.role === 'admin') {
      return res.status(400).json({ message: "You are already a team member." });
    }

    user.role = 'team';
    await user.save();

    // 4. Mark invitation as used
    invitation.used = true;
    await invitation.save();

    res.json({ message: "Welcome to the team! verification successful.", role: user.role });

  } catch (error) {
    console.error("Error verifying invitation:", error);
    res.status(500).json({ message: "Verification failed." });
  }
};
