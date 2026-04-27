/**
 * RTU Weightage Controller
 * Provides unit-wise marks weightage data for RTU exam papers
 * Refactored to fetch data from MongoDB 'ExamAnalysis' collection
 */

const ExamAnalysis = require("../models/ExamAnalysis");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory cache for AI topic categorization: key = "subject|year1,year2" → topics result
const topicCache = new Map();

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

// ============================================================================
// MULTI-YEAR ANALYSIS — HELPERS
// ============================================================================

/**
 * Normalize question text for fuzzy matching.
 * Strips formatting, lowercases, removes extra whitespace, and takes first 60 chars.
 */
function normalizeQuestion(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/[^a-z0-9\s]/g, " ")     // remove special chars
    .replace(/\s+/g, " ")             // collapse whitespace
    .trim()
    .substring(0, 60);
}

/**
 * Use Groq AI to categorize questions into topics.
 * Sends all questions grouped by unit to the LLM and gets back topic assignments.
 * Results are cached in-memory.
 */
async function buildTopTopicsWithAI(matchedYears, subjectName) {
  const cacheKey = `${subjectName}|${matchedYears.map(y => y.year).sort().join(",")}`;
  if (topicCache.has(cacheKey)) {
    return topicCache.get(cacheKey);
  }

  // Collect all questions with metadata
  const allQuestions = [];
  matchedYears.forEach((yd) => {
    yd.units.forEach((unit) => {
      unit.questions.forEach((q) => {
        allQuestions.push({
          id: `${yd.year}-${unit.unitSerial}-${q.qCode}`,
          text: q.text,
          marks: q.marks,
          year: yd.year,
          qCode: q.qCode,
          unitSerial: unit.unitSerial,
          unitName: unit.unitName,
        });
      });
    });
  });

  try {
    const prompt = `You are an expert exam analysis AI. Given a list of exam questions from "${subjectName}", categorize each question into a specific academic topic.

RULES:
1. Each topic should be a concise, specific academic concept (e.g., "Dijkstra's Shortest Path Algorithm", "Equivalence Relations", "Cyclic Groups")
2. Questions from different units MUST NOT share the same topic — keep topics unit-specific
3. Group similar/identical questions under the same topic name
4. Return ONLY valid JSON, no markdown

INPUT QUESTIONS:
${allQuestions.map(q => `[${q.id}] (Unit ${q.unitSerial}: ${q.unitName}, ${q.marks}m) ${q.text}`).join("\n")}

OUTPUT FORMAT — return a JSON object with a "topics" array:
{"topics": [{ "id": "2024-2-A1", "topic": "Set Operations & Venn Diagrams" }, ...]}

Return the topic assignment for EVERY question. Be specific but consistent — identical concepts across years should get the exact same topic name.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Groq response:", responseText.substring(0, 200));
      topicCache.set(cacheKey, []);
      return [];
    }

    // Handle various response shapes
    const assignments = Array.isArray(parsed) ? parsed : (parsed.topics || parsed.questions || parsed.data || []);

    // Build lookup: id → topic
    const topicLookup = {};
    assignments.forEach((a) => {
      if (a.id && a.topic) topicLookup[a.id] = a.topic;
    });

    // Aggregate into topic groups
    const topicMap = {};
    allQuestions.forEach((q) => {
      const topic = topicLookup[q.id];
      if (!topic) return;

      const key = `${topic}__${q.unitSerial}`;
      if (!topicMap[key]) {
        topicMap[key] = {
          topic,
          unitSerial: q.unitSerial,
          unitName: q.unitName,
          count: 0,
          years: new Set(),
          totalMarks: 0,
          questions: [],
        };
      }
      topicMap[key].count += 1;
      topicMap[key].years.add(q.year);
      topicMap[key].totalMarks += q.marks;
      topicMap[key].questions.push({
        text: q.text,
        marks: q.marks,
        year: q.year,
        qCode: q.qCode,
      });
    });

    const result = Object.values(topicMap)
      .map((t) => ({
        ...t,
        years: [...t.years].sort(),
        yearCount: t.years.size || [...t.years].length,
        questions: t.questions.sort((a, b) => b.year - a.year),
      }))
      .sort((a, b) => b.count - a.count || b.totalMarks - a.totalMarks);

    topicCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Groq topic categorization failed:", error.message);
    topicCache.set(cacheKey, []);
    return [];
  }
}


/**
 * Build repeated questions list from multi-year data.
 * Groups questions by normalized text similarity, returns those appearing 2+ years.
 */
function buildRepeatedQuestions(matchedYears) {
  // Map: normalized text → { text, years, unit, unitName, marks[] }
  const questionMap = {};

  matchedYears.forEach((yd) => {
    yd.units.forEach((unit) => {
      unit.questions.forEach((q) => {
        const key = normalizeQuestion(q.text);
        if (!questionMap[key]) {
          questionMap[key] = {
            text: q.text,
            years: [],
            unitSerial: unit.unitSerial,
            unitName: unit.unitName,
            marks: [],
          };
        }
        // Don't duplicate the same year
        if (!questionMap[key].years.includes(yd.year)) {
          questionMap[key].years.push(yd.year);
          questionMap[key].marks.push(q.marks);
        }
        // Keep the longest/most complete version of the question text
        if (q.text.length > questionMap[key].text.length) {
          questionMap[key].text = q.text;
        }
      });
    });
  });

  // Filter to questions appearing in 2+ years, sort by frequency desc
  return Object.values(questionMap)
    .filter((q) => q.years.length >= 2)
    .map((q) => ({
      ...q,
      count: q.years.length,
      years: q.years.sort(),
      avgMarks: Math.round((q.marks.reduce((s, m) => s + m, 0) / q.marks.length) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count || b.avgMarks - a.avgMarks);
}



// ============================================================================
// MULTI-YEAR ANALYSIS — API HANDLER
// ============================================================================

/**
 * GET /api/rtu/subjects/:subjectName/multi-year-weightage?years=2022,2023,2024
 * Returns aggregated unit weightage, repeated questions, and top topics
 * across multiple selected years
 */
exports.getMultiYearWeightage = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const decodedSubjectName = decodeURIComponent(subjectName);
    const yearsParam = req.query.years;

    if (!yearsParam) {
      return res.status(400).json({ success: false, message: "Missing 'years' query param" });
    }

    const requestedYears = yearsParam.split(",").map((y) => parseInt(y.trim(), 10)).filter(Boolean);

    const subjectData = await ExamAnalysis.findOne({ subjectName: decodedSubjectName }).lean();
    if (!subjectData) {
      return res.status(404).json({ success: false, message: `Subject "${decodedSubjectName}" not found` });
    }

    // Filter to only requested years that exist
    const matchedYears = subjectData.years.filter((y) => requestedYears.includes(y.year));

    if (matchedYears.length === 0) {
      return res.status(404).json({ success: false, message: "No data for the requested years" });
    }

    // Build per-year unit data
    const perYearData = matchedYears.map((yd) => ({
      year: yd.year,
      units: transformUnitData(yd.units, subjectData.totalPaperMarks),
    }));

    // Aggregate across years: merge unit marks
    const unitAggMap = {};
    matchedYears.forEach((yd) => {
      yd.units.forEach((unit) => {
        const key = unit.unitSerial;
        if (!unitAggMap[key]) {
          unitAggMap[key] = {
            unitSerial: unit.unitSerial,
            unitName: unit.unitName,
            totalAcrossYears: 0,
            yearCount: 0,
            perYear: {},
          };
        }
        unitAggMap[key].totalAcrossYears += unit.totalMarks;
        unitAggMap[key].yearCount += 1;
        unitAggMap[key].perYear[yd.year] = unit.totalMarks;
      });
    });

    const aggregatedUnits = Object.values(unitAggMap)
      .map((u) => ({
        ...u,
        averageMarks: Math.round((u.totalAcrossYears / u.yearCount) * 10) / 10,
      }))
      .sort((a, b) => b.averageMarks - a.averageMarks);

    // ── NEW: Repeated questions & top topics ──
    const repeatedQuestions = buildRepeatedQuestions(matchedYears);
    const topTopics = await buildTopTopicsWithAI(matchedYears, decodedSubjectName);

    res.json({
      success: true,
      subject: decodedSubjectName,
      years: matchedYears.map((y) => y.year).sort(),
      totalPaperMarks: subjectData.totalPaperMarks,
      aggregatedUnits,
      perYearData,
      repeatedQuestions,
      topTopics,
    });
  } catch (error) {
    console.error("Error in getMultiYearWeightage:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// AI TOPIC PREDICTION (Gemini Flash) — Rate Limited + Cached
// ============================================================================

// In-memory rate limiter: userId -> [timestamps]
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 3;       // max requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// In-memory prediction cache: subjectName -> { result, timestamp }
const predictionCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isRateLimited(userId) {
  const now = Date.now();
  const history = rateLimitMap.get(userId) || [];
  const recent = history.filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(userId, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return false;
}

/**
 * POST /api/rtu/subjects/:subjectName/ai-predict-topics
 * Body: { years: [2022, 2023, 2024, 2025] }
 * Uses Gemini Flash to predict most important topics from PYQ data.
 */
exports.predictImportantTopics = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const decodedSubjectName = decodeURIComponent(subjectName);
    const { years } = req.body;
    const userId = req.user?._id?.toString() || req.user?.id || "anon";

    if (!years || !Array.isArray(years) || years.length === 0) {
      return res.status(400).json({ success: false, message: "Provide a 'years' array in body" });
    }

    // ── Check cache first ──
    const cacheKey = `${decodedSubjectName}__${years.sort().join(",")}`;
    const cached = predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ AI prediction cache hit: ${cacheKey}`);
      return res.json({ success: true, cached: true, ...cached.result });
    }

    // ── Rate limit check ──
    if (isRateLimited(userId)) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Maximum 3 AI predictions per hour. Try again later.",
      });
    }

    // ── Fetch data from DB ──
    const subjectData = await ExamAnalysis.findOne({ subjectName: decodedSubjectName }).lean();
    if (!subjectData) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const matchedYears = subjectData.years.filter((y) => years.includes(y.year));
    if (matchedYears.length === 0) {
      return res.status(404).json({ success: false, message: "No data for the requested years" });
    }

    // ── Build compact prompt ──
    let prompt = `You are an expert exam analyst for RTU (Rajasthan Technical University). Analyze PYQ (Previous Year Question) data for "${decodedSubjectName}" across ${matchedYears.length} year(s) and predict the most important topics.\n\n`;

    // Unit marks summary per year (very compact)
    prompt += "## Unit-wise marks by year:\n";
    const unitMap = {};
    matchedYears.forEach((yd) => {
      yd.units.forEach((u) => {
        if (!unitMap[u.unitSerial]) unitMap[u.unitSerial] = { name: u.unitName, marks: {} };
        unitMap[u.unitSerial].marks[yd.year] = u.totalMarks;
      });
    });
    Object.entries(unitMap).forEach(([serial, data]) => {
      const marksStr = Object.entries(data.marks).map(([y, m]) => `${y}=${m}`).join(", ");
      prompt += `U${serial} ${data.name}: ${marksStr}\n`;
    });

    // Top repeated question topics (compact)
    prompt += "\n## Frequently asked question topics:\n";
    const topicFreq = {};
    matchedYears.forEach((yd) => {
      yd.units.forEach((u) => {
        u.questions.forEach((q) => {
          // Extract first 60 chars as topic fingerprint
          const key = q.text.substring(0, 60).toLowerCase().trim();
          topicFreq[key] = (topicFreq[key] || 0) + 1;
        });
      });
    });
    // Show top 15 repeated topics
    const sortedTopics = Object.entries(topicFreq).sort((a, b) => b[1] - a[1]).slice(0, 15);
    sortedTopics.forEach(([topic, count]) => {
      prompt += `- "${topic}..." (${count}x)\n`;
    });

    prompt += `\n## Task:\nReturn a JSON object with "predictions" array of exactly 8 entries. Each entry must have:\n- "topic": specific topic name\n- "unit": unit number (integer)\n- "unitName": unit name\n- "confidence": percentage 0-100\n- "priority": "high" | "medium" | "low"\n- "reason": one-line explanation\n\nSort by confidence descending. Respond with ONLY the JSON, no markdown fences.\n`;

    // ── Call Groq (llama-3.3-70b) ──
    const axios = require("axios");
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: "AI service not configured" });
    }

    console.log(`🤖 AI prediction request for "${decodedSubjectName}" (${matchedYears.length} years, prompt ~${prompt.length} chars)`);

    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const responseText = groqResponse.data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI returned non-JSON:", responseText.substring(0, 200));
      return res.status(500).json({ success: false, message: "AI returned invalid format" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const predictions = parsed.predictions || [];

    const responsePayload = {
      subject: decodedSubjectName,
      yearsAnalyzed: matchedYears.map((y) => y.year).sort(),
      predictions,
      generatedAt: new Date().toISOString(),
    };

    // ── Cache the result ──
    predictionCache.set(cacheKey, { result: responsePayload, timestamp: Date.now() });

    res.json({ success: true, cached: false, ...responsePayload });
  } catch (error) {
    console.error("Error in predictImportantTopics:", error);
    res.status(500).json({ success: false, message: "AI prediction failed" });
  }
};
