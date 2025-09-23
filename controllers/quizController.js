const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const env = require("../config/env");
const axios = require("axios");

// Get all quizzes for a user or note
exports.getQuizzes = async (req, res) => {
  try {
    const { noteId } = req.query;

    let filter = { user: req.user.id }; // <-- always use req.user.id
    if (noteId) filter.note = noteId;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error("Fetch Quizzes Error:", err);
    res.status(500).json({ message: "Error fetching quizzes." });
  }
};

// Get a single quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findOne({ _id: quizId, user: req.user.id }); // <-- use req.user.id
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json({ quiz });
  } catch (err) {
    console.error("Get QuizById Error:", err);
    res.status(500).json({ message: "Error fetching quiz." });
  }
};

// Create a quiz (manual input or from questions)
exports.createQuiz = async (req, res) => {
  try {
    const { noteId, subject, questions } = req.body;

    // Validation (require questions array)
    if (!noteId || !Array.isArray(questions) || questions.length === 0)
      return res
        .status(400)
        .json({ message: "noteId and questions are required." });

    const quiz = await Quiz.create({
      user: req.user.id, // <-- use req.user.id
      note: noteId,
      subject,
      questions,
    });

    res.status(201).json({ message: "Quiz created.", quiz });
  } catch (err) {
    console.error("Create Quiz Error:", err);
    res.status(500).json({ message: "Error creating quiz." });
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const deleted = await Quiz.findOneAndDelete({
      _id: quizId,
      user: req.user.id, // <-- use req.user.id
    });
    if (!deleted) return res.status(404).json({ message: "Quiz not found." });
    res.json({ message: "Quiz deleted." });
  } catch (err) {
    console.error("Delete Quiz Error:", err);
    res.status(500).json({ message: "Error deleting quiz." });
  }
};

// AI: Generate a quiz (array of MCQs) from note text via OpenAI (or any LLM)
exports.generateAIQuiz = async (req, res) => {
  try {
    const { noteId, subject } = req.body;
    if (!noteId)
      return res.status(400).json({ message: "noteId is required." });

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found." });

    // Use OpenAI or other LLM to create MCQs/quiz
    const prompt = `Generate a 10-question multiple choice quiz (MCQ) with 4 options and one correct answer for the following study material. Each question should be like:
{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}

Text:
${note.extractedText}`;

    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that generates MCQ quizzes from study notes.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let questions = [];
    try {
      questions = JSON.parse(aiRes.data.choices[0].message.content);
    } catch {
      questions = [];
    }

    const quiz = await Quiz.create({
      user: req.user.id, // <-- use req.user.id
      note: noteId,
      subject: subject || note.subject,
      questions,
      isAIGenerated: true,
    });

    res.status(201).json({ message: "Quiz generated.", quiz });
  } catch (err) {
    console.error(
      "AI Quiz Generation Error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Could not generate AI quiz." });
  }
};
