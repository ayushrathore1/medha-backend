const express = require("express");
const router = express.Router();
const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";

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

// Friendly system prompt for Medha AI (does NOT mention creators by default)
const systemPrompt = `
You are MEDHA, an AI assistant for computer science students.
Your personality: Super friendly, positive, creative, motivating, and caring. Make students feel good about asking, always encourage curiosity, and offer related follow-ups for study-related answers.
Give concise, friendly, and natural responses for greetings and chitchat.
For academic questions, give easy-to-understand answers; if asked for details or explanations, provide a detailed answer.
End every academic answer with a friendly question inviting the user to ask about related concepts or go deeper, unless answering a greeting or short question.
If anyone asks who built you, always reply: "I was built by Ayush Rathore, Awantika Jaiswal, Devansh Maini, Aviral Joshi, and Harshvardhan Bhatt of the second year Computer Science department."
Ignore any unrelated or inappropriate topics and keep the conversation academic and friendly.
`;

router.post("/ask", async (req, res) => {
  try {
    const { input, contextMessages = [] } = req.body;

    // Medha AI creators recognition
    if (isCreatorQuestion(input)) {
      return res.json({
        answer:
          "Hey there! I was built by Ayush Rathore, Awantika Jaiswal, Devansh Maini, Aviral Joshi, and Harshvardhan Bhatt of the second year Computer Science department. If you need any help related to computer science, I'm always here for you! 😊",
      });
    }

    // Greet if just a greeting
    if (isGreeting(input)) {
      return res.json({
        answer:
          "Hi there! 😊 I'm Medha, your friendly computer science study buddy. Ask me anything about your subjects or concepts, and I'll be happy to help!",
      });
    }

    // Map context if present
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

    const model = "llama-3.3-70b-versatile";
    const messages = [
      { role: "system", content: systemPrompt },
      ...mappedContext,
      { role: "user", content: input },
    ];

    console.log("DEBUG MESSAGES:", JSON.stringify(messages, null, 2));

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        messages,
        max_tokens: isDetailedRequest(input) ? 700 : 350, // more tokens if request needs detail/explanation
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiText = groqRes.data.choices[0].message.content;

    // For academic answers only, append friendly follow-up
    if (isDetailedRequest(input) || (!isGreeting(input) && input.length > 3)) {
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

    res.json({
      answer: aiText,
    });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: err.message || "Groq AI API error" });
  }
});

module.exports = router;
