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
    });
  } catch (error) {
    console.error("Error in getUnitWeightage:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching unit weightage data",
    });
  }
};
