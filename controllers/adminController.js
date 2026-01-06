const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const TeamInvitation = require("../models/TeamInvitation");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

// Track in-flight email operations to prevent duplicate sends
const inFlightOperations = new Set();

// Get all users with relevant fields
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email emailVerified university createdAt").lean();
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
  const operationKey = `${mode}-${targetUserId || 'bulk'}-${subject.substring(0, 50)}`;
  
  // Check if this operation is already in flight
  if (inFlightOperations.has(operationKey)) {
    console.log(`⚠️ Duplicate email operation blocked: ${operationKey}`);
    return res.status(409).json({ 
      message: "An email operation with the same parameters is already in progress. Please wait." 
    });
  }
  
  // Mark operation as in-flight
  inFlightOperations.add(operationKey);
  console.log(`📧 Starting email operation: ${operationKey}`);

  // Email delay configuration (in milliseconds)
  const EMAIL_DELAY_MS = 2000; // 2 seconds between emails to avoid rate limiting

  // Helper function for delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    let usersToSend = [];

    // 1. Determine Recipients
    if (mode === "individual") {
      if (!targetUserId) {
        return res.status(400).json({ message: "Target User ID is required for individual mode." });
      }
      const user = await User.findById(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      usersToSend = [user];
    } else if (mode === "all") {
      usersToSend = await User.find({ email: { $exists: true, $ne: null } }).select("name email");
    } else if (mode === "unverified") {
      // Only send to users with emailVerified = false or undefined
      usersToSend = await User.find({ 
        email: { $exists: true, $ne: null },
        $or: [{ emailVerified: false }, { emailVerified: { $exists: false } }]
      }).select("name email");
    } else {
      return res.status(400).json({ message: "Invalid mode. Use 'all', 'individual', or 'unverified'." });
    }

    // 2. Check for existing log and filter out already-sent recipients
    let existingLog = await EmailLog.findOne({ subject, htmlBody });
    let alreadySentEmails = new Set(existingLog?.recipients || []);
    
    // Filter out users who already received this exact email
    const originalCount = usersToSend.length;
    usersToSend = usersToSend.filter(user => !alreadySentEmails.has(user.email?.toLowerCase()));
    const skippedCount = originalCount - usersToSend.length;

    if (usersToSend.length === 0) {
      return res.json({
        message: `All ${originalCount} users have already received this email.`,
        details: { success: 0, failed: 0, skipped: skippedCount }
      });
    }

    console.log(`📧 Starting email send: ${usersToSend.length} recipients (${skippedCount} skipped as duplicates)`);

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
          console.log(`✅ [${i + 1}/${usersToSend.length}] Sent to ${user.email}`);
        }
      } catch (err) {
        console.error(`❌ [${i + 1}/${usersToSend.length}] Failed to send to ${user.email}:`, err.message);
        failureCount++;
        
        // If rate limited (421 error), wait longer before next attempt
        if (err.responseCode === 421) {
          console.log('⏳ Rate limited - waiting 30 seconds before continuing...');
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
        existingLog.recipients = [...new Set([...existingLog.recipients, ...successfulRecipients])];
        existingLog.lastSentAt = Date.now();
        await existingLog.save();
      } else {
        await EmailLog.create({
          subject,
          htmlBody,
          sentCount: 1,
          totalRecipients: successCount,
          recipients: successfulRecipients,
          lastSentAt: Date.now()
        });
      }
    } catch (logError) {
      console.error("Failed to log email history:", logError);
      // Don't block sending if logging fails
    }

    console.log(`📧 Email send complete: ${successCount} sent, ${failureCount} failed, ${skippedCount} skipped`);

    // Clear the in-flight operation lock
    inFlightOperations.delete(operationKey);

    return res.json({ 
      message: `Email process completed. Sent to ${successCount} users.`, 
      details: { success: successCount, failed: failureCount, skipped: skippedCount } 
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
const axios = require("axios");
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
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedContent = JSON.parse(response.data.choices[0].message.content);
    
    res.json({ 
      subject: generatedContent.subject,
      html: generatedContent.html 
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
      return res.status(403).json({ message: "Cannot delete the main admin account." });
    }

    // 3. Delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: `User ${user.name} (${user.email}) deleted successfully.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "team", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be 'user', 'team', or 'admin'." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent demoting the main admin
    if (user.email === "rathoreayush512@gmail.com" && role !== "admin") {
      return res.status(403).json({ message: "Cannot change role of the main admin." });
    }

    user.role = role;
    // Sync isAdmin flag for backward compatibility
    user.isAdmin = (role === "admin");
    
    await user.save();

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Failed to update role", error: error.message });
  }
};

// Get Team Members
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({ 
      role: { $in: ["team", "admin"] } 
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
    if (existingUser && (existingUser.role === 'team' || existingUser.role === 'admin')) {
      return res.status(409).json({ message: "User is already a team member or admin." });
    }

    // Generate 6-digit alphanumeric code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Expiration: 48 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Save invitation
    await TeamInvitation.create({
      email,
      code,
      expiresAt,
      invitedBy: req.user._id // Assuming admin is logged in
    });

    // Send email
    const joinLink = `https://medha-revision.vercel.app/join-team?email=${encodeURIComponent(email)}`;
    
    // Get first name or default
    const firstName = existingUser ? existingUser.name.split(' ')[0] : "Candidate";

    const htmlBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--[if mso]>
    <style>
      td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="width: 100%; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; background-color: #f0f1f5; margin: 0; padding: 0;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color: #f0f1f5">
      <tbody>
        <tr>
          <td style="background-color: #f0f1f5">
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; min-height: 600px; margin: 0 auto; background-color: #000d25;">
              <tbody>
                <tr>
                  <td style="vertical-align: top; padding: 10px 0px 10px 0px">
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tbody>
                        <tr>
                          <td style="padding: 10px 0 10px 0; vertical-align: top">
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color: #000; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.4;">
                              <tbody>
                                <tr>
                                  <td style="padding: 0px 20px">
                                    <img src="https://ik.imagekit.io/ayushrathore1/4.png" width="560" height="526" style="display: block; width: 100%; height: auto; max-width: 100%;" />
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td dir="ltr" style="color: #17afaf; font-size: 24px; font-weight: 700; padding: 0px 20px;">
                                    Hi ${firstName},<br />
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td dir="ltr" style="font-size: 16px; padding: 0px 20px;">
                                    <span style="color: #ffffff;">Inviting you to join the </span>
                                    <span style="color: #ffffff; font-family: Georgia, serif;">MEDHA REVISION</span>
                                    <span style="color: #ffffff;"> team—building a platform that helps college students prep faster for end-sem exams with the right resources and structure.<br /><br /></span>
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td style="padding: 0px 20px">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%">
                                      <tbody>
                                        <tr>
                                          <td align="center">
                                            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 194px;">
                                              <tbody>
                                                <tr>
                                                  <td style="width: 100%; padding: 20 0;">
                                                    <a href="${joinLink}" target="_blank" style="display: table; width: 100%; text-decoration: none; padding: 8px; background-color: #000d25; border: 6px solid #a69ddc; border-radius: 76px;">
                                                      <span style="color: #ffd21f; font-weight: bold; font-family: Arial, sans-serif; display: table-cell; vertical-align: middle; text-align: center;">ACCEPT INVITATION</span>
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td style="padding: 0px 20px">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%">
                                      <tbody>
                                        <tr>
                                          <td align="center">
                                            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 434px;">
                                              <tbody>
                                                <tr>
                                                  <td style="width: 100%; padding: 20 0;">
                                                    <div style="display: table; width: 100%; padding: 8px; background: linear-gradient(90deg, #000000, #737373); border-radius: 76px;">
                                                      <span style="color: #ffffff; font-weight: bold; font-family: Georgia, serif; display: table-cell; vertical-align: middle; text-align: center; font-size: 20px; letter-spacing: 2px;">${code}</span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td dir="ltr" style="color: #ffffff; font-size: 16px; font-weight: 700; padding: 0px 20px;">
                                    Thanks,<br />Ayush Rathore<br />MEDHA Revision<br />
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td dir="ltr" style="color: #e8e8e8; font-size: 16px; padding: 0px 20px;">
                                    If anything doesn’t work, just reply to this email and help will be provided.<br />
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td style="padding: 0px 20px">
                                    <a href="https://medha-revision.vercel.app" target="_blank" style="display: block; text-decoration: none;">
                                      <img src="https://ik.imagekit.io/ayushrathore1/4.png?updatedAt=1767635595817" width="203" height="134" style="display: block; width: 100%; max-width: 203px; height: auto;" />
                                    </a>
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td dir="ltr" style="font-size: 13px; text-align: center; padding: 0px 20px; color: #e8e8e8;">
                                    <a href="mailto:medhaclarity@gmail.com" style="color: #e8e8e8; text-decoration: none;">medhaclarity@gmail.com</a> • 
                                    <a href="https://medha-revision.vercel.app" style="color: #1a62ff; text-decoration: underline;">https://medha-revision.vercel.app</a><br />
                                    <a href="tel:+916377805448" style="color: #e8e8e8; text-decoration: none;">+91 6377805448</a> • Jaipur Rajasthan<br />
                                  </td>
                                </tr>
                                <tr><td style="font-size: 0; height: 16px">&nbsp;</td></tr>
                                <tr>
                                  <td dir="ltr" style="font-size: 13px; text-align: center; padding: 0px 20px; color: #e8e8e8;">
                                    You Must Have An Account With This Email Address On <a href="https://medha-revision.vercel.app" style="color: #1a62ff; text-decoration: inherit;">Medha Revision</a> To Join The Team<br />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

    // Attempt to send email
    // Note: sendEmail utility might return void or promise.
    await sendEmail({
      to: email, // Adjust if utility expects 'email' or 'to'
      subject: "You're Invited to Join the MEDHA Team!",
      html: htmlBody // Adjust if utility expects 'message' or 'html'
    });

    res.status(200).json({ message: "Invitation sent successfully.", code });

  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ message: "Failed to send invitation." });
  }
};
