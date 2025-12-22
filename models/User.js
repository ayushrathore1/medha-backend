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
    featureNotificationViews: {
      type: Number,
      default: 0,
    },
    likedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    }],
    // Clerk integration fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    clerkUserId: {
      type: String,
      sparse: true,
      unique: true,
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
  }
  next();
});


module.exports = mongoose.model("User", userSchema);
