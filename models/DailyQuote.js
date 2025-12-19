const mongoose = require("mongoose");

const dailyQuoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    default: null,
  },
  date: {
    type: String, // Store as YYYY-MM-DD for easy lookup
    required: true,
    unique: true, // This already creates an index
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DailyQuote", dailyQuoteSchema);

