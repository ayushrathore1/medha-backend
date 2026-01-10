const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { buildRAGContext } = require("../utils/ragContextBuilder");
const {
  needsWebSearch,
  performWebSearch,
  formatSearchContext,
} = require("../utils/webSearch");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "853f32a2825ea94c1586147858f09663a1fcc51d926d7cbfc5440d67fbe80dc30ac1f805ef9bcf8699dffbc31e4505bcb345543c771e0272eabd0a4d011216ec";

// Initialize Gemini client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
console.log(
  `🔧 Gemini API: ${genAI ? "✅ Configured" : "❌ Not configured (GEMINI_API_KEY missing)"}`
);

// Supported AI models
const SUPPORTED_MODELS = {
  groq: { name: "Groq (Llama 3)", model: "llama-3.3-70b-versatile" },
  gemini: { name: "Gemini", model: "gemini-2.0-pro-exp" },
};

// Detect "who built you" (case-insensitive fuzzy matching)
function isCreatorQuestion(input) {
  const patterns = [
    /who\s+(built|created|made)\s+(you|medha|this|the ai)/i,
    /your\s+(creator|maker|developers|team)/i,
    /who.*(developed|designed|coded)/i,
    /who\s+are\s+you/i,
    /who\s+(is|are)\s+(behind|making)/i,
    /about\s+the\s+(developers|team|creators)/i,
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

// Base system prompt for Medha AI (now university-agnostic)
const baseSystemPrompt = `
You are MEDHA, an AI assistant for computer science and engineering students in India.
Your personality: Super friendly, positive, creative, motivating, and caring. Make students feel good about asking, always encourage curiosity.

IMPORTANT BEHAVIOR RULES:
- If you know the user's name, greet them by name naturally.
- If asked "who am I" or similar personal questions, respond with their actual details (name, university, college, branch, year) if available in the context.
- NEVER say things like "I have access to your profile" or "I can see your data" - this sounds creepy and invasive.
- Just USE the personalized information naturally, as if you already know them as a friend.
- If you don't have user information, politely ask them to log in for a personalized experience.
- Adapt your responses based on the user's university context (provided below).

RESPONSE GUIDELINES:
- For greetings: Give concise, friendly responses. Use their name if you know it.
- For academic questions: Give easy-to-understand answers with examples.
- For syllabus-related questions: Reference the specific unit and topics from the user's university syllabus if available.
- Always end academic answers with a friendly follow-up question.
- If the user is from an unsupported university, still provide helpful general academic guidance.

If anyone asks who built you, always reply: "I was developed by students from the Computer Science Engineering department of Arya College of Engineering & IT, Jaipur. If you want to contact them or share feedback, just go to the Messages tab and send a message to the admin - you'll get a response soon!"
`;

// Helper function to call Gemini API
async function callGeminiAPI(systemPrompt, messages, maxTokens = 1000) {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({
    model: SUPPORTED_MODELS.gemini.model,
    systemInstruction: systemPrompt,
  });

  // Convert messages to Gemini format (history + current message)
  const history = [];
  let currentUserMessage = "";

  for (const msg of messages) {
    if (msg.role === "system") continue; // System is handled via systemInstruction

    if (msg.role === "user") {
      currentUserMessage = msg.content;
    } else if (msg.role === "assistant") {
      // If we have a pending user message, add both to history
      if (history.length > 0 || currentUserMessage) {
        if (currentUserMessage) {
          history.push({ role: "user", parts: [{ text: currentUserMessage }] });
          currentUserMessage = "";
        }
        history.push({ role: "model", parts: [{ text: msg.content }] });
      }
    }
  }

  // Start chat with history
  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  });

  // Send the current user message
  const result = await chat.sendMessage(
    currentUserMessage || messages[messages.length - 1].content
  );
  return result.response.text();
}

router.post("/ask", optionalAuth, async (req, res) => {
  try {
    const {
      input,
      contextMessages = [],
      sessionId,
      model: selectedModel = "groq",
      animationContext = "",
    } = req.body;
    const userId = req.userId;

    console.log(
      `🎯 Model selected: ${selectedModel} | Gemini available: ${!!genAI}`
    );
    if (animationContext) {
      console.log("🎬 Animation context provided - contextual chatbot mode");
    }

    // Import ChatSession model for saving messages
    const ChatSession = require("../models/ChatSession");

    // Handle creator questions
    if (isCreatorQuestion(input)) {
      const answer =
        "Hey there! 👋 I was developed by students from the Computer Science Engineering department of Arya College of Engineering & IT, Jaipur. If you'd like to get in touch with them, share feedback, or report any issues, just head over to the **Messages** tab and send a message to the admin - you'll get a response soon! Is there anything I can help you with today? 😊";

      // Save to session if provided
      if (sessionId && userId) {
        await ChatSession.findOneAndUpdate(
          { _id: sessionId, user: userId },
          {
            $push: {
              messages: [
                { role: "user", content: input },
                { role: "assistant", content: answer },
              ],
            },
          }
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
          {
            $push: {
              messages: [
                { role: "user", content: input },
                { role: "assistant", content: greetingResponse },
              ],
            },
          }
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
    // Force IST Timezone
    const timeOptions = {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const istDateString = now.toLocaleString("en-IN", timeOptions);

    // Parse it back or just use the string directly to avoid server timezone issues
    const timeContext = `
[CURRENT DATE & TIME (IST)]
- Current moment: ${istDateString}
- Timezone: Asia/Kolkata (Indian Standard Time)
- NOTE: Strictly use this "Current moment" as the absolute truth for "now", "today", or "current time".
- If the user asks for the time, report exactly based on the above value.
`;

    // Add animation context if provided (for contextual chatbot in animations)
    const animationCtx = animationContext
      ? `
[ANIMATION CONTEXT - PRIORITY]
${animationContext}
IMPORTANT: The user is currently viewing this animation. Prioritize answering questions in the context of this animation and the current step they're viewing.
`
      : "";

    const enhancedSystemPrompt =
      baseSystemPrompt +
      timeContext +
      animationCtx +
      (ragContext.fullContext || "") +
      webSearchContext;

    const messages = [
      { role: "system", content: enhancedSystemPrompt },
      ...mappedContext,
      { role: "user", content: input },
    ];

    let aiText = "";
    const maxTokens = isDetailedRequest(input) ? 1500 : 700;

    // Route to selected AI provider
    if (selectedModel === "gemini" && genAI) {
      console.log("🤖 Sending request to Gemini AI...");
      try {
        aiText = await callGeminiAPI(enhancedSystemPrompt, messages, maxTokens);
      } catch (geminiError) {
        console.error(
          "❌ Gemini API error, falling back to Groq:",
          geminiError.message
        );
        // Fall back to Groq if Gemini fails
        const groqRes = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: SUPPORTED_MODELS.groq.model,
            messages,
            max_tokens: maxTokens,
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
        aiText = groqRes.data.choices[0].message.content;
      }
    } else {
      console.log("🤖 Sending request to Groq AI...");
      const groqRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: SUPPORTED_MODELS.groq.model,
          messages,
          max_tokens: maxTokens,
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
      aiText = groqRes.data.choices[0].message.content;
    }

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
                { role: "assistant", content: aiText },
              ],
            },
          },
        };

        // Auto-generate title from first user message
        if (
          session &&
          session.title === "New Chat" &&
          session.messages.length === 0
        ) {
          updateData.$set = {
            title: input.substring(0, 40) + (input.length > 40 ? "..." : ""),
          };
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
      webSearchUsed: shouldSearch && webSearchContext.length > 0,
    });
  } catch (err) {
    console.error("❌ Chatbot error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message || "Groq AI API error" });
  }
});

// Solve endpoint for exam questions - Multi-Layer AI Pipeline with Caching
router.post("/solve", optionalAuth, async (req, res) => {
  try {
    const {
      question,
      subject,
      unit,
      marks,
      model: selectedModel = "groq",
      quickMode = false,
      forceRegenerate = false, // New option to force regeneration
    } = req.body;
    const userId = req.userId;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Import QuestionSolution model for caching
    const QuestionSolution = require("../models/QuestionSolution");

    // Create hash for this question
    const questionHash = QuestionSolution.createHash(question, subject, marks);
    const mode = quickMode ? "quick" : "deep";

    console.log(
      `📝 Solving exam question for subject: ${subject}, unit: ${unit}`
    );
    console.log(
      `🎯 Mode: ${quickMode ? "Quick (Single AI)" : "Deep (Multi-Layer Pipeline)"}`
    );
    console.log(`🔑 Question hash: ${questionHash}`);

    // Check for cached solution (unless forceRegenerate is true)
    if (!forceRegenerate) {
      try {
        const cachedSolution = await QuestionSolution.findOne({
          questionHash,
          mode,
        });

        if (cachedSolution) {
          console.log(
            `✅ Found cached ${mode} solution (generated ${cachedSolution.createdAt})`
          );

          // Update access stats
          await QuestionSolution.updateOne(
            { _id: cachedSolution._id },
            { $inc: { viewCount: 1 }, $set: { lastAccessedAt: new Date() } }
          );

          // Safely build metadata object
          const cachedMetadata = cachedSolution.metadata
            ? {
                ...(cachedSolution.metadata.toObject
                  ? cachedSolution.metadata.toObject()
                  : cachedSolution.metadata),
              }
            : {};

          return res.json({
            success: true,
            solution: cachedSolution.solution,
            subject,
            unit,
            marks,
            mode: cachedSolution.mode,
            analysis: cachedSolution.analysis || null,
            feedback: cachedSolution.feedback || null,
            uiTemplate: cachedSolution.uiTemplate || {
              template: "default",
              config: { primaryColor: "indigo" },
            },
            metadata: {
              ...cachedMetadata,
              cached: true,
              cachedAt: cachedSolution.createdAt,
              viewCount: (cachedSolution.viewCount || 0) + 1,
            },
          });
        }
        console.log(
          `📦 No cached solution found for hash ${questionHash}, generating new one...`
        );
      } catch (cacheReadErr) {
        console.log(
          "⚠️ Error reading cache, proceeding to generate:",
          cacheReadErr.message
        );
      }
    } else {
      console.log(`🔄 Force regenerate requested, skipping cache...`);
    }

    // Quick mode - use single AI call
    if (quickMode) {
      try {
        const ragContext = await buildRAGContext(
          userId,
          `${subject} ${unit} ${question}`
        );

        const solvePrompt = `You are an expert exam tutor for RTU (Rajasthan Technical University) students.

## Question Details
**Subject:** ${subject || "Not specified"}
**Unit:** ${unit || "Not specified"}
**Marks:** ${marks || "Not specified"}
**Question:** ${question}

${ragContext.fullContext || ""}

## IMPORTANT FORMAT RULES:
1. Structure your answer with clear headings (## and ###)
2. Use separate paragraphs - DO NOT write one long paragraph
3. If definition: Start with clear definition, then expand in new paragraph
4. If formulas needed: Create a "## Key Formulas" section
5. If diagram needed: Create "## How to Draw the Diagram" with numbered steps
6. Use bullet points for lists
7. Bold key terms

Generate a complete, well-structured, exam-ready answer:`;

        let solution = "";
        const startTime = Date.now();

        if (selectedModel === "gemini" && genAI) {
          try {
            solution = await callGeminiAPI(
              "You are an expert exam tutor.",
              [{ role: "user", content: solvePrompt }],
              3000
            );
          } catch (geminiError) {
            console.log(
              "⚠️ Gemini failed, trying Groq fallback:",
              geminiError.message
            );
            // Fallback to Groq
            const groqRes = await axios.post(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                model: SUPPORTED_MODELS.groq.model,
                messages: [{ role: "user", content: solvePrompt }],
                max_tokens: 3000,
                temperature: 0.3,
              },
              {
                headers: {
                  Authorization: `Bearer ${GROQ_API_KEY}`,
                  "Content-Type": "application/json",
                },
                timeout: 90000,
              }
            );
            solution = groqRes.data.choices[0].message.content;
          }
        } else {
          // Use Groq
          const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: SUPPORTED_MODELS.groq.model,
              messages: [{ role: "user", content: solvePrompt }],
              max_tokens: 3000,
              temperature: 0.3,
            },
            {
              headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 90000,
            }
          );
          solution = groqRes.data.choices[0].message.content;
        }

        const totalTime = Date.now() - startTime;

        // Save to cache
        try {
          const savedSolution = await QuestionSolution.findOneAndUpdate(
            { questionHash, mode: "quick" },
            {
              $set: {
                questionHash,
                questionText: question,
                subjectName: subject || "Unknown",
                unitName: unit || "Unknown",
                marks: marks || 0,
                solution,
                mode: "quick",
                analysis: null,
                feedback: null,
                uiTemplate: {
                  template: "default",
                  config: { primaryColor: "indigo" },
                },
                metadata: { totalTime, model: selectedModel, layers: {} },
                generatedBy: userId || null,
                lastAccessedAt: new Date(),
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          console.log(
            `💾 Quick solution saved to cache with hash: ${questionHash}, id: ${savedSolution._id}`
          );
        } catch (cacheErr) {
          console.error(
            "⚠️ Failed to cache quick solution:",
            cacheErr.message,
            cacheErr.stack
          );
        }

        return res.json({
          success: true,
          solution,
          subject,
          unit,
          marks,
          mode: "quick",
          analysis: null,
          feedback: null,
          uiTemplate: {
            template: "default",
            config: { primaryColor: "indigo" },
          },
          metadata: { totalTime, layers: {}, cached: false },
        });
      } catch (quickModeError) {
        console.error("❌ Quick mode error:", quickModeError.message);
        return res.status(500).json({
          error:
            "Failed to generate quick solution. Please try Deep Solve instead.",
          details: quickModeError.message,
        });
      }
    }

    // Deep mode - use Multi-Layer AI Pipeline
    const { runMultiLayerPipeline } = require("../utils/multiLayerAI");

    console.log("🚀 Running Multi-Layer AI Pipeline...");
    const pipelineResult = await runMultiLayerPipeline(
      question,
      subject,
      unit,
      marks,
      selectedModel
    );

    if (!pipelineResult.success) {
      // Fallback to quick mode if pipeline fails
      console.log("⚠️ Pipeline failed, falling back to quick mode...");
      const ragContext = await buildRAGContext(
        userId,
        `${subject} ${unit} ${question}`
      );

      const fallbackPrompt = `
You are an expert RTU exam tutor. Generate a complete, exam-ready answer.

Subject: ${subject}, Unit: ${unit}, Marks: ${marks}
Question: ${question}
${ragContext.fullContext || ""}

IMPORTANT: Structure with clear headings, separate paragraphs, and bullet points.
`;

      const groqRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: SUPPORTED_MODELS.groq.model,
          messages: [{ role: "user", content: fallbackPrompt }],
          max_tokens: 3000,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 90000,
        }
      );

      const fallbackSolution = groqRes.data.choices[0].message.content;

      // Save fallback to cache
      try {
        const savedSolution = await QuestionSolution.findOneAndUpdate(
          { questionHash, mode: "fallback" },
          {
            $set: {
              questionHash,
              questionText: question,
              subjectName: subject || "Unknown",
              unitName: unit || "Unknown",
              marks: marks || 0,
              solution: fallbackSolution,
              mode: "fallback",
              analysis: null,
              feedback: null,
              uiTemplate: {
                template: "default",
                config: { primaryColor: "indigo" },
              },
              metadata: {
                totalTime: 0,
                layers: {},
                fallbackReason: pipelineResult.error,
              },
              generatedBy: userId || null,
              lastAccessedAt: new Date(),
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(
          `💾 Fallback solution saved to cache with hash: ${questionHash}, id: ${savedSolution._id}`
        );
      } catch (cacheErr) {
        console.error(
          "⚠️ Failed to cache fallback solution:",
          cacheErr.message,
          cacheErr.stack
        );
      }

      return res.json({
        success: true,
        solution: fallbackSolution,
        subject,
        unit,
        marks,
        mode: "fallback",
        analysis: null,
        feedback: null,
        uiTemplate: { template: "default", config: { primaryColor: "indigo" } },
        metadata: {
          totalTime: 0,
          layers: {},
          fallbackReason: pipelineResult.error,
          cached: false,
        },
      });
    }

    console.log(
      `✅ Multi-Layer Pipeline complete in ${pipelineResult.metadata.totalTime}ms`
    );

    // Save to cache
    try {
      const savedSolution = await QuestionSolution.findOneAndUpdate(
        { questionHash, mode: "deep" },
        {
          $set: {
            questionHash,
            questionText: question,
            subjectName: subject || "Unknown",
            unitName: unit || "Unknown",
            marks: marks || 0,
            solution: pipelineResult.solution,
            mode: "deep",
            analysis: pipelineResult.analysis || null,
            feedback: pipelineResult.feedback || null,
            uiTemplate: pipelineResult.uiTemplate || {
              template: "default",
              config: { primaryColor: "indigo" },
            },
            metadata: pipelineResult.metadata || {},
            generatedBy: userId || null,
            lastAccessedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(
        `💾 Deep solution saved to cache with hash: ${questionHash}, id: ${savedSolution._id}`
      );
    } catch (cacheErr) {
      console.error(
        "⚠️ Failed to cache deep solution:",
        cacheErr.message,
        cacheErr.stack
      );
    }

    res.json({
      success: true,
      solution: pipelineResult.solution,
      subject,
      unit,
      marks,
      mode: "deep",
      analysis: pipelineResult.analysis,
      feedback: pipelineResult.feedback,
      uiTemplate: pipelineResult.uiTemplate,
      metadata: { ...pipelineResult.metadata, cached: false },
    });
  } catch (err) {
    console.error("❌ Solve error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate solution" });
  }
});

// Endpoint to check for cached solutions for multiple questions
router.post("/solve/check-cache", async (req, res) => {
  try {
    const { questions, subject } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.json({ cachedSolutions: {} });
    }

    const QuestionSolution = require("../models/QuestionSolution");
    const cachedSolutions = {};

    // Check cache for each question
    for (const q of questions) {
      const questionText = q.text?.replace(/<[^>]*>/g, "") || "";
      const questionHash = QuestionSolution.createHash(
        questionText,
        subject,
        q.marks
      );

      // Try to find deep solution first, then quick
      let cached = await QuestionSolution.findOne({
        questionHash,
        mode: "deep",
      });
      if (!cached) {
        cached = await QuestionSolution.findOne({
          questionHash,
          mode: "quick",
        });
      }
      if (!cached) {
        cached = await QuestionSolution.findOne({
          questionHash,
          mode: "fallback",
        });
      }

      if (cached) {
        // Safely convert metadata
        const metadata = cached.metadata
          ? cached.metadata.toObject
            ? cached.metadata.toObject()
            : cached.metadata
          : {};

        cachedSolutions[q.qCode] = {
          solution: cached.solution,
          analysis: cached.analysis || null,
          feedback: cached.feedback || null,
          uiTemplate: cached.uiTemplate || {
            template: "default",
            config: { primaryColor: "indigo" },
          },
          metadata: {
            ...metadata,
            cached: true,
            cachedAt: cached.createdAt,
          },
          mode: cached.mode,
          cached: true,
          isError: false,
        };
      }
    }

    console.log(
      `📦 Cache check: Found ${Object.keys(cachedSolutions).length}/${questions.length} cached solutions`
    );
    res.json({ cachedSolutions });
  } catch (err) {
    console.error("❌ Check cache error:", err.message);
    res.json({ cachedSolutions: {} });
  }
});

module.exports = router;
