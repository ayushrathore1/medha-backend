const express = require("express");
const router = express.Router();
const LearnContent = require("../models/LearnContent");
const authMiddleware = require("../middleware/auth");

/**
 * Learn Routes - API for "Learn the Concepts" feature
 * Provides video lectures and PDF notes organized by subject
 */

// GET /api/learn/subjects - Get all subjects with content counts
router.get("/subjects", authMiddleware, async (req, res) => {
  try {
    const subjects = await LearnContent.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$subject",
          videoCount: {
            $sum: { $cond: [{ $eq: ["$type", "video"] }, 1, 0] },
          },
          pdfCount: {
            $sum: { $cond: [{ $eq: ["$type", "pdf"] }, 1, 0] },
          },
          animationCount: {
            $sum: { $cond: [{ $eq: ["$type", "animation"] }, 1, 0] },
          },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likeCount" },
        },
      },
      {
        $project: {
          _id: 0,
          subject: "$_id",
          videoCount: 1,
          pdfCount: 1,
          animationCount: 1,
          totalViews: 1,
          totalLikes: 1,
          totalContent: {
            $add: ["$videoCount", "$pdfCount", "$animationCount"],
          },
        },
      },
      { $sort: { subject: 1 } },
    ]);

    res.json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching learn subjects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
});

// GET /api/learn/subjects/:subject/content - Get all content for a subject
router.get("/subjects/:subject/content", authMiddleware, async (req, res) => {
  try {
    const { subject } = req.params;
    const { type } = req.query; // Optional filter by type (video/pdf)

    const query = {
      subject: decodeURIComponent(subject),
      isActive: true,
    };

    if (type && ["video", "pdf", "animation"].includes(type)) {
      query.type = type;
    }

    const content = await LearnContent.find(query)
      .select("-__v")
      .sort({ order: 1, createdAt: -1 });

    // Check if current user has liked each content
    const userId = req.userId;
    const contentWithLikeStatus = content.map((item) => ({
      ...item.toObject(),
      isLiked: item.likes.some((id) => id.toString() === userId),
    }));

    res.json({
      success: true,
      subject: decodeURIComponent(subject),
      content: contentWithLikeStatus,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
    });
  }
});

// POST /api/learn/:contentId/like - Toggle like on content
router.post("/:contentId/like", authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.userId;

    const content = await LearnContent.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const likeIndex = content.likes.findIndex((id) => id.toString() === userId);

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
      likeCount: content.likeCount,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update like",
    });
  }
});

// POST /api/learn/:contentId/view - Increment view count
router.post("/:contentId/view", authMiddleware, async (req, res) => {
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
        message: "Content not found",
      });
    }

    res.json({
      success: true,
      views: content.views,
    });
  } catch (error) {
    console.error("Error incrementing view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update view count",
    });
  }
});

// GET /api/learn/:contentId - Get single content item
router.get("/:contentId", authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.userId;

    const content = await LearnContent.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.json({
      success: true,
      content: {
        ...content.toObject(),
        isLiked: content.likes.some((id) => id.toString() === userId),
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
    });
  }
});

// Admin routes for managing content
// POST /api/learn/admin/content - Create new content (admin only)
router.post("/admin/content", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
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
      // Animation fields
      animationId,
      animationSteps,
      animationCategory,
      animationThumbnailUrl,
      // Audio fields
      audioHindiUrl,
      audioHindiFileId,
      audioEnglishUrl,
      audioEnglishFileId,
      order,
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
      // Animation fields
      animationId,
      animationSteps: animationSteps || 1,
      animationCategory,
      animationThumbnailUrl,
      // Audio fields
      audioHindiUrl,
      audioHindiFileId,
      audioEnglishUrl,
      audioEnglishFileId,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create content",
    });
  }
});

// GET /api/learn/admin/imagekit-auth - Get ImageKit authentication for uploads
router.get("/admin/imagekit-auth", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const User = require("../models/User");
    const user = await User.findById(req.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const imagekit = require("../config/imagekit");

    // Check if ImageKit is configured
    if (!imagekit.isConfigured()) {
      console.error("ImageKit not configured - missing credentials");
      return res.status(500).json({
        success: false,
        message: "ImageKit is not configured on the server",
      });
    }

    const crypto = require("crypto");
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
    const authenticationParameters = imagekit.getAuthenticationParameters(
      token,
      expire
    );
    res.json({
      success: true,
      ...authenticationParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint:
        process.env.IMAGEKIT_URL_ENDPOINT ||
        "https://ik.imagekit.io/ayushrathore1",
    });
  } catch (error) {
    console.error("Error generating ImageKit auth:", error);
    res.status(500).json({
      success: false,
    });
  }
});

// PATCH /api/learn/admin/content/:contentId - Update content (admin only)
router.patch("/admin/content/:contentId", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { contentId } = req.params;
    const imagekit = require("../config/imagekit");

    const content = await LearnContent.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const {
      title,
      description,
      unit,
      // Animation fields
      animationId,
      animationSteps,
      animationCategory,
      animationThumbnailUrl,
      // Audio fields
      audioHindiUrl,
      audioHindiFileId,
      audioEnglishUrl,
      audioEnglishFileId,
      pageCount,
    } = req.body;

    // Delete old audio files if being replaced
    if (
      audioHindiFileId &&
      content.audioHindiFileId &&
      content.audioHindiFileId !== audioHindiFileId
    ) {
      try {
        await imagekit.deleteFile(content.audioHindiFileId);
      } catch (deleteErr) {
        console.error("Failed to delete old Hindi audio:", deleteErr);
      }
    }

    if (
      audioEnglishFileId &&
      content.audioEnglishFileId &&
      content.audioEnglishFileId !== audioEnglishFileId
    ) {
      try {
        await imagekit.deleteFile(content.audioEnglishFileId);
      } catch (deleteErr) {
        console.error("Failed to delete old English audio:", deleteErr);
      }
    }

    // Update fields
    if (title) content.title = title;
    if (description !== undefined) content.description = description;
    if (unit !== undefined) content.unit = unit;
    if (pageCount) content.pageCount = pageCount;

    // Update animation fields
    if (animationId !== undefined) content.animationId = animationId;
    if (animationSteps !== undefined) content.animationSteps = animationSteps;
    if (animationCategory !== undefined)
      content.animationCategory = animationCategory;
    if (animationThumbnailUrl !== undefined)
      content.animationThumbnailUrl = animationThumbnailUrl;

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
      content,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content",
    });
  }
});

// DELETE /api/learn/admin/content/:contentId - Delete content (admin only)
router.delete("/admin/content/:contentId", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { contentId } = req.params;
    const imagekit = require("../config/imagekit");

    const content = await LearnContent.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Delete files from ImageKit
    const filesToDelete = [
      content.videoFileId,
      content.pdfFileId,
      content.thumbnailFileId,
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
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
    });
  }
});

// GET /api/learn/admin/subjects - Get list of available subjects for admin
router.get("/admin/subjects", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
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
      "Managerial Economics and Financial Accounting",
    ];

    res.json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching admin subjects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
});

// ============================================================================
// SLIDE DATA ROUTES (for animations with editable notes and voice notes)
// ============================================================================

const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// PATCH /api/learn/:id/slide/:step - Update slide data (notes, visibility, custom overrides)
router.patch("/:id/slide/:step", authMiddleware, async (req, res) => {
  try {
    // Fetch user to check admin/team status
    const User = require("../models/User");
    const user = await User.findById(req.userId);

    // Allow access for admins (isAdmin=true OR role='admin') or team members
    const hasAccess =
      user && (user.isAdmin || user.role === "admin" || user.role === "team");
    if (!hasAccess) {
      return res
        .status(403)
        .json({ success: false, message: "Admin/Team access required" });
    }

    const { id, step } = req.params;
    const stepNumber = parseInt(step);
    const { notes, customOverrides, isHidden } = req.body;

    const content = await LearnContent.findById(id);
    if (!content || content.type !== "animation") {
      return res
        .status(404)
        .json({ success: false, message: "Animation not found" });
    }

    // Find or create slide data entry
    let slideIndex = content.slideData.findIndex(
      (s) => s.stepNumber === stepNumber
    );
    if (slideIndex === -1) {
      content.slideData.push({ stepNumber });
      slideIndex = content.slideData.length - 1;
    }

    // Update fields
    if (notes) {
      content.slideData[slideIndex].notes = {
        ...content.slideData[slideIndex].notes,
        ...notes,
      };
    }
    if (customOverrides !== undefined) {
      content.slideData[slideIndex].customOverrides = customOverrides;
    }
    if (isHidden !== undefined) {
      content.slideData[slideIndex].isHidden = isHidden;
    }

    await content.save();
    res.json({ success: true, slideData: content.slideData[slideIndex] });
  } catch (error) {
    console.error("Error updating slide data:", error);
    res.status(500).json({ success: false, message: "Failed to update slide" });
  }
});

// POST /api/learn/:id/slide/:step/voice - Upload voice note to Cloudinary
router.post(
  "/:id/slide/:step/voice",
  authMiddleware,
  upload.single("voiceNote"),
  async (req, res) => {
    try {
      // Fetch user to check admin/team status
      const User = require("../models/User");
      const user = await User.findById(req.userId);

      // Allow access for admins (isAdmin=true OR role='admin') or team members
      const hasAccess =
        user && (user.isAdmin || user.role === "admin" || user.role === "team");
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "Admin/Team access required" });
      }

      const { id, step } = req.params;
      const stepNumber = parseInt(step);

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No audio file provided" });
      }

      const content = await LearnContent.findById(id);
      if (!content || content.type !== "animation") {
        return res
          .status(404)
          .json({ success: false, message: "Animation not found" });
      }

      // Upload to Cloudinary as audio
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video", // Cloudinary uses 'video' for audio
              folder: "medha/animation-voice-notes",
              public_id: `${content.animationId}_step_${stepNumber}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      // Find or create slide data entry
      let slideIndex = content.slideData.findIndex(
        (s) => s.stepNumber === stepNumber
      );
      if (slideIndex === -1) {
        content.slideData.push({ stepNumber });
        slideIndex = content.slideData.length - 1;
      }

      // Delete old voice note if exists
      if (content.slideData[slideIndex].voiceNotePublicId) {
        await cloudinary.uploader.destroy(
          content.slideData[slideIndex].voiceNotePublicId,
          { resource_type: "video" }
        );
      }

      content.slideData[slideIndex].voiceNoteUrl = result.secure_url;
      content.slideData[slideIndex].voiceNotePublicId = result.public_id;
      await content.save();

      res.json({ success: true, voiceNoteUrl: result.secure_url });
    } catch (error) {
      console.error("Error uploading voice note:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to upload voice note" });
    }
  }
);

// POST /api/learn/:id/slide/:step/note-image - Upload note image to Cloudinary
router.post(
  "/:id/slide/:step/note-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { isAdmin, role } = req.user || {};
      if (!isAdmin && role !== "team") {
        return res
          .status(403)
          .json({ success: false, message: "Admin/Team access required" });
      }

      const { id, step } = req.params;
      const stepNumber = parseInt(step);

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file provided" });
      }

      const content = await LearnContent.findById(id);
      if (!content || content.type !== "animation") {
        return res
          .status(404)
          .json({ success: false, message: "Animation not found" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "medha/animation-note-images",
              public_id: `${content.animationId}_step_${stepNumber}_note`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      // Find or create slide data entry
      let slideIndex = content.slideData.findIndex(
        (s) => s.stepNumber === stepNumber
      );
      if (slideIndex === -1) {
        content.slideData.push({ stepNumber });
        slideIndex = content.slideData.length - 1;
      }

      // Delete old image if exists
      if (content.slideData[slideIndex].notes?.imagePublicId) {
        await cloudinary.uploader.destroy(
          content.slideData[slideIndex].notes.imagePublicId
        );
      }

      if (!content.slideData[slideIndex].notes) {
        content.slideData[slideIndex].notes = {};
      }
      content.slideData[slideIndex].notes.imageUrl = result.secure_url;
      content.slideData[slideIndex].notes.imagePublicId = result.public_id;
      await content.save();

      res.json({ success: true, imageUrl: result.secure_url });
    } catch (error) {
      console.error("Error uploading note image:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to upload image" });
    }
  }
);

// DELETE /api/learn/:id/slide/:step/voice - Delete voice note
router.delete("/:id/slide/:step/voice", authMiddleware, async (req, res) => {
  try {
    const { isAdmin, role } = req.user || {};
    if (!isAdmin && role !== "team") {
      return res
        .status(403)
        .json({ success: false, message: "Admin/Team access required" });
    }

    const { id, step } = req.params;
    const stepNumber = parseInt(step);

    const content = await LearnContent.findById(id);
    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }

    const slideIndex = content.slideData.findIndex(
      (s) => s.stepNumber === stepNumber
    );
    if (slideIndex !== -1 && content.slideData[slideIndex].voiceNotePublicId) {
      await cloudinary.uploader.destroy(
        content.slideData[slideIndex].voiceNotePublicId,
        { resource_type: "video" }
      );
      content.slideData[slideIndex].voiceNoteUrl = null;
      content.slideData[slideIndex].voiceNotePublicId = null;
      await content.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting voice note:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete voice note" });
  }
});

// GET /api/learn/animation/:animationId/audio - Get audio URLs for an animation by animationId
// NOTE: This route MUST be defined BEFORE /:id/slides to prevent route conflict
router.get("/animation/:animationId/audio", async (req, res) => {
  try {
    const { animationId } = req.params;

    const content = await LearnContent.findOne({
      animationId: animationId,
    }).select("audioHindiUrl audioEnglishUrl");

    if (!content) {
      return res.json({
        success: false,
        message: "No audio found for this animation",
      });
    }

    res.json({
      success: true,
      audioHindiUrl: content.audioHindiUrl || null,
      audioEnglishUrl: content.audioEnglishUrl || null,
    });
  } catch (error) {
    console.error("Error fetching animation audio:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audio" });
  }
});

// GET /api/learn/animation/:animationId/slides - Get slide data by animationId
router.get("/animation/:animationId/slides", async (req, res) => {
  try {
    const { animationId } = req.params;
    const content = await LearnContent.findOne({ animationId }).select(
      "slideData animationSteps"
    );

    if (!content) {
      return res.json({
        success: true,
        slideData: [],
        totalSteps: 0,
      });
    }

    res.json({
      success: true,
      slideData: content.slideData || [],
      totalSteps: content.animationSteps || 0,
      contentId: content._id,
    });
  } catch (error) {
    console.error("Error fetching slide data by animationId:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch slide data" });
  }
});

// PATCH /api/learn/animation/:animationId/slide/:step - Update slide data by animationId (auto-creates content if needed)
router.patch(
  "/animation/:animationId/slide/:step",
  authMiddleware,
  async (req, res) => {
    try {
      // Fetch user to check admin/team status
      const User = require("../models/User");
      const user = await User.findById(req.userId);

      // Allow access for admins (isAdmin=true OR role='admin') or team members
      const hasAccess =
        user && (user.isAdmin || user.role === "admin" || user.role === "team");
      if (!hasAccess) {
        console.log("❌ Access denied - not admin/team");
        return res
          .status(403)
          .json({ success: false, message: "Admin/Team access required" });
      }

      const { animationId, step } = req.params;
      const stepNumber = parseInt(step);
      const { notes, customOverrides, isHidden, title, totalSteps } = req.body;

      // Find or create content
      let content = await LearnContent.findOne({ animationId });

      if (!content) {
        content = await LearnContent.create({
          subject: "C++",
          semester: 3,
          unit: 1,
          title: title || animationId,
          description: `Animation: ${title || animationId}`,
          type: "animation",
          animationId: animationId,
          animationSteps: parseInt(totalSteps) || 1,
          slideData: [],
          order: 0,
        });
      }

      // Find or create slide data entry
      if (!content.slideData) content.slideData = [];
      let slideIndex = content.slideData.findIndex(
        (s) => s.stepNumber === stepNumber
      );
      if (slideIndex === -1) {
        content.slideData.push({ stepNumber });
        slideIndex = content.slideData.length - 1;
      }

      // Update fields
      if (notes) {
        content.slideData[slideIndex].notes = {
          ...content.slideData[slideIndex].notes,
          ...notes,
        };
      }
      if (customOverrides !== undefined) {
        content.slideData[slideIndex].customOverrides = customOverrides;
      }
      if (isHidden !== undefined) {
        content.slideData[slideIndex].isHidden = isHidden;
      }

      await content.save();
      res.json({
        success: true,
        slideData: content.slideData[slideIndex],
        contentId: content._id,
      });
    } catch (error) {
      console.error("Error updating slide data by animationId:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update slide" });
    }
  }
);

// GET /api/learn/:id/slides - Get all slide data for an animation
router.get("/:id/slides", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await LearnContent.findById(id).select(
      "slideData animationSteps"
    );

    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }

    res.json({
      success: true,
      slideData: content.slideData,
      totalSteps: content.animationSteps,
    });
  } catch (error) {
    console.error("Error fetching slide data:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch slide data" });
  }
});

// POST /api/learn/animation/global-voice - Upload global voice for animation by animationId (auto-creates content if needed)
// NOTE: This route MUST be defined BEFORE /:id/global-voice to prevent route conflict
router.post(
  "/animation/global-voice",
  authMiddleware,
  upload.single("audioFile"),
  async (req, res) => {
    try {
      // Fetch user to check admin/team status
      const User = require("../models/User");
      const user = await User.findById(req.userId);

      if (!user || (!user.isAdmin && user.role !== "team")) {
        return res
          .status(403)
          .json({ success: false, message: "Admin/Team access required" });
      }

      const { language, animationId, title, totalSteps, subject, category } =
        req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No audio file provided" });
      }

      if (!animationId) {
        return res
          .status(400)
          .json({ success: false, message: "Animation ID is required" });
      }

      if (!["hindi", "english"].includes(language)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid language specified" });
      }

      // Find or create content for this animation
      let content = await LearnContent.findOne({ animationId: animationId });

      if (!content) {
        // Auto-create content entry for this animation
        content = await LearnContent.create({
          subject: subject || "C++",
          semester: 3,
          unit: 1,
          title: title || animationId,
          description: `Animation: ${title || animationId}`,
          type: "animation",
          animationId: animationId,
          animationSteps: parseInt(totalSteps) || 1,
          animationCategory: category || "general",
          order: 0,
        });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video",
              folder: "medha/animation-global-voice",
              public_id: `${animationId}_global_${language}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      // Delete old file if exists
      const oldFileId =
        language === "hindi"
          ? content.audioHindiFileId
          : content.audioEnglishFileId;
      if (oldFileId) {
        try {
          await cloudinary.uploader.destroy(oldFileId, {
            resource_type: "video",
          });
        } catch (e) {
          console.warn("Failed to delete old audio:", e);
        }
      }

      // Update content
      if (language === "hindi") {
        content.audioHindiUrl = result.secure_url;
        content.audioHindiFileId = result.public_id;
      } else {
        content.audioEnglishUrl = result.secure_url;
        content.audioEnglishFileId = result.public_id;
      }

      await content.save();

      res.json({
        success: true,
        audioUrl: result.secure_url,
        language,
        contentId: content._id,
      });
    } catch (error) {
      console.error("Error uploading global voice for animation:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to upload global voice" });
    }
  }
);

// POST /api/learn/:id/global-voice - Upload global voice note (Hindi/English)
router.post(
  "/:id/global-voice",
  authMiddleware,
  upload.single("audioFile"),
  async (req, res) => {
    try {
      // Fetch user to check admin/team status
      const User = require("../models/User");
      const user = await User.findById(req.userId);

      if (!user || (!user.isAdmin && user.role !== "team")) {
        return res
          .status(403)
          .json({ success: false, message: "Admin/Team access required" });
      }

      const { id } = req.params;
      const { language } = req.body; // 'hindi' or 'english'

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No audio file provided" });
      }

      if (!["hindi", "english"].includes(language)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid language specified" });
      }

      const content = await LearnContent.findById(id);
      if (!content) {
        return res
          .status(404)
          .json({ success: false, message: "Content not found" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video",
              folder: "medha/animation-global-voice",
              public_id: `${content.animationId}_global_${language}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      // Delete old file if exists
      const oldFileId =
        language === "hindi"
          ? content.audioHindiFileId
          : content.audioEnglishFileId;
      if (oldFileId) {
        try {
          await cloudinary.uploader.destroy(oldFileId, {
            resource_type: "video",
          });
        } catch (e) {
          console.warn("Failed to delete old audio:", e);
        }
      }

      // Update content
      if (language === "hindi") {
        content.audioHindiUrl = result.secure_url;
        content.audioHindiFileId = result.public_id;
      } else {
        content.audioEnglishUrl = result.secure_url;
        content.audioEnglishFileId = result.public_id;
      }

      await content.save();

      res.json({
        success: true,
        audioUrl: result.secure_url,
        language,
      });
    } catch (error) {
      console.error("Error uploading global voice:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to upload global voice" });
    }
  }
);

module.exports = router;
