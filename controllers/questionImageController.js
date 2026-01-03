/**
 * Question Image Controller
 * Handles image upload/delete for exam analysis questions
 * Admin only endpoints
 */

const ExamAnalysis = require("../models/ExamAnalysis");
const imagekit = require("../config/imagekit");

/**
 * Get ImageKit authentication parameters for frontend upload
 * GET /api/rtu/imagekit-auth
 */
exports.getImageKitAuth = async (req, res) => {
  try {
    // Check if ImageKit is configured
    if (!imagekit.isConfigured()) {
      console.error("ImageKit not configured - missing IMAGEKIT_PUBLIC_KEY or IMAGEKIT_PRIVATE_KEY");
      return res.status(500).json({ 
        success: false, 
        message: "ImageKit is not configured on the server. Please add IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY to .env" 
      });
    }
    
    const crypto = require('crypto');
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes
    const authenticationParameters = imagekit.getAuthenticationParameters(token, expire);
    res.json(authenticationParameters);
  } catch (error) {
    console.error("Error generating ImageKit auth:", error);
    res.status(500).json({ success: false, message: "Failed to generate authentication" });
  }
};

/**
 * Upload/replace question image
 * POST /api/rtu/subjects/:subjectName/years/:year/units/:unitSerial/questions/:qCode/image
 * Body: { imageUrl, imageFileId }
 */
exports.uploadQuestionImage = async (req, res) => {
  try {
    const { subjectName, year, unitSerial, qCode } = req.params;
    const { imageUrl, imageFileId } = req.body;
    
    const decodedSubjectName = decodeURIComponent(subjectName);
    const decodedQCode = decodeURIComponent(qCode);
    const yearInt = parseInt(year, 10);
    const unitSerialInt = parseInt(unitSerial, 10);

    if (!imageUrl || !imageFileId) {
      return res.status(400).json({ 
        success: false, 
        message: "imageUrl and imageFileId are required" 
      });
    }

    // Find the subject
    const subject = await ExamAnalysis.findOne({ subjectName: decodedSubjectName });
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: `Subject "${decodedSubjectName}" not found` 
      });
    }

    // Find the year
    const yearData = subject.years.find(y => y.year === yearInt);
    if (!yearData) {
      return res.status(404).json({ 
        success: false, 
        message: `Year ${yearInt} not found` 
      });
    }

    // Find the unit
    const unit = yearData.units.find(u => u.unitSerial === unitSerialInt);
    if (!unit) {
      return res.status(404).json({ 
        success: false, 
        message: `Unit ${unitSerialInt} not found` 
      });
    }

    // Find the question
    const question = unit.questions.find(q => q.qCode === decodedQCode);
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: `Question "${decodedQCode}" not found` 
      });
    }

    // Delete old image if exists
    if (question.imageFileId) {
      try {
        await imagekit.deleteFile(question.imageFileId);
      } catch (deleteError) {
        console.warn("Could not delete old image:", deleteError.message);
      }
    }

    // Update question with new image
    question.imageUrl = imageUrl;
    question.imageFileId = imageFileId;
    await subject.save();

    res.json({
      success: true,
      message: "Question image uploaded successfully",
      question: {
        qCode: question.qCode,
        imageUrl: question.imageUrl
      }
    });
  } catch (error) {
    console.error("Error uploading question image:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload question image" 
    });
  }
};

/**
 * Delete question image
 * DELETE /api/rtu/subjects/:subjectName/years/:year/units/:unitSerial/questions/:qCode/image
 */
exports.deleteQuestionImage = async (req, res) => {
  try {
    const { subjectName, year, unitSerial, qCode } = req.params;
    
    const decodedSubjectName = decodeURIComponent(subjectName);
    const decodedQCode = decodeURIComponent(qCode);
    const yearInt = parseInt(year, 10);
    const unitSerialInt = parseInt(unitSerial, 10);

    // Find the subject
    const subject = await ExamAnalysis.findOne({ subjectName: decodedSubjectName });
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: `Subject "${decodedSubjectName}" not found` 
      });
    }

    // Find the year
    const yearData = subject.years.find(y => y.year === yearInt);
    if (!yearData) {
      return res.status(404).json({ 
        success: false, 
        message: `Year ${yearInt} not found` 
      });
    }

    // Find the unit
    const unit = yearData.units.find(u => u.unitSerial === unitSerialInt);
    if (!unit) {
      return res.status(404).json({ 
        success: false, 
        message: `Unit ${unitSerialInt} not found` 
      });
    }

    // Find the question
    const question = unit.questions.find(q => q.qCode === decodedQCode);
    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: `Question "${decodedQCode}" not found` 
      });
    }

    // Delete from ImageKit if fileId exists
    if (question.imageFileId) {
      try {
        await imagekit.deleteFile(question.imageFileId);
      } catch (deleteError) {
        console.warn("Could not delete image from ImageKit:", deleteError.message);
      }
    }

    // Clear image fields
    question.imageUrl = null;
    question.imageFileId = null;
    await subject.save();

    res.json({
      success: true,
      message: "Question image deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting question image:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete question image" 
    });
  }
};
