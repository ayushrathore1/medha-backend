const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      default: null,
    },
    originalName: {
      type: String,
      default: null,
    },
    extractedText: {
      type: String,
      default: "",
    },
    flashcards: [
      {
        question: String,
        answer: String,
      },
    ],
    mcqs: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema);
