require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html, from }) {
  await transporter.sendMail({
    from: from || `Medha <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
module.exports = { sendEmail };
