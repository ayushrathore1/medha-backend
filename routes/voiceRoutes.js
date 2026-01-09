/**
 * Voice Routes - Speech-to-Text & Text-to-Speech API
 * Uses Groq Whisper for STT and Web Speech API or Groq for TTS
 */
const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const jwt = require("jsonwebtoken");

// Try to load ragContextBuilder, but make it optional
let buildRAGContext;
try {
  buildRAGContext = require("../utils/ragContextBuilder").buildRAGContext;
} catch (e) {
  buildRAGContext = async () => ({ fullContext: "" });
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // Optional for TTS
const JWT_SECRET = process.env.JWT_SECRET;

// Multer config for audio uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/ogg",
      "audio/m4a",
      "audio/mp4",
      "audio/flac",
    ];
    if (
      allowedTypes.includes(file.mimetype) ||
      file.mimetype.startsWith("audio/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid audio format"), false);
    }
  },
});

// Optional auth middleware
function optionalAuth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      req.userId = null;
    }
  } else {
    req.userId = null;
  }
  next();
}

/**
 * POST /api/voice/transcribe
 * Convert audio to text using Groq Whisper API
 */
router.post(
  "/transcribe",
  optionalAuth,
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No audio file provided" });
      }

      if (!GROQ_API_KEY) {
        return res
          .status(500)
          .json({ success: false, message: "Groq API key not configured" });
      }

      console.log(
        `🎤 Transcribing audio: ${req.file.originalname || "audio"} (${req.file.size} bytes)`
      );

      // Use formdata-node for Groq Whisper API
      const { FormData, Blob } = await import("formdata-node");
      const formData = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.set("file", blob, req.file.originalname || "audio.webm");
      formData.set("model", "whisper-large-v3-turbo");
      formData.set("language", req.body.language || "en");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const transcript = data.text;
      console.log(
        `✅ Transcription complete: "${transcript?.substring(0, 50) || ""}..."`
      );

      res.json({
        success: true,
        transcript,
        language: data.language || "en",
      });
    } catch (error) {
      console.error("❌ Transcription error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to transcribe audio",
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/voice/ask
 * Full voice conversation: Audio in -> AI response -> Text out
 * Frontend handles TTS using Web Speech API
 */
router.post("/ask", optionalAuth, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No audio file provided" });
    }

    if (!GROQ_API_KEY) {
      return res
        .status(500)
        .json({ success: false, message: "Groq API key not configured" });
    }

    // Log audio details for debugging
    console.log(`🎤 Received audio file:`);
    console.log(`   - Size: ${req.file.size} bytes`);
    console.log(`   - MIME type: ${req.file.mimetype}`);
    console.log(`   - Original name: ${req.file.originalname || "audio"}`);

    // Validate audio file
    if (req.file.size < 1000) {
      return res.status(400).json({
        success: false,
        message: "Audio file too small. Please speak longer.",
      });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Audio file too large. Please keep recordings under 10MB.",
      });
    }

    const { context, animationTitle, currentStep, totalSteps } = req.body;
    const userId = req.userId;

    // Step 1: Transcribe audio to text using Groq Whisper
    console.log(`🎤 Step 1: Transcribing audio (${req.file.size} bytes)...`);

    const { FormData, Blob } = await import("formdata-node");
    const formData = new FormData();

    // Determine proper file extension from MIME type
    const mimeToExt = {
      "audio/webm": "webm",
      "audio/webm;codecs=opus": "webm",
      "audio/mp4": "mp4",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
      "audio/flac": "flac",
    };
    const ext = mimeToExt[req.file.mimetype] || "webm";
    const fileName = `audio.${ext}`;

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.set("file", blob, fileName);
    formData.set("model", "whisper-large-v3-turbo");
    formData.set("language", "en");
    formData.set("response_format", "verbose_json"); // Get more details

    console.log(
      `📤 Sending to Whisper API: ${fileName} (${req.file.mimetype})`
    );

    const transcriptionResponse = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error(`❌ Whisper API error: ${transcriptionResponse.status}`);
      console.error(`   Response: ${errorText}`);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: { message: errorText } };
      }

      throw new Error(
        errorData.error?.message ||
          `Transcription failed: HTTP ${transcriptionResponse.status}`
      );
    }

    const transcriptionData = await transcriptionResponse.json();
    const userQuestion = transcriptionData.text?.trim();

    console.log(`📝 Transcription result:`);
    console.log(`   - Text: "${userQuestion || "(empty)"}"`);
    console.log(`   - Duration: ${transcriptionData.duration || "unknown"}s`);

    // Handle empty or very short transcriptions
    if (!userQuestion || userQuestion.length === 0) {
      console.log(`⚠️ Empty transcription - no speech detected`);
      return res.json({
        success: true,
        transcript: "",
        answer:
          "I couldn't hear any speech. Please try speaking louder and closer to the microphone.",
        isEmpty: true,
      });
    }

    // Handle very short/noise-like transcriptions
    if (userQuestion.length < 3) {
      console.log(`⚠️ Very short transcription: "${userQuestion}"`);
      return res.json({
        success: true,
        transcript: userQuestion,
        answer:
          "I didn't quite catch that. Could you please repeat your question more clearly?",
        isTooShort: true,
      });
    }

    console.log(`✅ Valid transcription: "${userQuestion}"`);
    console.log(`🤖 Step 2: Getting AI response...`);

    // Build RAG context if user is logged in
    let ragContext = { fullContext: "" };
    if (userId && buildRAGContext) {
      try {
        ragContext = await buildRAGContext(userId, userQuestion);
      } catch (e) {
        console.log("RAG context building skipped:", e.message);
      }
    }

    // Create contextual prompt
    let systemPrompt = `You are MEDHA, a friendly AI study assistant for engineering students.
Keep your answers concise and clear since they will be spoken aloud.
Avoid using markdown formatting, code blocks, or special characters.
Speak naturally as if having a conversation.
Limit responses to 2-3 sentences unless the question requires more detail.`;

    if (animationTitle) {
      systemPrompt += `\n\nThe student is currently viewing an animation about "${animationTitle}"${currentStep ? `, on step ${currentStep} of ${totalSteps}` : ""}.
Focus your answer on this topic.`;
    }

    if (ragContext.fullContext) {
      systemPrompt += `\n\nContext from user's study materials:\n${ragContext.fullContext}`;
    }

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuestion },
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const answer = aiResponse.data.choices[0].message.content;
    console.log(`💬 AI response: "${answer.substring(0, 50)}..."`);

    res.json({
      success: true,
      transcript: userQuestion,
      answer,
      useWebSpeech: true, // Frontend should use Web Speech API for TTS
    });
  } catch (error) {
    console.error("❌ Voice ask error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process voice request",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * POST /api/voice/chat
 * Text-only chat (no audio input) - for fallback when browser STT is used
 */
router.post("/chat", optionalAuth, async (req, res) => {
  try {
    const {
      message,
      animationTitle,
      currentStep,
      totalSteps,
      conversationHistory,
    } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "No message provided" });
    }

    if (!GROQ_API_KEY) {
      return res
        .status(500)
        .json({ success: false, message: "Groq API key not configured" });
    }

    const userId = req.userId;

    // Build RAG context if user is logged in
    let ragContext = { fullContext: "" };
    if (userId && buildRAGContext) {
      try {
        ragContext = await buildRAGContext(userId, message);
      } catch (e) {
        console.log("RAG context building skipped:", e.message);
      }
    }

    // Create contextual prompt
    let systemPrompt = `You are MEDHA, a friendly AI study assistant for engineering students.
Keep your answers concise and clear since they will be spoken aloud.
Avoid using markdown formatting, code blocks, or special characters.
Speak naturally as if having a conversation.
Limit responses to 2-3 sentences unless the question requires more detail.`;

    if (animationTitle) {
      systemPrompt += `\n\nThe student is currently viewing an animation about "${animationTitle}"${currentStep ? `, on step ${currentStep} of ${totalSteps}` : ""}.
Focus your answer on this topic.`;
    }

    if (ragContext.fullContext) {
      systemPrompt += `\n\nContext from user's study materials:\n${ragContext.fullContext}`;
    }

    // Build messages array with conversation history
    const messages = [{ role: "system", content: systemPrompt }];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-4);
      messages.push(...recentHistory);
    }

    messages.push({ role: "user", content: message });

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const answer = aiResponse.data.choices[0].message.content;
    console.log(`💬 Voice chat response: "${answer.substring(0, 50)}..."`);

    res.json({
      success: true,
      answer,
      useWebSpeech: true,
    });
  } catch (error) {
    console.error(
      "❌ Voice chat error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to process chat request",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * GET /api/voice/status
 * Check voice API status and available features
 */
router.get("/status", (req, res) => {
  res.json({
    success: true,
    features: {
      stt: !!GROQ_API_KEY,
      tts: "web-speech-api",
      ai: !!GROQ_API_KEY,
    },
    models: {
      stt: "whisper-large-v3-turbo",
      ai: "llama-3.3-70b-versatile",
      tts: "browser-native",
    },
  });
});

module.exports = router;
