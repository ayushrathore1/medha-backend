/**
 * Script to fix invalid avatarIndex values in User collection
 * Problem: Some users have avatarIndex = -1, but schema requires min: 0
 * Solution: Update all users with invalid avatarIndex to 0 (default value)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

async function fixAvatarIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with invalid avatarIndex
    const invalidUsers = await User.find({
      $or: [
        { avatarIndex: { $lt: 0 } },
        { avatarIndex: { $gt: 19 } },
        { avatarIndex: null },
        { avatarIndex: { $exists: false } }
      ]
    }).select('_id name email avatarIndex');

    console.log(`\n📊 Found ${invalidUsers.length} users with invalid avatarIndex values:\n`);
    
    if (invalidUsers.length > 0) {
      console.log('Users to be updated:');
      invalidUsers.forEach(user => {
        console.log(`  - ${user.email}: avatarIndex = ${user.avatarIndex}`);
      });

      // Update all invalid avatarIndex values to 0
      const result = await User.updateMany(
        {
          $or: [
            { avatarIndex: { $lt: 0 } },
            { avatarIndex: { $gt: 19 } },
            { avatarIndex: null },
            { avatarIndex: { $exists: false } }
          ]
        },
        { $set: { avatarIndex: 0 } },
        { runValidators: false } // Skip validation during migration
      );

      console.log(`\n✅ Successfully updated ${result.modifiedCount} users`);
      console.log(`   - Matched: ${result.matchedCount}`);
      console.log(`   - Modified: ${result.modifiedCount}`);

      // Verify the fix
      const stillInvalid = await User.countDocuments({
        $or: [
          { avatarIndex: { $lt: 0 } },
          { avatarIndex: { $gt: 19 } }
        ]
      });

      if (stillInvalid === 0) {
        console.log('\n✅ Verification passed: No users with invalid avatarIndex found');
      } else {
        console.log(`\n⚠️  Warning: ${stillInvalid} users still have invalid avatarIndex`);
      }
    } else {
      console.log('✅ No users with invalid avatarIndex found. Database is clean!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');
  }
}

fixAvatarIndex();
