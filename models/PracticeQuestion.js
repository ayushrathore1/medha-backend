const mongoose = require("mongoose");

/**
 * PracticeQuestion Schema
 * Stores programming practice questions for C/C++ OOPs concepts
 */
const practiceQuestionSchema = new mongoose.Schema(
  {
    // Question metadata
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Category and tags
    category: {
      type: String,
      enum: [
        "classes-objects",
        "inheritance",
        "polymorphism",
        "encapsulation",
        "abstraction",
        "constructors-destructors",
        "operator-overloading",
        "templates",
        "exception-handling",
        "file-handling",
        "stl",
        "pointers",
        "basic-syntax",
        "arrays-strings",
        "functions",
        "other",
      ],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Programming language
    language: {
      type: String,
      enum: ["cpp", "c"],
      default: "cpp",
    },

    // Code template (starter code for user)
    starterCode: {
      type: String,
      required: true,
    },

    // Solution code (for reference/admin)
    solutionCode: {
      type: String,
      required: true,
    },

    // Test cases
    testCases: [
      {
        input: {
          type: String,
          default: "",
        },
        expectedOutput: {
          type: String,
          required: true,
        },
        isHidden: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],

    // Hints for the question
    hints: [
      {
        type: String,
      },
    ],

    // Explanation of the solution
    explanation: {
      type: String,
      default: "",
    },

    // RTU PYQ Information
    pyqInfo: {
      year: {
        type: Number, // e.g., 2019, 2022, 2024, 2025
      },
      examDate: {
        type: String, // e.g., "Dec 2019", "April/May 2022", "Jan/Feb 2024"
      },
      paperCode: {
        type: String, // e.g., "3E1139"
      },
      part: {
        type: String, // e.g., "B" or "C"
        enum: ["A", "B", "C"],
      },
      questionNumber: {
        type: Number, // e.g., 1, 2, 3
      },
      marks: {
        type: Number, // e.g., 8, 10, 15
      },
    },

    // ChatGPT Solution Link
    chatgptSolutionLink: {
      type: String,
      trim: true,
    },

    // Related concepts (for learning)
    concepts: [
      {
        type: String,
      },
    ],

    // Question order/priority (for sequencing)
    order: {
      type: Number,
      default: 0,
    },

    // Statistics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    successfulAttempts: {
      type: Number,
      default: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Created by (admin/team member)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
practiceQuestionSchema.index({ category: 1, difficulty: 1, isActive: 1 });
practiceQuestionSchema.index({ language: 1, isActive: 1 });
practiceQuestionSchema.index({ order: 1 });

// Virtual for success rate
practiceQuestionSchema.virtual("successRate").get(function () {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.successfulAttempts / this.totalAttempts) * 100);
});

// Ensure virtuals are included in JSON output
practiceQuestionSchema.set("toJSON", { virtuals: true });
practiceQuestionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("PracticeQuestion", practiceQuestionSchema);
