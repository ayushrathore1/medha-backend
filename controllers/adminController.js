const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const TeamInvitation = require("../models/TeamInvitation");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");

// Track in-flight email operations to prevent duplicate sends
const inFlightOperations = new Set();

// Get all users with relevant fields
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email emailVerified university createdAt")
      .lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Send email to users (All, Individual, or Unverified)
exports.sendAdminEmail = async (req, res) => {
  const { mode, targetUserId, subject, htmlBody } = req.body;
  // mode: 'all' | 'individual' | 'unverified'

  if (!subject || !htmlBody) {
    return res.status(400).json({ message: "Subject and Body are required." });
  }

  // Create a unique operation key to prevent duplicate sends
  const operationKey = `${mode}-${targetUserId || "bulk"}-${subject.substring(0, 50)}`;

  // Check if this operation is already in flight
  if (inFlightOperations.has(operationKey)) {
    console.log(`⚠️ Duplicate email operation blocked: ${operationKey}`);
    return res.status(409).json({
      message:
        "An email operation with the same parameters is already in progress. Please wait.",
    });
  }

  // Mark operation as in-flight
  inFlightOperations.add(operationKey);
  console.log(`📧 Starting email operation: ${operationKey}`);

  // Email delay configuration (in milliseconds)
  const EMAIL_DELAY_MS = 2000; // 2 seconds between emails to avoid rate limiting

  // Helper function for delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    let usersToSend = [];

    // 1. Determine Recipients
    if (mode === "individual") {
      if (!targetUserId) {
        return res
          .status(400)
          .json({ message: "Target User ID is required for individual mode." });
      }
      const user = await User.findById(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      usersToSend = [user];
    } else if (mode === "all") {
      usersToSend = await User.find({
        email: { $exists: true, $ne: null },
      }).select("name email");
    } else if (mode === "unverified") {
      // Only send to users with emailVerified = false or undefined
      usersToSend = await User.find({
        email: { $exists: true, $ne: null },
        $or: [{ emailVerified: false }, { emailVerified: { $exists: false } }],
      }).select("name email");
    } else {
      return res.status(400).json({
        message: "Invalid mode. Use 'all', 'individual', or 'unverified'.",
      });
    }

    // 2. Check for existing log and filter out already-sent recipients
    let existingLog = await EmailLog.findOne({ subject, htmlBody });
    let alreadySentEmails = new Set(existingLog?.recipients || []);

    // Filter out users who already received this exact email
    const originalCount = usersToSend.length;
    usersToSend = usersToSend.filter(
      (user) => !alreadySentEmails.has(user.email?.toLowerCase())
    );
    const skippedCount = originalCount - usersToSend.length;

    if (usersToSend.length === 0) {
      return res.json({
        message: `All ${originalCount} users have already received this email.`,
        details: { success: 0, failed: 0, skipped: skippedCount },
      });
    }

    console.log(
      `📧 Starting email send: ${usersToSend.length} recipients (${skippedCount} skipped as duplicates)`
    );

    // 3. Send Emails sequentially with delay
    let successCount = 0;
    let failureCount = 0;
    let successfulRecipients = [];

    for (let i = 0; i < usersToSend.length; i++) {
      const user = usersToSend[i];

      try {
        if (user.email && user.email.includes("@")) {
          const personalizedBody = htmlBody
            .replace(/\$\{userName\}/g, user.name || "Student")
            .replace(/{{name}}/g, user.name || "Student");

          await sendEmail({
            to: user.email,
            subject: subject,
            html: personalizedBody,
          });

          successCount++;
          successfulRecipients.push(user.email.toLowerCase());
          console.log(
            `✅ [${i + 1}/${usersToSend.length}] Sent to ${user.email}`
          );
        }
      } catch (err) {
        console.error(
          `❌ [${i + 1}/${usersToSend.length}] Failed to send to ${user.email}:`,
          err.message
        );
        failureCount++;

        // If rate limited (421 error), wait longer before next attempt
        if (err.responseCode === 421) {
          console.log(
            "⏳ Rate limited - waiting 30 seconds before continuing..."
          );
          await delay(30000);
        }
      }

      // Add delay between emails (except for the last one)
      if (i < usersToSend.length - 1) {
        await delay(EMAIL_DELAY_MS);
      }
    }

    // 4. Update Email Log with successful recipients
    try {
      if (existingLog) {
        existingLog.sentCount += 1;
        existingLog.totalRecipients += successCount;
        existingLog.recipients = [
          ...new Set([...existingLog.recipients, ...successfulRecipients]),
        ];
        existingLog.lastSentAt = Date.now();
        await existingLog.save();
      } else {
        await EmailLog.create({
          subject,
          htmlBody,
          sentCount: 1,
          totalRecipients: successCount,
          recipients: successfulRecipients,
          lastSentAt: Date.now(),
        });
      }
    } catch (logError) {
      console.error("Failed to log email history:", logError);
      // Don't block sending if logging fails
    }

    console.log(
      `📧 Email send complete: ${successCount} sent, ${failureCount} failed, ${skippedCount} skipped`
    );

    // Clear the in-flight operation lock
    inFlightOperations.delete(operationKey);

    return res.json({
      message: `Email process completed. Sent to ${successCount} users.`,
      details: {
        success: successCount,
        failed: failureCount,
        skipped: skippedCount,
      },
    });
  } catch (error) {
    console.error("Error in sendAdminEmail:", error);
    // Clear the in-flight operation lock on error
    inFlightOperations.delete(operationKey);
    res.status(500).json({ message: "Server error during email sending." });
  }
};

// Get Email History
exports.getEmailHistory = async (req, res) => {
  try {
    const history = await EmailLog.find().sort({ lastSentAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Error fetching email history:", error);
    res.status(500).json({ message: "Failed to fetch email history" });
  }
};

// Generate Email Content using AI
const PLATFORM_FEATURES = require("../data/platformFeatures");
const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.generateEmailContent = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const systemPrompt = `
  You are an expert Email Marketing Copywriter & UI Designer for Medha AI.
  
  YOUR GOAL: Generate a world-class, aesthetically stunning HTML email.
  
  CONTEXT & ASSETS:
  ${PLATFORM_FEATURES}
  
  DESIGN GUIDELINES (CRITICAL):
  1. **Structure**: Use a centered main container (max-width: 600px) with a white background, rounded corners (12px), and a subtle border/shadow.
  2. **Personalization (MANDATORY)**: You MUST include the greeting "Hi \${userName}," or "Hello \${userName}," at the very top.
  3. **Visuals & Placement (CRITICAL)**:
     - DO NOT dump all images at the bottom.
     - **Rule**: If you mention a feature (e.g., "Chatbot"), place the relevant image IMMEDIATELY after that paragraph.
     - **Image Styling**: Images MUST have \`width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0;\`.
  4. **Typography**: Use standard safe fonts (Helvetica, Arial, sans-serif) but style them to look modern (line-height: 1.6, clean hierarchy).
     - Headings: Bold, dark color (#1a1a1a).
     - Body: Readable grey (#4a4a4a), 16px.
  5. **Call to Action (CTA)**: Create beautiful, clickable buttons (e.g., background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; margin-top: 10px;).
  6. **Footer**: Include a professional footer with lighter text (12px, #888) and "Medha AI Team".
  
  OUTPUT FORMAT:
  Return a valid JSON object: { "subject": "Catchy Subject Line", "html": "Full HTML String" }.
  
  Admin's Request: "${prompt}"
  `;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        max_tokens: 2500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedContent = JSON.parse(
      response.data.choices[0].message.content
    );

    res.json({
      subject: generatedContent.subject,
      html: generatedContent.html,
    });
  } catch (error) {
    console.error("Error generating email content:", error);
    res.status(500).json({ message: "Failed to generate content with AI" });
  }
};

// Delete User and all associated data
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting the main admin
    if (user.email === "rathoreayush512@gmail.com") {
      return res
        .status(403)
        .json({ message: "Cannot delete the main admin account." });
    }

    // 3. Delete the user
    await User.findByIdAndDelete(id);

    res.json({
      message: `User ${user.name} (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "team", "admin"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Invalid role. Must be 'user', 'team', or 'admin'." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent demoting the main admin
    if (user.email === "rathoreayush512@gmail.com" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Cannot change role of the main admin." });
    }

    user.role = role;
    // Sync isAdmin flag for backward compatibility
    user.isAdmin = role === "admin";

    await user.save();

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res
      .status(500)
      .json({ message: "Failed to update role", error: error.message });
  }
};

// Get Team Members
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({
      role: { $in: ["team", "admin"] },
    }).select("name email role avatar university");
    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};

// Invite a new team member
exports.inviteTeamMember = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Check if user is already in the team
    const existingUser = await User.findOne({ email });
    if (
      existingUser &&
      (existingUser.role === "team" || existingUser.role === "admin")
    ) {
      return res
        .status(409)
        .json({ message: "User is already a team member or admin." });
    }

    // Generate 6-digit alphanumeric code
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Expiration: 48 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Save invitation
    await TeamInvitation.create({
      email,
      code,
      expiresAt,
      invitedBy: req.user._id, // Assuming admin is logged in
    });

    // Send email
    const joinLink = `https://medha-revision.vercel.app/join-team?email=${encodeURIComponent(email)}`;

    // Get first name or default
    const firstName = existingUser
      ? existingUser.name.split(" ")[0]
      : "Candidate";

    const htmlBody = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Join the MEDHA Team</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f2ede4; color: #1a1a1a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .main-card { background-color: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px); border-radius: 24px; border: 1px solid #e8e4dc; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
    .serif-header { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; font-weight: 800; font-size: 32px; letter-spacing: -0.05em; }
    .relatable-message { background-color: #ffffff; border: 1px solid #e8e4dc; border-radius: 16px; padding: 30px; margin: 25px 0; }
    @media screen and (max-width: 600px) {
        .email-container { width: 100% !important; border-radius: 0 !important; border: none !important; }
        .padding-mobile { padding: 30px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f2ede4;">
  <center style="width: 100%; table-layout: fixed; background-color: #f2ede4; padding-bottom: 50px;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      Ayush Rathore has invited you to join the MEDHA REVISION team! Use invite code ${code} to join.
    </div>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      <tr><td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td></tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container main-card" style="max-width: 600px;">
      <tr>
        <td align="center" style="padding: 40px 20px 0 20px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ff6b00;"></div>
            <span style="font-weight: 900; font-size: 24px; letter-spacing: -1px; color: #1a1a1a;">MEDHA</span>
          </div>
        </td>
      </tr>
      <tr>
        <td class="padding-mobile" style="padding: 30px 60px 40px 60px; font-size: 16px; line-height: 1.6; color: #4a4a4a; text-align: left;">
          <h1 class="serif-header" style="margin: 0 0 20px 0; text-align: center;">
            You're Invited!
          </h1>
          <p style="text-align: center; color: #4a4a4a; font-weight: 500;">
            Hi <strong>${firstName}</strong>,
          </p>
          <div class="relatable-message" style="text-align: center;">
            <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-family: 'Inter', sans-serif; line-height: 1.6;">
              <strong>Ayush Rathore</strong> is inviting you to join the <br/><span style="color: #ff6b00; font-weight: 800; letter-spacing: 0.5px;">MEDHA</span> team!
            </p>
          </div>
          <p style="text-align: center;">
            We're building a platform that helps college students prep faster for end-sem exams with the right resources and structure. Click below to accept the invitation.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${joinLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="text-align: center; margin: 0; font-size: 15px; color: #4a4a4a;">
            Or, use this invitation code if asked:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="background-color: #f9f9f9; color: #1a1a1a; border: 1px solid #e8e4dc; padding: 10px 24px; border-radius: 12px; font-family: monospace; font-size: 22px; font-weight: 700; letter-spacing: 4px;">${code}</span>
          </div>
          <p style="text-align: center; font-size: 14px; color: #888888; margin-top: 30px;">
            Note: You must have an account with this email address to join the team.
          </p>
        </td>
      </tr>
      <tr>
        <td class="padding-mobile" style="padding: 0 60px 40px 60px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e8e4dc;">
            <tr>
              <td style="padding-top: 30px; text-align: center;">
                <p style="margin: 0; color: #4a4a4a; font-size: 15px; letter-spacing: 0.5px;">
                  Thanks,<br>
                  <strong style="color: #1a1a1a; font-size: 16px; font-weight: 700;">Ayush Rathore</strong><br/>
                  <span style="font-size: 14px; color: #888888; font-weight: 500;">MEDHA Revision</span>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 30px; background-color: #f9f9f9; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; font-size: 12px; color: #888888; border-top: 1px solid #e8e4dc;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 10px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #ff6b00;"></div>
            <strong style="color: #1a1a1a;">MEDHA</strong>
          </div>
          <p style="margin: 0; margin-bottom: 10px;">
            <a href="https://medha-revision.vercel.app/" style="color: #4a4a4a; text-decoration: none; font-weight: 600;">Visit the Website</a>
          </p>
        </td>
      </tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      <tr><td height="50" style="font-size: 50px; line-height: 50px;">&nbsp;</td></tr>
    </table>
  </center>
</body>
</html>
    `;

    // Attempt to send email
    await sendEmail({
      to: email, 
      from: `"Ayush Rathore | MEDHA" <${process.env.SMTP_USER}>`,
      subject: "Ayush Rathore invited you to join the MEDHA Team! 🚀",
      html: htmlBody,
    });

    res.status(200).json({ message: "Invitation sent successfully.", code });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ message: "Failed to send invitation." });
  }
};

/**
 * Transcribe audio file using Groq Whisper API
 * Supports multiple languages automatically
 */
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res
        .status(500)
        .json({ message: "Transcription service not configured" });
    }

    // Create form data for Groq API
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("model", "whisper-large-v3"); // Best multilingual model
    formData.append("response_format", "verbose_json"); // Get detailed response with language detection

    // Optional: specify language if provided in request
    if (req.body.language) {
      formData.append("language", req.body.language);
    }

    console.log(
      `🎙️ Transcribing audio: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`
    );

    const response = await axios.post(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000, // 2 minutes timeout for large files
      }
    );

    const result = response.data;

    res.json({
      success: true,
      transcription: result.text,
      language: result.language || "auto-detected",
      duration: result.duration
        ? `${Math.round(result.duration)} seconds`
        : null,
      segments: result.segments || null, // Detailed segments if available
    });
  } catch (error) {
    console.error(
      "Transcription error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 413) {
      return res
        .status(413)
        .json({ message: "Audio file too large. Maximum size is 25MB." });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        message:
          "Invalid audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm",
      });
    }

    res.status(500).json({
      message: "Failed to transcribe audio. Please try again.",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};
