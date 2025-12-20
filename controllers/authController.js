const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

// Helper to create JWT (always with userId)
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email }, // Payload: userId
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = generateToken(user);

    // Streak Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = user.streak || 0;
    let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        streak += 1;
      } else if (diffDays > 1) {
        // Missed a day or more
        streak = 1;
      }
      // If diffDays === 0 (same day), do nothing
    } else {
      // First time login or no previous record
      streak = 1;
    }

    // Update user
    user.streak = streak;
    user.lastActiveDate = new Date();
    await user.save();

    return res.json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        university: user.university,
        branch: user.branch,
        gender: user.gender,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};
