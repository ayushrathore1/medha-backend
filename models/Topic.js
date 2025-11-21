const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    subject: {
      type: String,
      default: "General",
    },
  },
  { timestamps: true }
);

// Ensure unique topic name per user
TopicSchema.index({ name: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model("Topic", TopicSchema);
