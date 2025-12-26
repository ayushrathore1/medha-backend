const mongoose = require('mongoose');

/**
 * QuestionSolution Schema
 * Caches AI-generated solutions for exam questions to avoid regeneration
 */
const QuestionSolutionSchema = new mongoose.Schema({
  // Unique identifier for the question (composite key)
  questionHash: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  // Question details for reference
  questionText: { type: String, required: true },
  subjectName: { type: String, required: true },
  unitSerial: { type: Number },
  unitName: { type: String },
  marks: { type: Number },
  
  // The generated solution
  solution: { type: String, required: true },
  
  // Solution metadata
  mode: { 
    type: String, 
    enum: ['quick', 'deep', 'fallback'], 
    default: 'deep' 
  },
  
  // Analysis data from multi-layer AI
  analysis: {
    questionType: String,
    complexity: String,
    keyTopics: [String],
    needsDiagram: Boolean,
    needsFormulas: Boolean,
    needsCode: Boolean,
    needsTable: Boolean,
    needsSteps: Boolean,
    estimatedWritingTime: String,
  },
  
  // Feedback from AI review
  feedback: {
    overallScore: Number,
    strengths: [String],
    examinerTips: [String],
  },
  
  // UI template configuration
  uiTemplate: {
    template: String,
    config: mongoose.Schema.Types.Mixed
  },
  
  // Generation metadata
  metadata: {
    totalTime: Number,
    model: String,
    layers: mongoose.Schema.Types.Mixed
  },
  
  // Usage stats
  viewCount: { type: Number, default: 1 },
  lastAccessedAt: { type: Date, default: Date.now },
  
  // Who generated this
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true 
});

// Compound index for faster lookups
QuestionSolutionSchema.index({ questionHash: 1, mode: 1 });

// Create hash from question details
QuestionSolutionSchema.statics.createHash = function(questionText, subjectName, marks) {
  // Simple hash based on normalized question text and subject
  const normalizedQuestion = questionText
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
  
  const combined = `${normalizedQuestion}|${subjectName?.toLowerCase() || ''}|${marks || 0}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

module.exports = mongoose.model('QuestionSolution', QuestionSolutionSchema);
