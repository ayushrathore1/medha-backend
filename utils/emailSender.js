const nodemailer = require("nodemailer");

// Read configuration from environment variables
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
  process.env;

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || "smtp.gmail.com",
  port: EMAIL_PORT ? Number(EMAIL_PORT) : 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Send an email (async function)
// options: { to, subject, text, html }
async function sendEmail(options) {
  return transporter.sendMail({
    from: EMAIL_FROM || `"MEDHA" <${EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html, // optional: use either text or html
  });
}

module.exports = sendEmail;
