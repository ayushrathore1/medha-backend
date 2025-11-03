const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: {
    A: { type: String, required: true, trim: true },
    B: { type: String, required: true, trim: true },
    C: { type: String, required: true, trim: true },
    D: { type: String, required: true, trim: true },
  },
  answer: {
    type: String,
    required: true,
    enum: ["A", "B", "C", "D"], // ← VALIDATION: Only valid options
    uppercase: true, // ← Auto-convert to uppercase
  },
});

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ← Performance: Index for user queries
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: false, // ← FIXED: Allow topic-based quizzes without notes
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      index: true, // ← Performance: Index for subject filtering
    },
    topic: {
      type: String,
      trim: true,
      maxlength: 200, // ← Prevent abuse
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (questions) {
          return questions && questions.length > 0 && questions.length <= 50;
        },
        message: "Quiz must have between 1 and 50 questions",
      },
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    attempts: [
      {
        attemptDate: { type: Date, default: Date.now },
        answers: {
          type: [String],
          validate: {
            validator: function (answers) {
              // Ensure answers array matches questions length
              const quiz = this.parent();
              return answers.length === quiz.questions.length;
            },
            message: "Answers array must match questions length",
          },
        },
        score: {
          type: Number,
          min: 0,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// ← CRITICAL VALIDATION: Quiz must have either note OR topic
quizSchema.pre("save", function (next) {
  if (!this.note && !this.topic) {
    return next(
      new Error("Quiz must have either a 'note' reference or a 'topic' string")
    );
  }
  next();
});

// ← CRITICAL VALIDATION: If topic-based, ensure topic exists
quizSchema.pre("save", function (next) {
  if (!this.note && (!this.topic || this.topic.trim().length === 0)) {
    return next(new Error("Topic-based quiz must have a non-empty topic"));
  }
  next();
});

// Performance: Compound index for common query patterns
quizSchema.index({ user: 1, createdAt: -1 });
quizSchema.index({ user: 1, subject: 1 });
quizSchema.index({ user: 1, note: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
