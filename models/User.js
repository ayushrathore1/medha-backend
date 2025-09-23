const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // bcrypt hash, so actual user password should be validated before hashing
      select: false, // exclude by default from queries unless .select('+password')
    },
    college: {
      type: String,
      default: "",
      trim: true,
    },
    branch: {
      type: String,
      default: "",
      trim: true,
    },
    year: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String, // URL to profile picture
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Optional: Index for faster case-insensitive unique email lookup
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
