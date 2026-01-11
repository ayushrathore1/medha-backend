const mongoose = require("mongoose");

/**
 * UserPracticeProgress Schema
 * Tracks user progress on practice questions
 */
const userPracticeProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticeQuestion",
      required: true,
    },

    // Status of completion
    status: {
      type: String,
      enum: ["not-started", "attempted", "solved"],
      default: "not-started",
    },

    // User's latest code submission
    lastSubmittedCode: {
      type: String,
      default: "",
    },

    // Attempt history
    attempts: [
      {
        code: String,
        output: String,
        isCorrect: Boolean,
        executionTime: Number, // in ms
        attemptedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Total attempts count
    totalAttempts: {
      type: Number,
      default: 0,
    },

    // Time spent on this question (in seconds)
    timeSpent: {
      type: Number,
      default: 0,
    },

    // First solved timestamp
    firstSolvedAt: {
      type: Date,
    },

    // Hint used count
    hintsUsed: {
      type: Number,
      default: 0,
    },

    // Did user view solution?
    viewedSolution: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user progress queries
userPracticeProgressSchema.index({ user: 1, question: 1 }, { unique: true });
userPracticeProgressSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model(
  "UserPracticeProgress",
  userPracticeProgressSchema
);
