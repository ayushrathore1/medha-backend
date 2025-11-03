// testMail.js
require("dotenv").config();
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS);

const { sendEmail } = require("./utils/sendEmail");
sendEmail({
  to: "rathoreayush512@gmail.com",
  subject: "Nodemailer Self-Test",
  html: "<b>Hello! It's me, the mail works!</b>",
})
  .then(() => console.log("Sent!"))
  .catch(console.error);
``;
