const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["registration", "login", "verification"],
    default: "registration",
  },
  used: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — auto-delete expired docs
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient lookups
otpSchema.index({ email: 1, code: 1, used: 1 });

module.exports = mongoose.model("Otp", otpSchema);
