const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    htmlBody: {
      type: String,
      required: true,
    },
    sentCount: {
      type: Number,
      default: 0, // Number of times 'send action' was triggered for this content
    },
    totalRecipients: {
      type: Number,
      default: 0, // Total number of individual users reached across all sends
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly find duplicates by content
emailLogSchema.index({ subject: 1, htmlBody: 1 });

module.exports = mongoose.model("EmailLog", emailLogSchema);
