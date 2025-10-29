const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const Subject = require("../models/Subject");
const axios = require("axios");
const JSON5 = require("json5"); // more robust parser

const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
const GROQ_MODEL = "openai/gpt-oss-20b";

// Get quizzes (filtered by subject and note)
exports.getQuizzes = async (req, res) => {
  try {
    const { subject, noteId } = req.query;
    let filter = { user: req.user.userId };
    if (noteId) filter.note = noteId;
    if (subject) filter.subject = subject;
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes." });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findOne({ _id: quizId, user: req.user.userId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz." });
  }
};

// Manual quiz creation
exports.createQuiz = async (req, res) => {
  try {
    const { noteId, questions, subject } = req.body;
    if (!noteId || !Array.isArray(questions) || questions.length === 0)
      return res
        .status(400)
        .json({ message: "noteId and questions required." });

    const note = await Note.findOne({ _id: noteId, owner: req.user.userId });
    if (!note)
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });

    const quiz = new Quiz({
      user: req.user.userId,
      note: noteId,
      questions,
      subject,
      isAIGenerated: false,
    });
    await quiz.save();
    res.status(201).json({ message: "Quiz created.", quiz });
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz." });
  }
};

// AI-powered quiz generation using GROQ only (with fallback to json5)
exports.generateAIQuiz = async (req, res) => {
  try {
    const { noteId, subject } = req.body;
    if (!noteId) return res.status(400).json({ message: "noteId is required" });
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const prompt = `Generate a 10-question multiple choice quiz (MCQ) with 4 options (A-D) and one correct answer.
Output format: [{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."}, "answer":"A"}].
Use this study material: ${note.extractedText || note.content?.trim()}`;

    const aiRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You generate MCQ quizzes from notes. Respond ONLY with a JSON array.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Safe cleanup of code blocks and whitespace
    let aiContent = aiRes.data.choices[0].message.content || "";
    aiContent = aiContent.trim();
    if (aiContent.startsWith("```json")) {
      aiContent = aiContent.slice(7).trim();
    }
    if (aiContent.startsWith("```")) {
      aiContent = aiContent.slice(3).trim();
    }
    if (aiContent.endsWith("```")) {
      aiContent = aiContent.slice(0, -3).trim();
    }

    // Parse: try JSON, then fallback
    let questions;
    try {
      questions = JSON.parse(aiContent);
      if (!Array.isArray(questions)) throw new Error("Questions not array");
    } catch (err) {
      try {
        questions = JSON5.parse(aiContent);
        if (!Array.isArray(questions)) throw new Error("Questions not array");
      } catch (err2) {
        return res.status(400).json({
          message: "AI response not valid JSON.",
          raw: aiContent,
        });
      }
    }

    const quiz = new Quiz({
      user: req.user.userId,
      note: noteId,
      subject: subject || note.subject,
      questions,
      isAIGenerated: true,
    });
    await quiz.save();

    res.status(201).json({ message: "AI Quiz generated.", quiz });
  } catch (err) {
    res.status(500).json({ message: "Could not generate AI quiz." });
  }
};

// Attempt quiz: submits user answers and gets score
exports.attemptQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body;
    const quiz = await Quiz.findOne({ _id: quizId, user: req.user.userId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length)
      return res.status(400).json({ message: "Answer array length mismatch." });

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) score += 1;
    });
    quiz.attempts.push({ answers, score });
    await quiz.save();

    res.json({
      message: "Quiz attempt recorded.",
      score,
      total: quiz.questions.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error during quiz attempt." });
  }
};

// Get all attempts/results for a quiz
exports.quizResults = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findOne({ _id: quizId, user: req.user.userId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json({
      attempts: quiz.attempts,
      lastAttempt: quiz.attempts.slice(-1) || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch quiz results." });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { questions, subject } = req.body;
    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, user: req.user.userId },
      { questions, subject, updatedAt: Date.now() },
      { new: true }
    );
    if (!quiz)
      return res
        .status(404)
        .json({ message: "Quiz not found or unauthorized" });
    res.json({ message: "Quiz updated.", quiz });
  } catch (err) {
    res.status(500).json({ message: "Could not update quiz." });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findOneAndDelete({
      _id: quizId,
      user: req.user.userId,
    });
    if (!quiz)
      return res
        .status(404)
        .json({ message: "Quiz not found or unauthorized" });
    res.json({ message: "Quiz deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete quiz." });
  }
};
