const express = require("express");
const { streamText } = require("ai");
const { createGroq } = require("@ai-sdk/groq");

const router = express.Router();

// Initialize Groq provider with the API key from environment variables
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/stream", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    // Call the Vercel AI SDK streamText method with Groq
    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      messages,
      system: `You are MEDHA AI, a highly intelligent and supportive student assistant built specifically for engineering and college students. 
      Your personality is encouraging, academic yet accessible, and concise. 
      Always use Markdown for formatting (bolding key terms, lists, code blocks). 
      If a user asks for study plans, give concrete actionable steps with times.
      If a user asks to explain a concept, use analogies where possible.`,
      temperature: 0.7,
    });

    // Pipe the standard Vercel AI SDK data stream to the Express response natively.
    return result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error("Vercel AI SDK Streaming Error:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

module.exports = router;
