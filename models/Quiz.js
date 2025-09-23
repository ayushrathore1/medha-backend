const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }], // e.g. ["A", "B", "C", "D"]
    answer: { type: String, required: true }, // e.g. "A"
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    questions: [questionSchema],
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
