const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    A: String,
    B: String,
    C: String,
    D: String,
  },
  answer: { type: String, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    subject: { type: String, trim: true },
    questions: [questionSchema],
    isAIGenerated: { type: Boolean, default: false },
    attempts: [
      {
        attemptDate: { type: Date, default: Date.now },
        answers: [String],
        score: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
