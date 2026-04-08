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
  units: [SyllabusUnitSchema],
});

const UniversitySyllabusSchema = new mongoose.Schema(
  {
    university: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    subjects: [SyllabusSubjectSchema],
    // Track contribution
    uploadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    originalFileUrls: [{ type: String }],
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

// One document per university + branch + semester
UniversitySyllabusSchema.index(
  { university: 1, branch: 1, semester: 1 },
  { unique: true }
);

module.exports = mongoose.model("UniversitySyllabus", UniversitySyllabusSchema);
