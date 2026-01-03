const mongoose = require('mongoose');

/**
 * LearnContent Schema
 * Stores video lectures and PDF notes for each subject
 * Used by the "Learn the Concepts" feature on RTU Exams page
 */
const LearnContentSchema = new mongoose.Schema({
  // Subject identification
  subject: { 
    type: String, 
    required: true, 
    index: true 
  },
  semester: { 
    type: Number, 
    default: 3 
  },
  unit: { 
    type: Number, 
    default: null 
  },
  
  // Content metadata
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    default: ''
  },
  type: { 
    type: String, 
    enum: ['video', 'pdf'], 
    required: true 
  },
  
  // Video-specific fields
  videoUrl: { 
    type: String 
  },
  videoId: {
    type: String // YouTube video ID for embedding
  },
  videoFileId: {
    type: String // ImageKit file ID for deletion
  },
  thumbnailUrl: { 
    type: String 
  },
  thumbnailFileId: {
    type: String // ImageKit file ID for deletion
  },
  duration: { 
    type: String // Format: "12:34"
  },
  
  // PDF-specific fields
  pdfUrl: { 
    type: String 
  },
  pdfFileId: {
    type: String // ImageKit file ID for deletion
  },
  pdfThumbnailUrl: { 
    type: String 
  },
  pageCount: { 
    type: Number 
  },
  
  // Audio explanation fields (for PDFs)
  audioHindiUrl: {
    type: String
  },
  audioHindiFileId: {
    type: String // ImageKit file ID for deletion
  },
  audioEnglishUrl: {
    type: String
  },
  audioEnglishFileId: {
    type: String // ImageKit file ID for deletion
  },
  
  // Engagement metrics
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  views: { 
    type: Number, 
    default: 0 
  },
  
  // Ordering and status
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
LearnContentSchema.index({ subject: 1, type: 1 });
LearnContentSchema.index({ subject: 1, order: 1 });

// Update likeCount when likes array changes
LearnContentSchema.pre('save', function(next) {
  this.likeCount = this.likes.length;
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('LearnContent', LearnContentSchema);
