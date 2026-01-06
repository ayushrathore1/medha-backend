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
    university: {
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
    gender: {
      type: String,
      enum: ["", "Male", "Female", "Other"],
      default: "",
    },
    avatar: {
      type: String, // URL to profile picture
      default: "",
    },
    avatarIndex: {
      type: Number,
      default: 0,
      min: 0,
      max: 19,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    activityHistory: [{
      type: Date,
    }],
    dailyPlan: {
      type: String,
      default: "",
    },
    dailyPlanDate: {
      type: Date,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // New Role System: 'user', 'team', 'admin'
    // 'team' members can manage content but have restricted access to user data
    role: {
      type: String,
      enum: ["user", "team", "admin"],
      default: "user",
    },
    featureNotificationViews: {
      type: Number,
      default: 0,
    },
    likedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    }],
    // Clerk integration fields
    // Note: Clerk is now ONLY used for email verification (sending OTP codes)
    // Authentication is handled entirely by MongoDB/bcrypt
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // MIGRATION NOTE: The old clerkUserId field and its unique index must be dropped
    // Run in MongoDB: db.users.dropIndex("clerkUserId_1")
    // ====== CHARCHA FIELDS ======
    // Unique fun username for Charcha (e.g., "CleverPanda42")
    charchaUsername: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    // Karma points from upvotes/downvotes
    karma: {
      type: Number,
      default: 0,
    },
    // User rank based on karma (Noob, Scholar, Expert, Guru, Legend)
    rank: {
      type: String,
      enum: ["Noob", "Scholar", "Expert", "Guru", "Legend"],
      default: "Noob",
    },
    // Follower and following counts (cached for performance)
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    // Custom flair chosen by user
    customFlair: {
      type: String,
      maxlength: 30,
      default: "",
    },
    // Anonymous posting limits
    anonymousPostsToday: {
      type: Number,
      default: 0,
    },
    lastAnonymousReset: {
      type: Date,
      default: null,
    },
    // When user joined Charcha
    charchaJoinedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Pre-save hook to set admin for specific email
userSchema.pre("save", function (next) {
  if (this.email === "rathoreayush512@gmail.com") {
    this.isAdmin = true;
    this.role = "admin";
  }
  next();
});


module.exports = mongoose.model("User", userSchema);
