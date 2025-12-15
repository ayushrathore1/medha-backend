const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    // Reference to the conversation
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    // Who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Message content
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // Read status per user (for group/broadcast)
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Is this a broadcast message
    isBroadcast: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
chatMessageSchema.index({ conversation: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
