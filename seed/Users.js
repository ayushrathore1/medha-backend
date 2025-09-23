require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// MongoDB URI from .env or direct
const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medha_seed";

async function seedUsers() {
  try {
    await mongoose.connect(mongoURI);

    // Clear Users collection
    await User.deleteMany({});

    // Password to hash (all demo users get the same password for simplicity)
    const password = await bcrypt.hash("password123", 10);

    // Demo users to insert
    const users = [
      { name: "Ayush Rathore", email: "ayush@example.com", password },
      { name: "Demo User", email: "demo@example.com", password },
      { name: "Second Student", email: "student2@example.com", password },
    ];

    await User.insertMany(users);

    console.log("✅ Users seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedUsers();
