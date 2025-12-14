const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { buildRAGContext } = require("../utils/ragContextBuilder");
const { needsWebSearch, performWebSearch, formatSearchContext } = require("../utils/webSearch");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
const JWT_SECRET = process.env.JWT_SECRET || "853f32a2825ea94c1586147858f09663a1fcc51d926d7cbfc5440d67fbe80dc30ac1f805ef9bcf8699dffbc31e4505bcb345543c771e0272eabd0a4d011216ec";

// Detect "who built you" (case-insensitive fuzzy matching)
function isCreatorQuestion(input) {
  const patterns = [
    /who\s+(built|created|made)\s+(you|medha|this|the ai)/i,
    /your\s+(creator|maker|developers|team)/i,
    /who.*(developed|designed|coded)/i,
    /(ayush|awantika|devansh|aviral|harshvardhan)/i,
    /who\s+are\s+you/i,
  ];
  return patterns.some((pat) => pat.test(input));
}

// Detect greetings/short questions
function isGreeting(input) {
  return /^(hi|hello|hey|namaste|good (morning|evening|afternoon))$/i.test(
    input.trim()
  );
}

// Detect "give explanation" or "details" request
function isDetailedRequest(input) {
  return /(explain|details|elaborate|how does|why|meaning of|what is)/i.test(
    input
  );
}

// Optional auth middleware - extracts userId if token present, but doesn't block
function optionalAuth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      // Invalid token - ignore, proceed without userId
      req.userId = null;
    }
  } else {
    req.userId = null;
  }
  next();
}

// Base system prompt for Medha AI
const baseSystemPrompt = `
You are MEDHA, an AI assistant for computer science students at RTU (Rajasthan Technical University).
Your personality: Super friendly, positive, creative, motivating, and caring. Make students feel good about asking, always encourage curiosity.

IMPORTANT BEHAVIOR RULES:
- If you know the user's name, greet them by name naturally.
- If asked "who am I" or similar personal questions, respond with their actual details (name, college, branch, year) if available in the context.
- NEVER say things like "I have access to your profile" or "I can see your data" - this sounds creepy and invasive.
- Just USE the personalized information naturally, as if you already know them as a friend.
- If you don't have user information, politely ask them to log in for a personalized experience.

RESPONSE GUIDELINES:
- For greetings: Give concise, friendly responses. Use their name if you know it.
- For academic questions: Give easy-to-understand answers with examples.
- For syllabus-related questions: Reference the specific unit and topics from RTU syllabus.
- Always end academic answers with a friendly follow-up question.

If anyone asks who built you, always reply: "I was built by Ayush Rathore, Awantika Jaiswal, Devansh Maini, Aviral Joshi, and Harshvardhan Bhatt of the second year Computer Science department."
`;

router.post("/ask", optionalAuth, async (req, res) => {
  try {
    const { input, contextMessages = [], sessionId } = req.body;
    const userId = req.userId;

    // Import ChatSession model for saving messages
    const ChatSession = require("../models/ChatSession");

    // Handle creator questions
    if (isCreatorQuestion(input)) {
      const answer = "Hey there! I was built by Ayush Rathore, Awantika Jaiswal, Devansh Maini, Aviral Joshi, and Harshvardhan Bhatt of the second year Computer Science department. If you need any help related to computer science, I'm always here for you! 😊";
      
      // Save to session if provided
      if (sessionId && userId) {
        await ChatSession.findOneAndUpdate(
          { _id: sessionId, user: userId },
          { $push: { messages: [{ role: "user", content: input }, { role: "assistant", content: answer }] } }
        );
      }
      
      return res.json({ answer });
    }

    // Handle greetings
    if (isGreeting(input)) {
      const greetingResponse = userId 
        ? "Hi there! 😊 I'm Medha, your friendly computer science study buddy. Ask me anything about your subjects or concepts, and I'll give you personalized help!"
        : "Hi there! 😊 I'm Medha, your friendly computer science study buddy. Log in to get personalized help based on your study progress!";
      
      // Save to session if provided
      if (sessionId && userId) {
        await ChatSession.findOneAndUpdate(
          { _id: sessionId, user: userId },
          { $push: { messages: [{ role: "user", content: input }, { role: "assistant", content: greetingResponse }] } }
        );
      }
      
      return res.json({ answer: greetingResponse });
    }

    // Build RAG context from database
    console.log("🧠 Building RAG context for user:", userId || "anonymous");
    const ragContext = await buildRAGContext(userId, input);
    
    if (ragContext.fullContext) {
      console.log("✅ RAG context built successfully");
    }

    // Check if web search is needed and perform it (AI decides)
    let webSearchContext = "";
    const shouldSearch = await needsWebSearch(input);
    if (shouldSearch) {
      console.log("🌐 AI decided web search is needed...");
      const searchResults = await performWebSearch(input);
      webSearchContext = formatSearchContext(searchResults);
    }

    // Map context messages
    const mappedContext = Array.isArray(contextMessages)
      ? contextMessages
          .map((msg) => {
            if (msg.role && msg.content) return msg;
            if (msg.sender === "ai")
              return { role: "assistant", content: msg.text || "" };
            if (msg.sender === "user")
              return { role: "user", content: msg.text || "" };
            return null;
          })
          .filter(Boolean)
      : [];

    // Build final system prompt with time, RAG context, and web search results
    const now = new Date();
    const timeContext = `
[CURRENT DATE & TIME]
Today is ${now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Current time: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}.
Timezone: India Standard Time (IST).

`;
    const enhancedSystemPrompt = baseSystemPrompt + timeContext + (ragContext.fullContext || "") + webSearchContext;

    const model = "llama-3.3-70b-versatile";
    const messages = [
      { role: "system", content: enhancedSystemPrompt },
      ...mappedContext,
      { role: "user", content: input },
    ];

    console.log("🤖 Sending request to Groq AI...");

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        messages,
        max_tokens: isDetailedRequest(input) ? 1500 : 700,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    let aiText = groqRes.data.choices[0].message.content;

    // Add friendly follow-up for academic answers
    if (
      !aiText.trim().startsWith("[") &&
      (isDetailedRequest(input) || (!isGreeting(input) && input.length > 3))
    ) {
      const followUps = [
        "Would you like to know more about this topic, maybe about types, syntax, or real-world examples? I'm here to support your learning journey! 😊",
        "Interested to go deeper? I can share related concepts, practical problems or further explanations!",
        "Is there something else about this area you'd like to explore with me? Just let me know!",
      ];
      if (
        !/would you like to know|do you want to|let me know|interested to go deeper/i.test(
          aiText
        )
      ) {
        aiText +=
          "\n\n" + followUps[Math.floor(Math.random() * followUps.length)];
      }
    }

    // Save messages to session if sessionId provided
    if (sessionId && userId) {
      try {
        // Check if this is the first message (for auto-titling)
        const session = await ChatSession.findById(sessionId);
        const updateData = {
          $push: { 
            messages: { 
              $each: [
                { role: "user", content: input }, 
                { role: "assistant", content: aiText }
              ] 
            } 
          }
        };
        
        // Auto-generate title from first user message
        if (session && session.title === "New Chat" && session.messages.length === 0) {
          updateData.$set = { title: input.substring(0, 40) + (input.length > 40 ? "..." : "") };
        }
        
        await ChatSession.findOneAndUpdate(
          { _id: sessionId, user: userId },
          updateData
        );
      } catch (saveErr) {
        console.error("Failed to save message to session:", saveErr);
        // Don't fail the request, just log the error
      }
    }

    res.json({
      answer: aiText,
      hasContext: !!ragContext.fullContext,
    });
  } catch (err) {
    console.error("❌ Chatbot error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message || "Groq AI API error" });
  }
});

// Solve endpoint for exam questions
router.post("/solve", optionalAuth, async (req, res) => {
  try {
    const { question, subject, unit, marks } = req.body;
    const userId = req.userId;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.log(`📝 Solving exam question for subject: ${subject}, unit: ${unit}`);

    // Build RAG context for the subject/unit
    const ragContext = await buildRAGContext(userId, `${subject} ${unit} ${question}`);

    // Check if web search is needed
    const { needsWebSearch, performWebSearch, formatSearchContext } = require("../utils/webSearch");
    let webSearchContext = "";
    const shouldSearch = await needsWebSearch(question);
    if (shouldSearch) {
      console.log("🌐 Question may need web search...");
      const searchResults = await performWebSearch(`${subject} ${question}`);
      webSearchContext = formatSearchContext(searchResults);
    }

    // Current time context
    const now = new Date();
    const timeContext = `
[CURRENT DATE & TIME]
Today is ${now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
`;

    // Exam solution prompt
    const solvePrompt = `
You are an expert exam tutor for RTU (Rajasthan Technical University) students.



## Question Details
**Subject:** ${subject || "Not specified"}
**Unit:** ${unit || "Not specified"}
**Marks:** ${marks || "Not specified"}
**Question:** ${question}

${ragContext.fullContext || ""}
${webSearchContext}
${timeContext}

## Instructions
Generate a complete, exam-ready answer for this question. Your response must:

1. **Be formatted for maximum marks** - Structure your answer exactly as expected in RTU exams
2. **Include all key points** - Cover every aspect the examiner would look for
3. **Use proper headings and subheadings** - Make it easy to read and grade
4. **Include diagrams description if applicable** - Mention where diagrams should be drawn
5. **Match the marks allocation** - For ${marks || "this"} marks question, provide appropriate depth
6. **Use bullet points and numbered lists** where appropriate
7. **Highlight key terms** using bold
8. **Add examples** if relevant to the topic

## Response Format
Structure your answer with:
- **Definition/Introduction** (if applicable)
- **Main Content** (with proper subheadings)
- **Key Points/Features**
- **Examples/Applications** (if relevant)
- **Diagram Notes** (if applicable)
- **Conclusion** (if applicable)

Provide the COMPLETE answer, ready to be written in an exam.
`;

    const model = "llama-3.3-70b-versatile";
    const messages = [
      { role: "user", content: solvePrompt }
    ];

    console.log("🤖 Generating exam solution...");

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        messages,
        max_tokens: 3000,
        temperature: 0.3, // Lower for more accurate, structured answers
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 90000,
      }
    );

    const solution = groqRes.data.choices[0].message.content;
    console.log("✅ Exam solution generated successfully");

    res.json({
      solution,
      subject,
      unit,
      marks,
      hasWebSearch: !!webSearchContext,
    });
  } catch (err) {
    console.error("❌ Solve error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message || "Failed to generate solution" });
  }
});

module.exports = router;

