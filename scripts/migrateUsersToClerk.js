/**
 * Migration Script: Migrate existing MongoDB users to Clerk
 * 
 * This script imports users with their existing bcrypt password hashes to Clerk,
 * allowing them to continue using their same passwords.
 * 
 * Usage: 
 *   1. Set CLERK_SECRET_KEY in your .env file
 *   2. Run: node scripts/migrateUsersToClerk.js
 * 
 * IMPORTANT: Run this only once! Running multiple times may cause duplicate errors.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { createClerkClient } = require("@clerk/backend");

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

// Use the ACTUAL User model from the project (not a simplified one)
const User = require("../models/User");

// Rate limiting: Clerk allows 100 req/10s for dev, 1000 req/10s for prod
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES_MS = 5000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrateUsers() {
  console.log("🚀 Starting user migration to Clerk...\n");

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  // Validate Clerk connection
  if (!process.env.CLERK_SECRET_KEY) {
    console.error("❌ CLERK_SECRET_KEY is not set in .env file");
    process.exit(1);
  }

  // Get all users who don't have a clerkUserId yet
  // Use .select("+password") because the User model has select:false on password
  const usersToMigrate = await User.find({ 
    clerkUserId: { $in: [null, "", undefined] }
  }).select("+password");

  console.log(`📊 Found ${usersToMigrate.length} users to migrate\n`);

  if (usersToMigrate.length === 0) {
    console.log("✨ All users are already migrated!");
    await mongoose.connection.close();
    process.exit(0);
  }

  // Debug: Check first user's data
  if (usersToMigrate.length > 0) {
    const sample = usersToMigrate[0];
    console.log("🔍 Sample user data:");
    console.log(`   Email: ${sample.email}`);
    console.log(`   Name: ${sample.name}`);
    console.log(`   Has password: ${!!sample.password}`);
    console.log(`   Password length: ${sample.password?.length || 0}`);
    console.log(`   Password starts with: ${sample.password?.substring(0, 10)}...`);
    console.log("");
  }

  let successCount = 0;
  let failCount = 0;
  const failures = [];

  // Process in batches
  for (let i = 0; i < usersToMigrate.length; i += BATCH_SIZE) {
    const batch = usersToMigrate.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(usersToMigrate.length / BATCH_SIZE)}`);

    for (const user of batch) {
      try {
        // Validate user has required data
        if (!user.email) {
          console.log(`  ⚠️  Skipping user with no email: ${user._id}`);
          continue;
        }

        if (!user.password) {
          console.log(`  ⚠️  Skipping user with no password: ${user.email}`);
          continue;
        }

        // Parse name into first/last
        const nameParts = (user.name || "User").trim().split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Create user in Clerk with existing bcrypt password hash
        // The password hash from bcrypt should be in format: $2a$... or $2b$...
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [user.email.toLowerCase().trim()],
          firstName: firstName,
          lastName: lastName,
          // Import the existing bcrypt hash - user can login with same password!
          passwordDigest: user.password,
          passwordHasher: "bcrypt",
          // Skip checks during migration (recommended by Clerk for migrations)
          skipLegalChecks: true,
          skipPasswordChecks: true,
        });

        // Update MongoDB user with Clerk ID
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              clerkUserId: clerkUser.id,
              emailVerified: true // Mark as verified since we're migrating
            }
          }
        );

        successCount++;
        console.log(`  ✅ Migrated: ${user.email} → ${clerkUser.id}`);

      } catch (err) {
        failCount++;
        
        // Get detailed error info
        let errorMsg = "Unknown error";
        let errorCode = "";
        
        if (err.errors && err.errors.length > 0) {
          errorCode = err.errors[0].code || "";
          errorMsg = err.errors[0].longMessage || err.errors[0].message || errorMsg;
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        // Check if user already exists in Clerk
        if (errorCode === "form_identifier_exists") {
          console.log(`  ⚠️  Already exists in Clerk: ${user.email}`);
          
          // Try to find and link existing Clerk user
          try {
            const existingUsers = await clerkClient.users.getUserList({
              emailAddress: [user.email],
            });
            
            if (existingUsers.data.length > 0) {
              await User.updateOne(
                { _id: user._id },
                { $set: { clerkUserId: existingUsers.data[0].id } }
              );
              console.log(`     ↳ Linked to existing: ${existingUsers.data[0].id}`);
              successCount++;
              failCount--; // Undo the fail count
            }
          } catch (linkErr) {
            failures.push({ email: user.email, error: errorMsg });
          }
        } else {
          failures.push({ email: user.email, error: `${errorCode}: ${errorMsg}` });
          console.log(`  ❌ Failed: ${user.email}`);
          console.log(`     Error: ${errorCode}: ${errorMsg}`);
        }
      }
    }

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < usersToMigrate.length) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 MIGRATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  if (failures.length > 0) {
    console.log("\n⚠️  Failed users:");
    failures.forEach(f => console.log(`   - ${f.email}: ${f.error}`));
  }

  console.log("\n✨ Migration complete!");
  
  // Close connection
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed");
}

// Run migration
migrateUsers().catch(err => {
  console.error("💥 Migration failed:", err);
  process.exit(1);
});
