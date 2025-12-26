const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // Emoji or icon class
      required: true,
    },
    // Criteria type for automatic badge assignment
    criteriaType: {
      type: String,
      enum: [
        "first_post",
        "karma_threshold",
        "post_count",
        "comment_count",
        "helpful_answers",
        "streak",
        "manual", // Admin-assigned
      ],
      required: true,
    },
    // Value for threshold-based badges
    criteriaValue: {
      type: Number,
      default: 0,
    },
    // Rarity for display styling
    rarity: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Badge", badgeSchema);
