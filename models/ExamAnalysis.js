const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  qCode: { type: String, required: true },
  marks: { type: Number, required: true },
  text: { type: String, required: true } // HTML string
});

const UnitSchema = new mongoose.Schema({
  unitSerial: { type: Number, required: true },
  unitName: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  youtubePlaylistUrl: { type: String, default: null },
  questions: [QuestionSchema]
});

const YearDataSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  units: [UnitSchema]
});

const ExamAnalysisSchema = new mongoose.Schema({
  subjectName: { type: String, required: true, unique: true },
  totalPaperMarks: { type: Number, required: true },
  years: [YearDataSchema]
}, { timestamps: true });

module.exports = mongoose.model('ExamAnalysis', ExamAnalysisSchema);
