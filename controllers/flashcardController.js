const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Manual flashcard creation
exports.createFlashcard = async (req, res) => {
  try {
    const { noteId, question, answer, subject } = req.body;
    if (!noteId || !question || !answer)
      return res.status(400).json({ message: "Missing required fields." });

    // Validate note ownership
    const note = await Note.findOne({ _id: noteId, owner: req.user.userId });
    if (!note)
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });

    const flashcard = new Flashcard({
      note: noteId,
      question,
      answer,
      owner: req.user.userId,
      subject: subject || note.subject,
      isAIGenerated: false,
    });
    await flashcard.save();
    res.status(201).json({ message: "Flashcard created.", flashcard });
  } catch (err) {
    res.status(500).json({ message: "Server error creating flashcard." });
  }
};

// AI-powered GROQ flashcard generation
exports.generateAIFlashcards = async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ message: "noteId is required" });
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const prompt = `
From the following study notes, create the most important flashcards as an array of JSON objects in the form [{"question":"...", "answer":"..."}]. Focus on key concepts, definitions, and exam-relevant points. 
Notes:
${note.extractedText || note.content}
    `.trim();

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates study flashcards from given notes. Always respond ONLY with an array of objects in JSON.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = groqRes.data.choices[0].message.content;
    let flashcards = [];
    try {
      flashcards = JSON.parse(text);
      if (!Array.isArray(flashcards)) throw new Error("Not an array");
    } catch {
      return res.status(400).json({
        message: "AI could not create valid JSON flashcards.",
        raw: text,
      });
    }

    // Save generated flashcards
    const createdCards = await Promise.all(
      flashcards.map((fc) =>
        Flashcard.create({
          note: noteId,
          question: fc.question,
          answer: fc.answer,
          owner: req.user.userId,
          subject: note.subject,
          isAIGenerated: true,
        })
      )
    );

    res
      .status(201)
      .json({ message: "AI flashcards generated.", flashcards: createdCards });
  } catch (err) {
    console.error(
      "AI Flashcard Generation Error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Could not generate AI flashcards." });
  }
};

// Get all flashcards
exports.getFlashcards = async (req, res) => {
  try {
    const { noteId, subject } = req.query;
    let filter = { owner: req.user.userId };
    if (noteId) filter.note = noteId;
    if (subject) filter.subject = subject;
    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ flashcards });
  } catch (err) {
    res.status(500).json({ message: "Could not get flashcards." });
  }
};

// Get single flashcard
exports.getFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    const flashcard = await Flashcard.findOne({
      _id: id,
      owner: req.user.userId,
    });
    if (!flashcard)
      return res.status(404).json({ message: "Flashcard not found" });
    res.status(200).json({ flashcard });
  } catch (err) {
    res.status(500).json({ message: "Could not get flashcard." });
  }
};

// Update flashcard
exports.updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, subject } = req.body;
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: id, owner: req.user.userId },
      { question, answer, subject, updatedAt: Date.now() },
      { new: true }
    );
    if (!flashcard)
      return res
        .status(404)
        .json({ message: "Flashcard not found or not owned by user" });
    res.status(200).json({ message: "Flashcard updated.", flashcard });
  } catch (err) {
    res.status(500).json({ message: "Could not update flashcard." });
  }
};

// Delete flashcard
exports.deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const flashcard = await Flashcard.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });
    if (!flashcard)
      return res
        .status(404)
        .json({ message: "Flashcard not found or not owned by user" });
    res.status(200).json({ message: "Flashcard deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete flashcard." });
  }
};
