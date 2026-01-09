const mongoose = require('mongoose');

/**
 * LearnContent Schema
 * Stores video lectures, PDF notes, and animated visualizations for each subject
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
    enum: ['video', 'pdf', 'animation'], 
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
  
  // Animation-specific fields
  animationId: {
    type: String // Unique identifier mapping to animation component file
  },
  animationSteps: {
    type: Number, // Total number of animation steps
    default: 1
  },
  animationCategory: {
    type: String // e.g., 'digital-logic', 'data-structures'
  },
  animationThumbnailUrl: {
    type: String // Thumbnail for animation card
  },
  
  // Slide-specific data for animations (editable by admin/team)
  slideData: [{
    stepNumber: {
      type: Number,
      required: true
    },
    voiceNoteUrl: {
      type: String // Cloudinary URL for voice note audio
    },
    voiceNotePublicId: {
      type: String // Cloudinary public_id for deletion
    },
    notes: {
      content: { type: String, default: '' }, // Rich text/markdown content
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: String, default: '16px' },
      fontColor: { type: String, default: '#ffffff' },
      imageUrl: { type: String }, // Cloudinary URL for note image
      imagePublicId: { type: String }, // Cloudinary public_id
      backgroundColor: { type: String, default: 'rgba(99,102,241,0.1)' }
    },
    customOverrides: {
      type: mongoose.Schema.Types.Mixed, // For admin text edits (key-value pairs)
      default: {}
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  
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
