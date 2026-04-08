const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const ApprovedChannel = require("../models/ApprovedChannel");
const SearchHistory = require("../models/SearchHistory");
const Syllabus = require("../models/Syllabus");
const UniversitySyllabus = require("../models/UniversitySyllabus");
const User = require("../models/User");
const upload = require("../middleware/upload");
const Groq = require("groq-sdk");
const axios = require("axios");
const {
  getRecommendations,
  TRENDING_TOPICS,
} = require("../utils/recommendationService");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// ─── POST /search — Smart lecture search ────────────────────
router.post("/search", authMiddleware, async (req, res) => {
  try {
    const { topic, subject, unit } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid topic (at least 2 characters)",
      });
    }

    const sanitizedTopic = topic.trim().substring(0, 100);

    const results = await getRecommendations(
      sanitizedTopic,
      subject || "",
      unit || "",
      req.user?._id
    );

    // Log search to history
    try {
      await SearchHistory.create({
        userId: req.user?._id,
        query: sanitizedTopic,
        subject: subject || "",
        unit: unit || "",
        resultCount: results.totalResults,
      });
    } catch (logErr) {
      console.warn("[Lectures] Failed to log search:", logErr.message);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("[Lectures] Search error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lecture recommendations. Please try again.",
    });
  }
});

// ─── GET /trending — Trending topics ────────────────────────
router.get("/trending", async (req, res) => {
  try {
    res.json({ success: true, topics: TRENDING_TOPICS });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch trending topics" });
  }
});

// ─── GET /subjects — All subjects (shared syllabus → global fallback) ─
router.get("/subjects", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Check shared university syllabus
    if (user.university && user.branch) {
      const uniSyllabi = await UniversitySyllabus.find({
        university: { $regex: new RegExp(`^${user.university}$`, "i") },
        branch: { $regex: new RegExp(`^${user.branch}$`, "i") },
        status: "ready",
      }).lean();

      if (uniSyllabi.length > 0) {
        const subjects = uniSyllabi.flatMap((s) =>
          (s.subjects || []).map((subj) => ({
            name: subj.name,
            code: subj.code || "",
            semester: s.semester,
            source: "university",
          }))
        );
        if (subjects.length > 0) {
          return res.json({ success: true, subjects, source: "university" });
        }
      }
    }

    // Fallback to old global syllabus
    const syllabi = await Syllabus.find({}, "subjectName subjectCode semester").lean();
    const subjects = syllabi.map((s) => ({
      name: s.subjectName,
      code: s.subjectCode,
      semester: s.semester,
      source: "global",
    }));
    res.json({ success: true, subjects, source: "global" });
  } catch (error) {
    console.error("[Lectures] Subjects error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch subjects" });
  }
});

// ─── GET /units/:subjectName — Units for a subject ──────────
router.get("/units/:subjectName", authMiddleware, async (req, res) => {
  try {
    const { subjectName } = req.params;
    const user = req.user;

    // Check shared university syllabus
    if (user.university && user.branch) {
      const uniSyllabi = await UniversitySyllabus.find({
        university: { $regex: new RegExp(`^${user.university}$`, "i") },
        branch: { $regex: new RegExp(`^${user.branch}$`, "i") },
        status: "ready",
      }).lean();

      for (const syl of uniSyllabi) {
        const matchedSubject = (syl.subjects || []).find(
          (s) => s.name.toLowerCase().includes(subjectName.toLowerCase())
        );
        if (matchedSubject) {
          const units = (matchedSubject.units || []).map((u) => ({
            unitNumber: u.unitNumber,
            title: u.title,
            topics: u.topics || [],
          }));
          return res.json({ success: true, units, subjectName: matchedSubject.name, source: "university" });
        }
      }
    }

    // Fallback to global
    const syllabus = await Syllabus.findOne({
      subjectName: { $regex: new RegExp(subjectName, "i") },
    }).lean();

    if (!syllabus) {
      return res.json({ success: true, units: [] });
    }

    const units = (syllabus.units || []).map((u) => ({
      unitNumber: u.unitNumber,
      title: u.title,
      topics: u.topics || [],
    }));

    res.json({ success: true, units, subjectName: syllabus.subjectName, source: "global" });
  } catch (error) {
    console.error("[Lectures] Units error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch units" });
  }
});

// ─── GET /channels — List all approved channels ─────────────
router.get("/channels", authMiddleware, async (req, res) => {
  try {
    const channels = await ApprovedChannel.find()
      .sort({ priority: -1, channelName: 1 })
      .lean();
    res.json({ success: true, channels });
  } catch (error) {
    console.error("[Lectures] Channels error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch channels" });
  }
});

// ─── POST /channels — Add approved channel ──────────────────
router.post("/channels", authMiddleware, async (req, res) => {
  try {
    const { channelId, channelName, channelUrl, subjectTags, priority, notes } = req.body;

    if (!channelId || !channelName || !channelUrl) {
      return res.status(400).json({
        success: false,
        message: "channelId, channelName, and channelUrl are required",
      });
    }

    const channel = await ApprovedChannel.create({
      channelId,
      channelName,
      channelUrl,
      subjectTags: subjectTags || [],
      priority: priority || 5,
      notes: notes || "",
    });

    res.status(201).json({ success: true, channel });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Channel already exists" });
    }
    console.error("[Lectures] Add channel error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add channel" });
  }
});

// ─── PATCH /channels/:id — Update channel ───────────────────
router.patch("/channels/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};
    const allowed = ["channelName", "channelUrl", "subjectTags", "priority", "isActive", "notes"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const channel = await ApprovedChannel.findByIdAndUpdate(id, update, { new: true });
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    res.json({ success: true, channel });
  } catch (error) {
    console.error("[Lectures] Update channel error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update channel" });
  }
});

// ─── DELETE /channels/:id — Remove channel ──────────────────
router.delete("/channels/:id", authMiddleware, async (req, res) => {
  try {
    const channel = await ApprovedChannel.findByIdAndDelete(req.params.id);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }
    res.json({ success: true, message: "Channel removed" });
  } catch (error) {
    console.error("[Lectures] Delete channel error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete channel" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ─── SHARED UNIVERSITY SYLLABUS ENDPOINTS ───────────────────
// ═══════════════════════════════════════════════════════════════

// ─── Helper: Extract text from PDF/image ────────────────────
async function extractTextFromFile(fileUrl, mimetype) {
  const response = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 30000 });
  const buffer = Buffer.from(response.data);

  if (mimetype === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf")) {
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(buffer);
    const text = (pdfData.text || "").trim();

    if (text.length > 100) {
      console.log(`[Syllabus] PDF native extraction: ${text.length} chars`);
      return text;
    }
    console.log(`[Syllabus] PDF extraction sparse (${text.length} chars), returning as-is`);
    return text || "";
  } else {
    const { createWorker } = require("tesseract.js");
    const worker = await createWorker("eng");
    try {
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      console.log(`[Syllabus] OCR extraction: ${text.length} chars`);
      return text || "";
    } catch (err) {
      await worker.terminate();
      throw err;
    }
  }
}

// ─── Helper: AI-structure raw syllabus text with semester categorization ─
async function structureSyllabusWithAI(rawText, university, branch) {
  if (!groq) throw new Error("Groq AI not configured");

  // Use up to 15K chars for better coverage
  const truncated = rawText.substring(0, 15000);

  const prompt = `You are a precise university syllabus parser. Parse the following raw syllabus text and extract EVERY subject, unit, and topic.

CONTEXT:
- University: ${university || "Unknown"}
- Branch/Department: ${branch || "Unknown"}

RAW SYLLABUS TEXT:
${truncated}

CRITICAL INSTRUCTIONS:
1. Identify the SEMESTER for each subject. Look for "Semester", "Sem", "Year" indicators. If a PDF has subjects from multiple semesters (e.g. 3rd and 4th sem), categorize each subject under its correct semester.
2. Extract ALL granular topics under each unit. Do NOT just list the unit title — list every sub-topic, concept, algorithm, theorem, or technique mentioned.
   - Example: If a unit says "Sorting: Bubble Sort, Quick Sort, Merge Sort, Heap Sort" → output ["Bubble Sort", "Quick Sort", "Merge Sort", "Heap Sort"] not just ["Sorting"]
3. If the text mentions "Introduction to X, Y, Z" → split into ["Introduction to X", "Y", "Z"]
4. Preserve technical terms exactly as written (e.g., "B+ Trees", "NP-Complete", "ER Model")

RESPOND IN THIS EXACT JSON FORMAT:
{
  "semesters": [
    {
      "semester": 3,
      "subjects": [
        {
          "name": "Full Subject Name",
          "code": "CS301",
          "units": [
            {
              "unitNumber": 1,
              "title": "Unit Title",
              "topics": ["Granular Topic 1", "Granular Topic 2", "Specific Algorithm Name"],
              "hours": 8
            }
          ]
        }
      ]
    }
  ]
}

If semester number is unclear, use 0. Do NOT skip any subject or topic.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a precise syllabus parser. Extract ALL topics granularly. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.15,
    max_tokens: 6000,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return parsed.semesters || [];
}

// ─── Helper: Merge new subjects into existing semester doc ───
function mergeSubjects(existingSubjects, newSubjects) {
  const merged = [...existingSubjects];

  for (const newSubj of newSubjects) {
    const existingIdx = merged.findIndex(
      (s) => s.name.toLowerCase() === newSubj.name.toLowerCase() ||
             (s.code && newSubj.code && s.code.toLowerCase() === newSubj.code.toLowerCase())
    );

    if (existingIdx >= 0) {
      // Subject exists — merge units/topics
      const existing = merged[existingIdx];
      for (const newUnit of newSubj.units || []) {
        const unitIdx = existing.units.findIndex((u) => u.unitNumber === newUnit.unitNumber);
        if (unitIdx >= 0) {
          // Merge topics (deduplicate)
          const existingTopics = new Set(existing.units[unitIdx].topics.map((t) => t.toLowerCase()));
          for (const topic of newUnit.topics || []) {
            if (!existingTopics.has(topic.toLowerCase())) {
              existing.units[unitIdx].topics.push(topic);
            }
          }
        } else {
          existing.units.push(newUnit);
        }
      }
      // Sort units by number
      existing.units.sort((a, b) => a.unitNumber - b.unitNumber);
    } else {
      // New subject — add it
      merged.push(newSubj);
    }
  }

  return merged;
}

// ─── POST /syllabus/upload — Upload & process into shared pool ─
router.post("/syllabus/upload", authMiddleware, upload.single("syllabus"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = req.user;
    if (!user.university || !user.branch) {
      return res.status(400).json({
        success: false,
        message: "Please set your university and branch in your profile before uploading a syllabus.",
      });
    }

    const fileUrl = req.file.path || req.file.secure_url || req.file.url;
    const userId = user._id;

    // Return immediately, process in background
    res.json({
      success: true,
      message: "Syllabus upload started. Processing with OCR and AI...",
      status: "processing",
    });

    // ─── Background processing ─────────────────────────────
    (async () => {
      try {
        // Step 1: Extract text
        console.log(`[Syllabus] Extracting text for user ${userId} (${user.university}/${user.branch})`);
        const rawText = await extractTextFromFile(fileUrl, req.file.mimetype);

        if (!rawText || rawText.length < 50) {
          console.error(`[Syllabus] Extraction too short (${rawText?.length || 0} chars)`);
          return;
        }

        // Step 2: AI structures into semesters
        console.log(`[Syllabus] AI structuring ${rawText.length} chars...`);
        const semesters = await structureSyllabusWithAI(rawText, user.university, user.branch);

        if (!semesters.length) {
          console.error("[Syllabus] AI returned no semesters");
          return;
        }

        // Step 3: Upsert into UniversitySyllabus per semester
        for (const semData of semesters) {
          const semNum = semData.semester || 0;
          const newSubjects = semData.subjects || [];

          if (newSubjects.length === 0) continue;

          // Find existing doc for this university+branch+semester
          const existing = await UniversitySyllabus.findOne({
            university: { $regex: new RegExp(`^${user.university}$`, "i") },
            branch: { $regex: new RegExp(`^${user.branch}$`, "i") },
            semester: semNum,
          });

          if (existing) {
            // Merge subjects
            const mergedSubjects = mergeSubjects(existing.subjects, newSubjects);
            await UniversitySyllabus.findByIdAndUpdate(existing._id, {
              subjects: mergedSubjects,
              $addToSet: { uploadedBy: userId, originalFileUrls: fileUrl },
              lastUpdatedBy: userId,
              status: "ready",
              errorMessage: "",
            });
            console.log(`[Syllabus] ✓ Merged into sem ${semNum}: ${newSubjects.length} subjects`);
          } else {
            // Create new
            await UniversitySyllabus.create({
              university: user.university,
              branch: user.branch,
              semester: semNum,
              subjects: newSubjects,
              uploadedBy: [userId],
              originalFileUrls: [fileUrl],
              lastUpdatedBy: userId,
              status: "ready",
            });
            console.log(`[Syllabus] ✓ Created sem ${semNum}: ${newSubjects.length} subjects`);
          }
        }

        const totalSubjects = semesters.reduce((sum, s) => sum + (s.subjects?.length || 0), 0);
        console.log(`[Syllabus] ✓ Done for ${user.university}/${user.branch}: ${semesters.length} semesters, ${totalSubjects} subjects`);
      } catch (err) {
        console.error(`[Syllabus] Processing failed:`, err.message);
      }
    })();
  } catch (error) {
    console.error("[Syllabus] Upload error:", error.message);
    res.status(500).json({ success: false, message: "Failed to upload syllabus" });
  }
});

// ─── GET /syllabus — Get all semesters for user's university ─
router.get("/syllabus", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user.university || !user.branch) {
      return res.json({ success: true, semesters: [], hasUploaded: false });
    }

    const syllabi = await UniversitySyllabus.find({
      university: { $regex: new RegExp(`^${user.university}$`, "i") },
      branch: { $regex: new RegExp(`^${user.branch}$`, "i") },
      status: "ready",
    })
      .sort({ semester: 1 })
      .lean();

    const semesters = syllabi.map((s) => ({
      _id: s._id,
      semester: s.semester,
      subjects: s.subjects,
      contributorCount: s.uploadedBy?.length || 1,
      lastUpdated: s.updatedAt,
    }));

    // Check if this user contributed
    const userContributed = syllabi.some((s) =>
      s.uploadedBy?.some((uid) => uid.toString() === user._id.toString())
    );

    res.json({
      success: true,
      semesters,
      hasUploaded: userContributed,
      university: user.university,
      branch: user.branch,
    });
  } catch (error) {
    console.error("[Syllabus] Get error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch syllabus" });
  }
});

// ─── DELETE /syllabus/:semester — Remove a semester's syllabus ─
router.delete("/syllabus/:semester", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const semester = parseInt(req.params.semester);
    await UniversitySyllabus.findOneAndDelete({
      university: { $regex: new RegExp(`^${user.university}$`, "i") },
      branch: { $regex: new RegExp(`^${user.branch}$`, "i") },
      semester,
    });
    res.json({ success: true, message: "Semester syllabus removed" });
  } catch (error) {
    console.error("[Syllabus] Delete error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete syllabus" });
  }
});

module.exports = router;
