const express = require("express");
const router = express.Router();

const Note = require("../models/Note");
const Quiz = require("../models/Quiz"); // CORRECT
const auth = require("../middleware/auth");

// ...same as before...

// Replace all MCQ -> Quiz below!

router.post("/from-note", auth, async (req, res, next) => {
  try {
    const { noteId, mcqs } = req.body;

    const note = await Note.findOne({ _id: noteId, owner: req.user.userId });
    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    // Save MCQs to Quiz model and note
    const savedMCQs = [];
    for (const mcqObj of mcqs) {
      const newMCQ = new Quiz({
        // <-- USE Quiz here
        note: noteId,
        question: mcqObj.question,
        options: mcqObj.options,
        correctAnswer: mcqObj.correctAnswer,
        owner: req.user.userId,
        subject: note.subject,
      });
      await newMCQ.save();
      savedMCQs.push(newMCQ);
    }

    note.mcqs = savedMCQs.map((mcq) => ({
      question: mcq.question,
      options: mcq.options,
      correctAnswer: mcq.correctAnswer,
    }));
    await note.save();

    res.status(201).json({
      message: "MCQs generated and saved successfully!",
      mcqs: savedMCQs,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes
router.get("/", auth, async (req, res, next) => {
  try {
    const { subject, noteId } = req.query;
    const query = { owner: req.user.userId };
    if (subject) query.subject = subject;
    if (noteId) query.note = noteId;

    const mcqs = await Quiz.find(query).sort({ createdAt: -1 }); // <-- USE Quiz here

    res.json({ mcqs });
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:id
router.get("/:id", auth, async (req, res, next) => {
  try {
    const mcq = await Quiz.findOne({
      // <-- USE Quiz here
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    res.json({ mcq });
  } catch (err) {
    next(err);
  }
});

// PUT /api/quizzes/:id
router.put("/:id", auth, async (req, res, next) => {
  try {
    const { question, options, correctAnswer, subject } = req.body;

    const mcq = await Quiz.findOneAndUpdate(
      // <-- USE Quiz here
      { _id: req.params.id, owner: req.user.userId },
      { question, options, correctAnswer, subject, updatedAt: Date.now() },
      { new: true }
    );

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found or unauthorized" });
    }

    res.json({
      message: "MCQ updated successfully",
      mcq,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/quizzes/:id
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const mcq = await Quiz.findOneAndDelete({
      // <-- USE Quiz here
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found or unauthorized" });
    }

    res.json({ message: "MCQ deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
