const mongoose = require("mongoose");

/**
 * UniversityContext Model
 * Stores university and branch-specific context data for personalized chatbot interactions
 */
const universityContextSchema = new mongoose.Schema({
  // University identifier (e.g., "RTU", "GGSIPU", "DTU", "AKTU")
  university: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Branch identifier (e.g., "CSE", "IT", "ECE") or "ALL" for all branches
  branch: {
    type: String,
    required: true,
    trim: true,
    default: "ALL",
  },
  
  // Semester this context applies to (e.g., "3" for 3rd sem, "ALL" for all)
  semester: {
    type: String,
    default: "ALL",
  },
  
  // University full name for display
  universityFullName: {
    type: String,
    trim: true,
  },
  
  // Exam schedule in structured format
  examSchedule: [{
    date: String,
    subject: String,
    subjectCode: String,
  }],
  
  // Subjects available for this university/branch combination
  subjects: [{
    name: String,
    code: String,
    keywords: [String], // Keywords to match in user queries
  }],
  
  // Custom system prompt additions for this university
  systemPromptAdditions: {
    type: String,
    default: "",
  },
  
  // Additional context info (generic key-value for flexibility)
  additionalInfo: {
    type: Map,
    of: String,
  },
  
  // Whether this context is currently active
  isActive: {
    type: Boolean,
    default: true,
  },
  
}, { timestamps: true });

// Compound index for efficient lookup
universityContextSchema.index({ university: 1, branch: 1, semester: 1 }, { unique: true });

// Static method to find context for a user profile
universityContextSchema.statics.findForUser = async function(university, branch, semester = "ALL") {
  // Try exact match first
  let context = await this.findOne({ 
    university, 
    branch, 
    semester,
    isActive: true 
  });
  
  // If no exact match, try university + branch for any semester
  if (!context) {
    context = await this.findOne({ 
      university, 
      branch, 
      semester: "ALL",
      isActive: true 
    });
  }
  
  // If no branch-specific, try university-wide context
  if (!context) {
    context = await this.findOne({ 
      university, 
      branch: "ALL",
      isActive: true 
    });
  }
  
  return context;
};

const UniversityContext = mongoose.model("UniversityContext", universityContextSchema);

module.exports = UniversityContext;
