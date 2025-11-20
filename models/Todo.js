const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      index: { expires: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", TodoSchema);
