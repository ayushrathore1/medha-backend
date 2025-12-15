const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Participants in the conversation (usually admin + user)
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    // Last message preview for conversation list
    lastMessage: {
      text: { type: String, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
    // Track unread count per user { odId: count }
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    // Is this a broadcast conversation (admin to all)
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    // For broadcast: track which users have received it
    broadcastRecipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ "lastMessage.timestamp": -1 });
conversationSchema.index({ isBroadcast: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
