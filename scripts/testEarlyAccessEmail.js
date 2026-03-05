/**
 * Test script to send CodeLearnn Early Access email to a specific user from the DB
 * Also logs to EmailLog so it appears in the admin panel history
 * Usage: node scripts/testEarlyAccessEmail.js
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const EmailLog = require('../models/EmailLog');
const { sendEarlyAccessEmail } = require('../utils/earlyAccessEmail');

async function main() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch the user from the database
    const targetEmail = 'rathoreayush512@gmail.com';
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`❌ No user found with email: ${targetEmail}`);
      process.exit(1);
    }

    console.log(`\n👤 Found user: ${user.name} (${user.email})`);
    console.log(`🚀 Sending CodeLearnn Early Access email...\n`);

    const result = await sendEarlyAccessEmail(user.email, user.name);
    if (result.success) {
      console.log('✅ Test email sent successfully! Check your inbox.');

      // Log the actual HTML to EmailLog so it appears correctly in admin panel
      const existingLog = await EmailLog.findOne({ subject: result.subject });

      if (existingLog) {
        existingLog.sentCount += 1;
        existingLog.totalRecipients += 1;
        existingLog.recipients = [...new Set([...existingLog.recipients, user.email.toLowerCase()])];
        existingLog.lastSentAt = Date.now();
        existingLog.htmlBody = result.html; // Update with actual HTML
        await existingLog.save();
      } else {
        await EmailLog.create({
          subject: result.subject,
          htmlBody: result.html, // Store actual rendered HTML
          sentCount: 1,
          totalRecipients: 1,
          recipients: [user.email.toLowerCase()],
          lastSentAt: Date.now(),
        });
      }
      console.log('📋 Email logged to admin panel history (with full HTML).');
    } else {
      console.log('❌ Failed to send test email.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

main();
