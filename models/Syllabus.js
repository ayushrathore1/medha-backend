const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true },
  title: { type: String, required: true },
  topics: [{ type: String }],
  hours: { type: Number, default: 0 },
});

const SyllabusSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true },
  semester: { type: Number, required: true },
  credits: { type: Number, default: 3 },
  maxMarks: { type: Number, default: 100 },
  iaMarks: { type: Number, default: 30 },
  eteMarks: { type: Number, default: 70 },
  examDuration: { type: String, default: "3 Hours" },
  totalHours: { type: Number, default: 40 },
  units: [UnitSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Syllabus", SyllabusSchema);
