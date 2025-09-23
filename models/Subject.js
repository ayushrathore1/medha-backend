const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique subject name per user (case-insensitive)
subjectSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
