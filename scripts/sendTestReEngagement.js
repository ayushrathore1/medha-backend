/**
 * Send a test re-engagement email to a specific user.
 * Looks up the user's name from the database — NOT hardcoded.
 *
 * Usage: node scripts/sendTestReEngagement.js <email>
 * Example: node scripts/sendTestReEngagement.js rathoreayush512@gmail.com
 */
require("dotenv").config();
const mongoose = require("mongoose");
const React = require("react");
const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");
const { ReEngagementEmail } = require("../emails/ReEngagementEmail");
const { renderEmail } = require("../emails/renderEmail");

const SUBJECT = "yo — we built something. wanna help shape it? 👀";

async function main() {
  const targetEmail = process.argv[2];
  if (!targetEmail) {
    console.error("Usage: node scripts/sendTestReEngagement.js <email>");
    process.exit(1);
  }

  // Connect to MongoDB
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Look up user by email
  const user = await User.findOne({ email: targetEmail.toLowerCase() }).lean();
  if (!user) {
    console.error(`❌ No user found with email: ${targetEmail}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  const firstName = user.name ? user.name.split(" ")[0] : null;
  console.log(`👤 Found user: ${user.name} (${user.email})`);
  console.log(`📧 Will greet as: "${firstName || 'hey you'}"`);

  // Render personalized email
  const html = await renderEmail(
    React.createElement(ReEngagementEmail, { name: firstName })
  );
  console.log(`📄 Rendered HTML: ${html.length} chars`);

  // Send it
  const info = await sendEmail({
    to: user.email,
    subject: SUBJECT,
    html,
  });

  console.log(`✅ Email sent to ${user.email}! Message ID: ${info.messageId}`);

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  mongoose.connection.close().then(() => process.exit(1));
});
