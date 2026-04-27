/**
 * 📧 Bulk Sem4 Notification Email Sender
 * 
 * Fetches all users from the database, renders a personalized
 * Sem4NotificationEmail for each user (with their name), and sends it.
 * 
 * Usage:
 *   node scripts/sendSem4Notification.js              # dry-run (preview only)
 *   node scripts/sendSem4Notification.js --send        # actually send emails
 *   node scripts/sendSem4Notification.js --send --to=email@example.com  # send to one user only (test)
 *   node scripts/sendSem4Notification.js --send --limit=10              # send to first N users
 *   node scripts/sendSem4Notification.js --send --exclude=emails.txt    # skip emails listed in file
 */

require('dotenv').config();
const mongoose = require('mongoose');
const React = require('react');
const h = React.createElement;
const { renderEmail } = require('../emails/renderEmail');
const { Sem4NotificationEmail } = require('../emails/Sem4NotificationEmail');
const { sendEmail } = require('../utils/sendEmail');
const User = require('../models/User');

const fs = require('fs');
const path = require('path');

// ── Config ──
const BATCH_SIZE = 1;           // send 1 at a time (Gmail rate limit safe)
const DELAY_BETWEEN_BATCHES_MS = 3000; // 3s pause between sends (avoid Gmail rate limits)
const SUBJECT = "📢 4th Sem just dropped on Medha — exam timetable + PYQ analysis inside 🚀";

// ── Helpers ──
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getFirstName(fullName) {
  if (!fullName) return null;
  return fullName.trim().split(/\s+/)[0];
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const shouldSend = args.includes('--send');
  const toFlag = args.find(a => a.startsWith('--to='));
  const limitFlag = args.find(a => a.startsWith('--limit='));
  const excludeFlag = args.find(a => a.startsWith('--exclude='));
  const singleEmail = toFlag ? toFlag.split('=')[1] : null;
  const limit = limitFlag ? parseInt(limitFlag.split('=')[1]) : null;

  // Load exclude list if provided
  let excludeSet = new Set();
  if (excludeFlag) {
    const excludePath = excludeFlag.split('=')[1];
    const fullPath = path.resolve(process.cwd(), excludePath);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').map(l => l.trim().toLowerCase()).filter(Boolean);
      excludeSet = new Set(lines);
      console.log(`🚫 Excluding ${excludeSet.size} emails from ${excludePath}`);
    }
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   📧 Medha — 4th Sem Notification Sender     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  if (!shouldSend) {
    console.log('⚠️  DRY RUN MODE — no emails will be sent.');
    console.log('   Add --send flag to actually send emails.');
    console.log('');
  }

  // Connect to MongoDB
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');
  console.log('');

  // Fetch users
  let query = {};
  if (singleEmail) {
    query = { email: singleEmail };
    console.log(`🎯 Targeting single user: ${singleEmail}`);
  }

  let usersQuery = User.find(query).select('name email').sort({ createdAt: -1 });
  if (limit && !singleEmail) {
    usersQuery = usersQuery.limit(limit);
    console.log(`🔢 Limiting to ${limit} users`);
  }

  let users = await usersQuery.lean();

  // Filter out excluded emails
  if (excludeSet.size > 0) {
    const before = users.length;
    users = users.filter(u => !excludeSet.has(u.email.toLowerCase()));
    console.log(`🚫 Filtered: ${before} → ${users.length} users (excluded ${before - users.length})`);
  }

  if (users.length === 0) {
    console.log('❌ No users found matching criteria.');
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`👥 Found ${users.length} user(s) to notify:`);
  console.log('');

  // Show user list
  users.forEach((u, i) => {
    console.log(`   ${String(i + 1).padStart(3)}. ${(u.name || 'Unknown').padEnd(25)} ${u.email}`);
  });
  console.log('');

  if (!shouldSend) {
    // Dry run — just render one preview
    const sample = users[0];
    const firstName = getFirstName(sample.name);
    const html = await renderEmail(h(Sem4NotificationEmail, { name: firstName }));
    console.log(`📝 Sample render for "${sample.name}" (${sample.email}):`);
    console.log(`   HTML length: ${html.length} chars`);
    console.log(`   Subject: ${SUBJECT}`);
    console.log('');
    console.log('✅ Dry run complete. Use --send to actually send.');
    await mongoose.connection.close();
    process.exit(0);
  }

  // ── Send emails in batches ──
  console.log(`📤 Sending ${users.length} emails (batch size: ${BATCH_SIZE})...`);
  console.log('');

  let sent = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(users.length / BATCH_SIZE);

    console.log(`── Batch ${batchNum}/${totalBatches} ──`);

    const promises = batch.map(async (user) => {
      try {
        const firstName = getFirstName(user.name);

        // Render personalized email
        const html = await renderEmail(
          h(Sem4NotificationEmail, { name: firstName })
        );

        // Send
        await sendEmail({
          to: user.email,
          subject: SUBJECT,
          html: html,
        });

        sent++;
        console.log(`   ✅ [${sent}/${users.length}] ${user.email} (${user.name || 'Unknown'})`);
      } catch (err) {
        failed++;
        failures.push({ email: user.email, error: err.message });
        console.log(`   ❌ ${user.email} — ${err.message}`);
      }
    });

    await Promise.all(promises);

    // Delay between batches to avoid SMTP rate limits
    if (i + BATCH_SIZE < users.length) {
      console.log(`   ⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // ── Summary ──
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║                  SUMMARY                     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`   ✅ Sent:   ${sent}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total:  ${users.length}`);

  if (failures.length > 0) {
    console.log('');
    console.log('   Failed emails:');
    failures.forEach(f => {
      console.log(`   • ${f.email} — ${f.error}`);
    });
  }

  console.log('');
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  mongoose.connection.close().then(() => process.exit(1));
});
