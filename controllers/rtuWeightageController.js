/**
 * RTU Weightage Controller
 * Provides unit-wise marks weightage data for RTU exam papers
 * Refactored to fetch data from MongoDB 'ExamAnalysis' collection
 */

const ExamAnalysis = require("../models/ExamAnalysis");

// ============================================================================
// UTILITY: Transform unit data with computed weightage values
// ============================================================================

/**
 * Transforms raw unit data into format with computed weightage values
 * @param {Array} units - Array of unit objects with unitSerial, unitName, totalMarks
 * @param {number} totalPaperMarks - Total marks for the paper (e.g., 98)
 * @returns {Array} Sorted array of units with weightageRatio and weightagePercentage
 */
const transformUnitData = (units, totalPaperMarks) => {
  return units
    .map((unit) => ({
      unitSerial: unit.unitSerial,
      unitName: unit.unitName,
      totalMarks: unit.totalMarks,
      youtubePlaylistUrl: unit.youtubePlaylistUrl || null,
      questions: unit.questions || [],
      weightageRatio: unit.totalMarks / totalPaperMarks,
      weightagePercentage: (unit.totalMarks / totalPaperMarks) * 100,
    }))
    .sort((a, b) => b.totalMarks - a.totalMarks); // Sort descending by totalMarks
};

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/rtu/subjects/:subjectName/years
 * Returns available years for a subject
 */
exports.getAvailableYears = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const decodedSubjectName = decodeURIComponent(subjectName);

    const subjectData = await ExamAnalysis.findOne({ subjectName: decodedSubjectName });

    if (!subjectData) {
      return res.status(404).json({
        success: false,
        message: `Subject "${decodedSubjectName}" not found`,
      });
    }

    // Get years that have data (non-empty units array)
    const availableYears = subjectData.years
      .filter((yearData) => yearData.units.length > 0)
      .map((yearData) => yearData.year)
      .sort((a, b) => b - a); // Sort descending (newest first)

    res.json({
      success: true,
      subject: decodedSubjectName,
      years: availableYears,
      totalPaperMarks: subjectData.totalPaperMarks,
    });
  } catch (error) {
    console.error("Error in getAvailableYears:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching available years",
    });
  }
};

/**
 * GET /api/rtu/subjects/:subjectName/years/:year/weightage
 * Returns unit weightage data for a specific year
 */
exports.getUnitWeightage = async (req, res) => {
  try {
    const { subjectName, year } = req.params;
    const decodedSubjectName = decodeURIComponent(subjectName);
    const yearInt = parseInt(year, 10);

    const subjectData = await ExamAnalysis.findOne({ subjectName: decodedSubjectName });

    if (!subjectData) {
      return res.status(404).json({
        success: false,
        message: `Subject "${decodedSubjectName}" not found`,
      });
    }

    const yearData = subjectData.years.find((y) => y.year === yearInt);

    if (!yearData || yearData.units.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No data available for year ${yearInt}`,
      });
    }

    const transformedUnits = transformUnitData(
      yearData.units,
      subjectData.totalPaperMarks
    );

    res.json({
      success: true,
      subject: decodedSubjectName,
      year: yearInt,
      totalPaperMarks: subjectData.totalPaperMarks,
      units: transformedUnits,
      chatgptLink: yearData.chatgptLink || null,
      claudeLink: yearData.claudeLink || null,
    });
  } catch (error) {
    console.error("Error in getUnitWeightage:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching unit weightage data",
    });
  }
};

/**
 * PUT /api/rtu/subjects/:subjectName/years/:year/ai-links
 * Update ChatGPT and Claude links for a specific year (Admin only)
 */
exports.updateAILinks = async (req, res) => {
  try {
    const { subjectName, year } = req.params;
    const { chatgptLink, claudeLink } = req.body;
    const decodedSubjectName = decodeURIComponent(subjectName);
    const yearInt = parseInt(year, 10);

    // Simple URL validation
    const isValidUrl = (url) => {
      if (!url) return true; // null/empty is valid
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(chatgptLink)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid ChatGPT URL" 
      });
    }
    if (!isValidUrl(claudeLink)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid Claude URL" 
      });
    }

    const analysis = await ExamAnalysis.findOne({ subjectName: decodedSubjectName });
    if (!analysis) {
      return res.status(404).json({ 
        success: false,
        error: "Subject not found" 
      });
    }

    const yearData = analysis.years.find(y => y.year === yearInt);
    if (!yearData) {
      return res.status(404).json({ 
        success: false,
        error: "Year not found" 
      });
    }

    yearData.chatgptLink = chatgptLink || null;
    yearData.claudeLink = claudeLink || null;

    console.log("Saving to database:", {
      chatgptLink: yearData.chatgptLink,
      claudeLink: yearData.claudeLink
    });

    await analysis.save();

    console.log("After save:", {
      chatgptLink: yearData.chatgptLink,
      claudeLink: yearData.claudeLink
    });

    res.json({
      success: true,
      chatgptLink: yearData.chatgptLink,
      claudeLink: yearData.claudeLink,
    });
  } catch (error) {
    console.error("Error updating AI links:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update AI links" 
    });
  }
};

/**
 * PUT /api/rtu/subjects/:subjectName/years/:year/questions/:qCode/ai-links
 * Update ChatGPT and Claude links for a specific question (Admin only)
 */
exports.updateQuestionAILinks = async (req, res) => {
  try {
    const { subjectName, year, qCode } = req.params;
    const { chatgptLink, claudeLink } = req.body;
    const decodedSubjectName = decodeURIComponent(subjectName);
    const yearInt = parseInt(year, 10);

    // Simple URL validation
    const isValidUrl = (url) => {
      if (!url) return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(chatgptLink)) {
      return res.status(400).json({ success: false, error: "Invalid ChatGPT URL" });
    }
    if (!isValidUrl(claudeLink)) {
      return res.status(400).json({ success: false, error: "Invalid Claude URL" });
    }

    const analysis = await ExamAnalysis.findOne({ subjectName: decodedSubjectName });
    if (!analysis) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }

    const yearData = analysis.years.find(y => y.year === yearInt);
    if (!yearData) {
      return res.status(404).json({ success: false, error: "Year not found" });
    }

    let questionFound = false;
    for (const unit of yearData.units) {
      const question = unit.questions.find(q => q.qCode === qCode);
      if (question) {
        question.chatgptLink = chatgptLink || null;
        question.claudeLink = claudeLink || null;
        questionFound = true;
        break;
      }
    }

    if (!questionFound) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    await analysis.save();
    res.json({ success: true, qCode, chatgptLink, claudeLink });
  } catch (error) {
    console.error("Error updating question AI links:", error);
    res.status(500).json({ success: false, error: "Failed to update AI links" });
  }
};
