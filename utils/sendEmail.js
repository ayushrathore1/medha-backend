require("dotenv").config();
const nodemailer = require("nodemailer");

// Check env vars
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error(
    "⚠️  WARNING: SMTP_USER or SMTP_PASS not set in environment variables!"
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Configuration Error:", error.message);
    console.error("Please check your SMTP credentials in .env file");
  } else {
    console.log("✅ SMTP Server ready to send emails");
    console.log(`📧 Configured email: ${process.env.SMTP_USER}`);
  }
});

async function sendEmail({ to, subject, html, from }) {
  try {
    const info = await transporter.sendMail({
      from: from || `Medha <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] MessageID: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendEmail };
