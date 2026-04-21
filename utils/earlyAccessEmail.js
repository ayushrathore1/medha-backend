const React = require('react');
const { sendEmail } = require('./sendEmail');
const { EarlyAccessEmail } = require('../emails/EarlyAccessEmail');
const { renderEmail } = require('../emails/renderEmail');

/**
 * Send CodeLearnn Announcement + Vibe Coding Guide Email to Medha Revision users
 * @param {string} email - Recipient email
 * @param {string} userName - Optional recipient name for greeting
 * @returns {Promise<boolean>} - Success status
 */
const sendEarlyAccessEmail = async (email, userName) => {
  const subject = "📖 Free Vibe Coding Guide + CodeLearnn Early Access for Medha Users!";

  try {
    // Render React Email component to HTML
    const html = await renderEmail(
      React.createElement(EarlyAccessEmail, { name: userName })
    );

    const mailOptions = {
      to: email,
      subject,
      html,
    };

    const info = await sendEmail(mailOptions);
    console.log(`✉️  Early access email sent to ${email} (${info.messageId})`);
    return { success: true, html, subject };
  } catch (error) {
    console.error('Early access email send error:', error);
    return { success: false };
  }
};

module.exports = {
  sendEarlyAccessEmail
};
