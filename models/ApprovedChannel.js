const mongoose = require("mongoose");

const approvedChannelSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    channelName: {
      type: String,
      required: true,
      trim: true,
    },
    channelUrl: {
      type: String,
      required: true,
      trim: true,
    },
    subjectTags: {
      type: [String],
      default: [],
      index: true,
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApprovedChannel", approvedChannelSchema);
