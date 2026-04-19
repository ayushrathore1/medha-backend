const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    // Optional — no login required
    emoji: {
      type: String,
      default: null,
    },
    // Auto-captured metadata
    userAgent: String,
    ip: String,
    // Admin fields
    isRead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["new", "noted", "planned", "done", "wontdo"],
      default: "new",
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suggestion", SuggestionSchema);
