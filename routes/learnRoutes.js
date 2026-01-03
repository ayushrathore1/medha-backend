const express = require('express');
const router = express.Router();
const LearnContent = require('../models/LearnContent');
const authMiddleware = require('../middleware/auth');

/**
 * Learn Routes - API for "Learn the Concepts" feature
 * Provides video lectures and PDF notes organized by subject
 */

// GET /api/learn/subjects - Get all subjects with content counts
router.get('/subjects', authMiddleware, async (req, res) => {
  try {
    const subjects = await LearnContent.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$subject',
          videoCount: {
            $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] }
          },
          pdfCount: {
            $sum: { $cond: [{ $eq: ['$type', 'pdf'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likeCount' }
        }
      },
      {
        $project: {
          _id: 0,
          subject: '$_id',
          videoCount: 1,
          pdfCount: 1,
          totalViews: 1,
          totalLikes: 1,
          totalContent: { $add: ['$videoCount', '$pdfCount'] }
        }
      },
      { $sort: { subject: 1 } }
    ]);

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Error fetching learn subjects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subjects' 
    });
  }
});

// GET /api/learn/subjects/:subject/content - Get all content for a subject
router.get('/subjects/:subject/content', authMiddleware, async (req, res) => {
  try {
    const { subject } = req.params;
    const { type } = req.query; // Optional filter by type (video/pdf)
    
    const query = { 
      subject: decodeURIComponent(subject),
      isActive: true 
    };
    
    if (type && ['video', 'pdf'].includes(type)) {
      query.type = type;
    }
    
    const content = await LearnContent.find(query)
      .select('-__v')
      .sort({ order: 1, createdAt: -1 });
    
    // Check if current user has liked each content
    const userId = req.userId;
    const contentWithLikeStatus = content.map(item => ({
      ...item.toObject(),
      isLiked: item.likes.some(id => id.toString() === userId)
    }));

    res.json({
      success: true,
      subject: decodeURIComponent(subject),
      content: contentWithLikeStatus
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch content' 
    });
  }
});

// POST /api/learn/:contentId/like - Toggle like on content
router.post('/:contentId/like', authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.userId;
    
    const content = await LearnContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }
    
    const likeIndex = content.likes.findIndex(
      id => id.toString() === userId
    );
    
    let isLiked;
    if (likeIndex > -1) {
      // Remove like
      content.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      // Add like
      content.likes.push(userId);
      isLiked = true;
    }
    
    await content.save();
    
    res.json({
      success: true,
      isLiked,
      likeCount: content.likeCount
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update like' 
    });
  }
});

// POST /api/learn/:contentId/view - Increment view count
router.post('/:contentId/view', authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await LearnContent.findByIdAndUpdate(
      contentId,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }
    
    res.json({
      success: true,
      views: content.views
    });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update view count' 
    });
  }
});

// GET /api/learn/:contentId - Get single content item
router.get('/:contentId', authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.userId;
    
    const content = await LearnContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }
    
    res.json({
      success: true,
      content: {
        ...content.toObject(),
        isLiked: content.likes.some(id => id.toString() === userId)
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch content' 
    });
  }
});

// Admin routes for managing content
// POST /api/learn/admin/content - Create new content (admin only)
router.post('/admin/content', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const {
      subject,
      semester,
      unit,
      title,
      description,
      type,
      videoUrl,
      videoId,
      videoFileId, // ImageKit file ID for deletion
      thumbnailUrl,
      thumbnailFileId,
      duration,
      pdfUrl,
      pdfFileId, // ImageKit file ID for deletion
      pdfThumbnailUrl,
      pageCount,
      audioHindiUrl,
      audioHindiFileId,
      audioEnglishUrl,
      audioEnglishFileId,
      order
    } = req.body;
    
    const content = await LearnContent.create({
      subject,
      semester: semester || 3,
      unit,
      title,
      description,
      type,
      videoUrl,
      videoId,
      videoFileId,
      thumbnailUrl,
      thumbnailFileId,
      duration,
      pdfUrl,
      pdfFileId,
      pdfThumbnailUrl,
      pageCount,
      audioHindiUrl,
      audioHindiFileId,
      audioEnglishUrl,
      audioEnglishFileId,
      order: order || 0
    });
    
    res.status(201).json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create content' 
    });
  }
});

// GET /api/learn/admin/imagekit-auth - Get ImageKit authentication for uploads
router.get('/admin/imagekit-auth', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const imagekit = require('../config/imagekit');
    
    // Check if ImageKit is configured
    if (!imagekit.isConfigured()) {
      console.error("ImageKit not configured - missing credentials");
      return res.status(500).json({ 
        success: false, 
        message: "ImageKit is not configured on the server" 
      });
    }
    
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json({
      success: true,
      ...authenticationParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ayushrathore1"
    });
  } catch (error) {
    console.error('Error generating ImageKit auth:', error);
    res.status(500).json({ 
      success: false, 
    });
  }
});

// PATCH /api/learn/admin/content/:contentId - Update content (admin only)
router.patch('/admin/content/:contentId', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const { contentId } = req.params;
    const imagekit = require('../config/imagekit');
    
    const content = await LearnContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }
    
    const {
      title,
      description,
      unit,
      audioHindiUrl,
      audioHindiFileId,
      audioEnglishUrl,
      audioEnglishFileId,
      pageCount
    } = req.body;
    
    // Delete old audio files if being replaced
    if (audioHindiFileId && content.audioHindiFileId && content.audioHindiFileId !== audioHindiFileId) {
      try {
        await imagekit.deleteFile(content.audioHindiFileId);
      } catch (deleteErr) {
        console.error('Failed to delete old Hindi audio:', deleteErr);
      }
    }
    
    if (audioEnglishFileId && content.audioEnglishFileId && content.audioEnglishFileId !== audioEnglishFileId) {
      try {
        await imagekit.deleteFile(content.audioEnglishFileId);
      } catch (deleteErr) {
        console.error('Failed to delete old English audio:', deleteErr);
      }
    }
    
    // Update fields
    if (title) content.title = title;
    if (description !== undefined) content.description = description;
    if (unit !== undefined) content.unit = unit;
    if (pageCount) content.pageCount = pageCount;
    
    // Update audio URLs
    if (audioHindiUrl !== undefined) {
      content.audioHindiUrl = audioHindiUrl || null;
      content.audioHindiFileId = audioHindiFileId || null;
    }
    if (audioEnglishUrl !== undefined) {
      content.audioEnglishUrl = audioEnglishUrl || null;
      content.audioEnglishFileId = audioEnglishFileId || null;
    }
    
    await content.save();
    
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update content' 
    });
  }
});

// DELETE /api/learn/admin/content/:contentId - Delete content (admin only)
router.delete('/admin/content/:contentId', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const { contentId } = req.params;
    const imagekit = require('../config/imagekit');
    
    const content = await LearnContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content not found' 
      });
    }
    
    // Delete files from ImageKit
    const filesToDelete = [
      content.videoFileId,
      content.pdfFileId,
      content.thumbnailFileId
    ].filter(Boolean);
    
    for (const fileId of filesToDelete) {
      try {
        await imagekit.deleteFile(fileId);
      } catch (deleteError) {
        console.warn(`Could not delete file ${fileId}:`, deleteError.message);
      }
    }
    
    // Delete from database
    await LearnContent.findByIdAndDelete(contentId);
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete content' 
    });
  }
});

// GET /api/learn/admin/subjects - Get list of available subjects for admin
router.get('/admin/subjects', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    // Return predefined subjects for 3rd semester CSE
    const subjects = [
      "Advanced Engineering Mathematics",
      "Data Structures and Algorithms",
      "Object Oriented Programming",
      "Digital Electronics",
      "Software Engineering",
      "Technical Communication",
      "Managerial Economics and Financial Accounting"
    ];
    
    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Error fetching admin subjects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subjects' 
    });
  }
});

module.exports = router;

