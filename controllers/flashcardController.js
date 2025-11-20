const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Manual flashcard creation
// Manual flashcard creation
exports.createFlashcard = async (req, res) => {
  try {
    const { noteId, question, answer, subject, topicName } = req.body;
    if (!question || !answer)
      return res.status(400).json({ message: "Missing required fields." });

    // Validate note ownership if noteId provided
    if (noteId) {
        const note = await Note.findOne({ _id: noteId, owner: req.user.userId });
        if (!note)
        return res
            .status(404)
            .json({ message: "Note not found or unauthorized" });
    }

    const flashcard = new Flashcard({
      note: noteId || undefined,
      question,
      answer,
      owner: req.user.userId,
      subject: subject || "General",
      topicName: topicName || "Manual",
      isAIGenerated: false,
      difficulty: "medium"
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
    const { noteId, topic, subject } = req.body;
    
    let promptContext = "";
    let subjectToUse = subject;

    if (noteId) {
      const note = await Note.findById(noteId);
      if (!note) return res.status(404).json({ message: "Note not found" });
      promptContext = `Notes:\n${note.extractedText || note.content}`;
      subjectToUse = note.subject;
    } else if (topic) {
      promptContext = `Topic: ${topic}`;
      if (!subjectToUse) return res.status(400).json({ message: "Subject is required when generating from topic" });
    } else {
      return res.status(400).json({ message: "Either noteId or topic is required" });
    }

    const prompt = `
From the following source, create the most important flashcards as an array of JSON objects in the form [{"question":"...", "answer":"..."}]. Focus on key concepts, definitions, and exam-relevant points. 
${promptContext}
    `.trim();

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates study flashcards. Always respond ONLY with an array of objects in JSON.",
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
      // Try to extract JSON from text if it contains markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          flashcards = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
             return res.status(400).json({
            message: "AI could not create valid JSON flashcards.",
            raw: text,
          });
        }
      } else {
        return res.status(400).json({
          message: "AI could not create valid JSON flashcards.",
          raw: text,
        });
      }
    }

    // Save generated flashcards
    const createdCards = await Promise.all(
      flashcards.map(async (fc) =>
        Flashcard.create({
          note: noteId || undefined,
          question: fc.question,
          answer: fc.answer,
          owner: req.user.userId,
          subject: subjectToUse,
          topicName: topic || (noteId ? (await Note.findById(noteId)).title : "General"),
          isAIGenerated: true,
          difficulty: "medium"
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

// Delete all flashcards of a specific topic
exports.deleteTopic = async (req, res) => {
  try {
    const { topicName } = req.params;
    const decodedTopicName = decodeURIComponent(topicName);
    
    await Flashcard.deleteMany({
      owner: req.user.userId,
      topicName: decodedTopicName
    });

    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting topic" });
  }
};

// Update flashcard difficulty
exports.updateDifficulty = async (req, res) => {
  try {
    const { id } = req.params;
    const { difficulty } = req.body;

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: id, owner: req.user.userId },
      { difficulty },
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    res.status(200).json({ message: "Difficulty updated", flashcard });
  } catch (err) {
    res.status(500).json({ message: "Error updating difficulty" });
  }
};

// Get review list (hard flashcards)
exports.getReviewList = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ 
      owner: req.user.userId,
      difficulty: "hard"
    }).sort({ updatedAt: -1 });
    
    res.status(200).json({ flashcards });
  } catch (err) {
    res.status(500).json({ message: "Error fetching review list" });
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
