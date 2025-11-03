require("dotenv").config();
const axios = require("axios");
const apiKey = process.env.GROQ_API_KEY;

axios
  .post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: "Say hello world as a quiz!" }],
      max_tokens: 50,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  )
  .then((r) => console.log(r.data))
  .catch((e) => console.log(e.response?.data || e.message));
