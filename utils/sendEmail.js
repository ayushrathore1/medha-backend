require("dotenv").config();
const nodemailer = require("nodemailer");

const port = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration on startup (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP Configuration Error:", error);
    } else {
      console.log("✅ SMTP Server is ready to send emails");
    }
  });
}

async function sendEmail({ to, subject, html, from }) {
  try {
    // Generate plain text version for better deliverability
    const text = html 
      ? html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').trim() 
      : undefined;

    const info = await transporter.sendMail({
      from: from || `Medha <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text, // Required for better deliverability (avoids Spam folder)
      replyTo: process.env.SMTP_USER,
    });
    console.log("✅ Email sent successfully. Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = { sendEmail };
