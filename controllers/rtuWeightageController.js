/**
 * RTU Weightage Controller
 * Provides unit-wise marks weightage data for RTU exam papers
 */

// ============================================================================
// DATA: Unit weightage data for Advanced Engineering Mathematics
// ============================================================================

const SUBJECT_DATA = {
  "Advanced Engineering Mathematics": {
    totalPaperMarks: 98,
    years: {
      2025: {
        units: [
          {
            unitSerial: 1,
            unitName: "Random Variables",
            totalMarks: 12,
            youtubePlaylistUrl: "https://youtube.com/playlist?list=PLU6SqdYcYsfIaokdZTmptaf-PK7s-B0ju",
          },
          {
            unitSerial: 2,
            unitName: "Binomial, Normal, Other Distributions & Correlation",
            totalMarks: 34,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLU6SqdYcYsfJPF-4HphQQ8OceDtqhlSW8",
          },
          {
            unitSerial: 3,
            unitName: "Historical Development & Classification of Optimization Problems",
            totalMarks: 12,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLkcUpbkZXroUHn0nv8zv2CwYBWbDNZOTz",
          },
          {
            unitSerial: 4,
            unitName: "Classical Optimization, Lagrange & Kuhn–Tucker",
            totalMarks: 18,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLDQ4Vk5YdytEBWSLplYlhkpL9YcXOke2y",
          },
          {
            unitSerial: 5,
            unitName: "Linear Programming, Duality & Transportation",
            totalMarks: 22,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLU6SqdYcYsfLewoQPYjgg7SMBLjSV704v",
          },
        ],
      },
      2024: {
        units: [
          {
            unitSerial: 1,
            unitName: "Random Variables",
            totalMarks: 18,
            youtubePlaylistUrl: "https://youtube.com/playlist?list=PLU6SqdYcYsfIaokdZTmptaf-PK7s-B0ju",
            questions: [
              { qCode: "Q3 (Part A)", marks: 2, text: "What is mean, variance and standard deviation of <b>Uniform Distribution</b> and <b>Exponential Distribution</b>." },
              { qCode: "Q9 (Part A)", marks: 2, text: "What is difference between <b>skewness</b> and <b>kurtosis</b>." },
              { qCode: "Q2 (Part B)", marks: 4, text: "The joint probability mass function of (X,Y) is given by:<br/> P<sub>XY</sub>(x<sub>i</sub>, y<sub>j</sub>) = k for i=1,2; j=1,2,3,<br/> 0 otherwise.<br/><br/> i) Find <b>k</b>.<br/> ii) Find the marginal probability mass function of <b>X</b> and <b>Y</b>." },
              { qCode: "Q2 (Part C)", marks: 10, text: `
                A random variable x has the following probability distribution:<br/>
                <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size:13px; border:1px solid #444;">
                  <tr style="background:rgba(255,255,255,0.05);">
                    <td style="border:1px solid #444; padding:6px; font-weight:bold;">x</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">0</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">1</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">2</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">3</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">4</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">5</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">6</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">7</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:6px; font-weight:bold;">P(x)</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">0</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">k</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">2k</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">2k</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">3k</td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">k<sup>2</sup></td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">2k<sup>2</sup></td>
                    <td style="border:1px solid #444; padding:6px; text-align:center;">7k<sup>2</sup>+k</td>
                  </tr>
                </table>
                <br/>
                i) Find <b>k</b>.<br/>
                ii) Evaluate P(x < 6), P(x ≥ 6) and P(0 < x < 5).<br/>
                iii) Find the distribution function of x.<br/>
                iv) Find P(1.5 < x < 4.5), P(x > 2).
              ` }
            ]
          },
          {
            unitSerial: 2,
            unitName: "Binomial, Normal, Other Distributions & Correlation",
            totalMarks: 22,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLU6SqdYcYsfJPF-4HphQQ8OceDtqhlSW8",
            questions: [
              { qCode: "Q1 (Part B)", marks: 4, text: "Define <b>Poisson Distribution</b>. Derive it as a limiting case of Binomial distribution. Find the mean and variance also." },
              { qCode: "Q4 (Part A)", marks: 2, text: `
                Fit a straight line of following set of observation:<br/>
                <table style="width:100%; max-width:300px; border-collapse: collapse; margin-top:10px; font-size:13px; border:1px solid #444;">
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">X</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">1</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">2</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">3</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">4</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">5</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">Y</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">2</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">4</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">6</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">10</td>
                  </tr>
                </table>
              ` },
              { qCode: "Q5 (Part A)", marks: 2, text: "What is <b>spearman rank correlation</b>?" },
              { qCode: "Q7 (Part B)", marks: 4, text: `
                Calculate the coefficient of correlation and obtain lines of regression for the following data:<br/>
                <div style="overflow-x: auto;">
                  <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size:13px; border:1px solid #444;">
                    <tr>
                      <td style="border:1px solid #444; padding:4px; font-weight:bold;">X</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">1</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">2</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">3</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">4</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">5</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">6</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">7</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">9</td>
                    </tr>
                    <tr>
                      <td style="border:1px solid #444; padding:4px; font-weight:bold;">Y</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">9</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">10</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">12</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">11</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">13</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">14</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">16</td>
                      <td style="border:1px solid #444; padding:4px; text-align:center;">15</td>
                    </tr>
                  </table>
                </div>
              ` },
              { qCode: "Q1 (Part C)", marks: 10, text: "If <b>θ</b> be the acute angle between the two lines of regression of variables x and y, show that:<br/> <b>tan θ = [ ( 1 - r<sup>2</sup> ) / |r| ] · ( σ<sub>x</sub> σ<sub>y</sub> / ( σ<sub>x</sub><sup>2</sup> + σ<sub>y</sub><sup>2</sup> ) )</b><br/> Explain the significance where r=0 and r=+1." }
            ]
          },
          {
            unitSerial: 3,
            unitName: "Historical Development & Classification",
            totalMarks: 14,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLkcUpbkZXroUHn0nv8zv2CwYBWbDNZOTz",
            questions: [
              { qCode: "Q3 (Part B)", marks: 4, text: "Old hens can be bought at Rs 2.00 with young ones at Rs 5.00 each. An old hen lays 3 eggs, a young one 5 eggs a week. Each egg is sold for 30p. If the expenses incurred on their feeding be Rs 1.00 per hen per week, find how many hens of each kind a person having Rs 80 for investment can purchase to earn maximum profit, if he has accommodation only for 20 hens in his house." },
              { qCode: "Q4 (Part C)", marks: 10, text: "What are the engineering applications of optimization? Also give various classifications of optimization problems." }
            ]
          },
          {
            unitSerial: 4,
            unitName: "Classical Optimization, Lagrange & Kuhn–Tucker",
            totalMarks: 16,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLDQ4Vk5YdytEBWSLplYlhkpL9YcXOke2y",
            questions: [
              { qCode: "Q7 (Part A)", marks: 2, text: "Find the maxima and minima of <br/> <b>x<sup>4</sup> + 9x<sup>2</sup> + 18x + 144</b>." },
              { qCode: "Q4 (Part B)", marks: 4, text: "Optimize <b>Z = x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup></b> <br/> Subject to: <b>4x + y<sup>2</sup> + 2z = 14</b>." },
              { qCode: "Q3 (Part C)", marks: 10, text: `
                Solve the following problem:<br/>
                Minimize <b>f(x) = x<sub>1</sub><sup>2</sup> + x<sub>2</sub><sup>2</sup></b><br/>
                Subject to:<br/>
                g<sub>1</sub>(x) = 2x<sub>1</sub> + x<sub>2</sub> - 5 ≤ 0<br/>
                g<sub>2</sub>(x) = x<sub>2</sub> + x<sub>1</sub> - 2.5 ≤ 0<br/>
                g<sub>3</sub>(x) = 1 - x<sub>1</sub> ≤ 0<br/>
                g<sub>4</sub>(x) = 2 - x<sub>2</sub> ≤ 0<br/>
                g<sub>5</sub>(x) = -x<sub>1</sub> ≤ 0
              ` }
            ]
          },
          {
            unitSerial: 5,
            unitName: "Linear Programming, Duality & Transportation",
            totalMarks: 28,
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLU6SqdYcYsfLewoQPYjgg7SMBLjSV704v",
            questions: [
              { qCode: "Q1 (Part A)", marks: 2, text: "What is the difference between linear and nonlinear programming problem." },
              { qCode: "Q2 (Part A)", marks: 2, text: "What is optimization technique? Give example." },
              { qCode: "Q6 (Part A)", marks: 2, text: "Write the dual of:<br/> Max <b>Z = x<sub>1</sub> + 3x<sub>2</sub></b><br/> s.t.<br/> 3x<sub>1</sub> + 2x<sub>2</sub> ≤ 6<br/> 3x<sub>1</sub> + x<sub>2</sub> = 4<br/> x<sub>2</sub> ≥ 0." },
              { qCode: "Q8 (Part A)", marks: 2, text: "Find all the basic solution of the system:<br/> 2x + y - z = 2<br/> 3x + 2y + z = 3." },
              { qCode: "Q5 (Part B)", marks: 4, text: "Use simplex method to solve the LP problem:<br/> Maximize <b>Z = 4x<sub>1</sub> + 3x<sub>2</sub></b><br/> Subject to:<br/> 2x<sub>1</sub> + x<sub>2</sub> ≤ 10<br/> 3x<sub>1</sub> + 2x<sub>2</sub> ≤ 16<br/> x<sub>1</sub>, x<sub>2</sub> ≥ 0." },
              { qCode: "Q6 (Part B)", marks: 4, text: `
                Obtain the optimal transportation plan from the following table:<br/>
                <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size:13px; border:1px solid #444;">
                  <tr style="background:rgba(255,255,255,0.05);">
                    <td style="border:1px solid #444; padding:4px;"></td>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">M1</td>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">M2</td>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">M3</td>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">M4</td>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold; color:var(--action-primary);">Supply</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">P1</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">4</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">6</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">13</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">50</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">P2</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">13</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">11</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">10</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">70</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">P3</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">14</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">4</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">10</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">13</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">30</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">P4</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">9</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">11</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">13</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">50</td>
                  </tr>
                  <tr style="border-top:2px solid #555;">
                    <td style="border:1px solid #444; padding:4px; font-weight:bold; color:var(--action-primary);">Demand</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">25</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">35</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">105</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">20</td>
                    <td style="border:1px solid #444; padding:4px;"></td>
                  </tr>
                </table>
              ` },
              { qCode: "Q10 (Part A)", marks: 2, text: `
                Find the optimal assignment for the problem with minimum cost:<br/>
                <table style="width:100%; max-width:250px; border-collapse: collapse; margin-top:10px; font-size:13px; border:1px solid #444;">
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;"></td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">I</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">II</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">III</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">IV</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">A</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">5</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">3</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">1</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">8</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">B</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">7</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">9</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">2</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">6</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">C</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">6</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">4</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">5</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">7</td>
                  </tr>
                  <tr>
                    <td style="border:1px solid #444; padding:4px; font-weight:bold;">D</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">5</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">7</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">7</td>
                    <td style="border:1px solid #444; padding:4px; text-align:center;">6</td>
                  </tr>
                </table>
              ` },
              { qCode: "Q5 (Part C)", marks: 10, text: "Use Two phase simplex method to solve the following LPP:<br/> Max <b>Z = 5x<sub>1</sub> + 8x<sub>2</sub></b><br/> s.t.<br/> 3x<sub>1</sub> + 2x<sub>2</sub> ≥ 3<br/> x<sub>1</sub> + 4x<sub>2</sub> ≥ 4<br/> x<sub>1</sub> + x<sub>2</sub> ≤ 5<br/> x<sub>1</sub>, x<sub>2</sub> ≥ 0." }
            ]
          },
        ],
      },
    },
  },
};

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

    const subjectData = SUBJECT_DATA[decodedSubjectName];

    if (!subjectData) {
      return res.status(404).json({
        success: false,
        message: `Subject "${decodedSubjectName}" not found`,
      });
    }

    // Get years that have data (non-empty units array)
    const availableYears = Object.keys(subjectData.years)
      .filter((year) => subjectData.years[year].units.length > 0)
      .map((year) => parseInt(year, 10))
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

    const subjectData = SUBJECT_DATA[decodedSubjectName];

    if (!subjectData) {
      return res.status(404).json({
        success: false,
        message: `Subject "${decodedSubjectName}" not found`,
      });
    }

    const yearData = subjectData.years[yearInt];

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
