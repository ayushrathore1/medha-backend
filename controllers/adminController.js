const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const { sendEmail } = require("../utils/sendEmail");

// Get all users with relevant fields
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email createdAt").lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Send email to users (All or Individual)
exports.sendAdminEmail = async (req, res) => {
  const { mode, targetUserId, subject, htmlBody } = req.body;
  // mode: 'all' | 'individual'

  if (!subject || !htmlBody) {
    return res.status(400).json({ message: "Subject and Body are required." });
  }

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
    } else {
      return res.status(400).json({ message: "Invalid mode." });
    }

    // 2. Log History
    try {
      // Create or Update Log
      let log = await EmailLog.findOne({ subject, htmlBody });
      
      if (log) {
        log.sentCount += 1;
        log.totalRecipients += usersToSend.length;
        log.lastSentAt = Date.now();
        await log.save();
      } else {
        await EmailLog.create({
          subject,
          htmlBody,
          sentCount: 1,
          totalRecipients: usersToSend.length,
          lastSentAt: Date.now()
        });
      }
    } catch (logError) {
      console.error("Failed to log email history:", logError);
      // Don't block sending if logging fails
    }

    // 3. Send Emails
    let successCount = 0;
    let failureCount = 0;

    const promises = usersToSend.map(async (user) => {
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
        }
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err.message);
        failureCount++;
      }
    });

    await Promise.all(promises);

    return res.json({ 
      message: `Email process completed. Sent to ${successCount} users.`, 
      details: { success: successCount, failed: failureCount } 
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
