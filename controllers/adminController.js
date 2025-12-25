const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const { sendEmail } = require("../utils/sendEmail");

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

    return res.json({ 
      message: `Email process completed. Sent to ${successCount} users.`, 
      details: { success: successCount, failed: failureCount, skipped: skippedCount } 
    });

  } catch (error) {
    console.error("Error in sendAdminEmail:", error);
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
