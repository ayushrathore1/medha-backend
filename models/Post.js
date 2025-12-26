const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Media attachments (images, videos, files)
    mediaUrls: [{
      url: String,
      type: {
        type: String,
        enum: ["image", "video", "file"],
      },
      filename: String,
    }],
    // Category tag
    tag: {
      type: String,
      enum: ["doubts", "resources", "memes", "off-topic", "announcements"],
      default: "off-topic",
    },
    // Voting
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    // Hot score for ranking (calculated by algorithm)
    hotScore: {
      type: Number,
      default: 0,
    },
    // Comment count for display
    commentCount: {
      type: Number,
      default: 0,
    },
    // Unique share link slug
    shareSlug: {
      type: String,
      unique: true,
      sparse: true,
    },
    // @mentions extracted from content
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Track if @admin was mentioned
    hasAdminMention: {
      type: Boolean,
      default: false,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
postSchema.index({ hotScore: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tag: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ shareSlug: 1 });

// Generate share slug before saving
postSchema.pre("save", function(next) {
  if (!this.shareSlug) {
    // Generate unique 8-char slug
    this.shareSlug = Math.random().toString(36).substring(2, 10);
  }
  next();
});

// Virtual for net score
postSchema.virtual("score").get(function() {
  return this.upvotes - this.downvotes;
});

module.exports = mongoose.model("Post", postSchema);
