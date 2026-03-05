const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  query: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    default: "",
  },
  unit: {
    type: String,
    default: "",
  },
  resultCount: {
    type: Number,
    default: 0,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

searchHistorySchema.index({ searchedAt: -1 });
searchHistorySchema.index({ userId: 1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
