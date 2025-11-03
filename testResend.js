require("dotenv").config();
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  try {
    console.log("SENDING MAIL...");
    await resend.emails.send({
      from: "Medha <onmedha@onresend.com>",
      to: "rathoreayush512@gmail.com",
      subject: "TEST MAIL",
      html: "<b>Test message from Resend</b>",
    });
    console.log("Mail sent!");
  } catch (e) {
    console.error("Resend error:", e);
  }
})();
