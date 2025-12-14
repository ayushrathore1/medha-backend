/**
 * Script to set admin status for the admin email
 * Run this once: node seed/setAdmin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = "rathoreayush512@gmail.com";

async function setAdmin() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { isAdmin: true },
      { new: true }
    );

    if (result) {
      console.log(`✅ Admin status set for: ${result.email}`);
      console.log(`   Name: ${result.name}`);
      console.log(`   isAdmin: ${result.isAdmin}`);
    } else {
      console.log(`❌ User not found: ${ADMIN_EMAIL}`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

setAdmin();
