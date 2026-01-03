const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
require('dotenv').config();

// Load environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_EMAIL = process.env.SMTP_EMAIL || 'ayushrathore.work@gmail.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

async function sendTestEmail() {
  try {
    if (!SMTP_PASSWORD) {
      console.error('❌ SMTP_PASSWORD is not set in .env file');
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD
      }
    });

    // Read template
    const templatePath = path.join(__dirname, '../templates/welcome.html');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    // Compile template with test data
    const html = template({
      name: "Ayush"
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Medha Revision" <${SMTP_EMAIL}>`,
      to: "ayushrathore.work@gmail.com", // Sending to self for testing
      subject: "Welcome to Medha Revision! 🎉",
      html: html
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

sendTestEmail();
