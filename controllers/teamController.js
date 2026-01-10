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
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "Invalid or expired invitation code." });
    }

    // 2. Validate Email Mismatch
    // The invitation was sent to a specific email. The user claiming it MUST be logged in as that email.
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return res
        .status(403)
        .json({
          message: `This code belongs to ${invitation.email}, but you are logged in as ${userEmail}.`,
        });
    }

    // 3. Update User Role
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "team" || user.role === "admin") {
      return res
        .status(400)
        .json({ message: "You are already a team member." });
    }

    user.role = "team";
    await user.save();

    // 4. Mark invitation as used
    invitation.used = true;
    await invitation.save();

    res.json({
      message: "Welcome to the team! verification successful.",
      role: user.role,
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    res.status(500).json({ message: "Verification failed." });
  }
};

// Check if user has team access
exports.checkTeamAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email role isAdmin"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasAccess =
      user.role === "team" || user.role === "admin" || user.isAdmin;

    res.json({
      hasAccess,
      role: user.role,
      isAdmin: user.isAdmin || false,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error checking team access:", error);
    res.status(500).json({ message: "Failed to check team access" });
  }
};

// Get all users (for team dashboard - limited fields)
exports.getTeamUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "name email emailVerified university college branch year role createdAt"
      )
      .lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users for team:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get team members only
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({
      $or: [{ role: "team" }, { role: "admin" }, { isAdmin: true }],
    })
      .select("name email role isAdmin createdAt")
      .lean();

    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};
