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
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
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
