const mongoose = require("mongoose");

const SyllabusUnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true },
  title: { type: String, required: true },
  topics: [{ type: String }],
  hours: { type: Number, default: 0 },
});

const SyllabusSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: "" },
  semester: { type: Number, default: 0 },
  units: [SyllabusUnitSchema],
});

const UserSyllabusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    originalFileUrl: { type: String, default: "" },
    rawText: { type: String, default: "" },
    subjects: [SyllabusSubjectSchema],
    university: { type: String, default: "" },
    branch: { type: String, default: "" },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSyllabus", UserSyllabusSchema);
