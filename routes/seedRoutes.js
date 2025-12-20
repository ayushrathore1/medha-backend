const express = require("express");
const router = express.Router();
const UniversityContext = require("../models/UniversityContext");

// RTU CSE 3rd Semester Context Data
const rtuCseContext = {
  university: "RTU",
  branch: "CSE", 
  semester: "3",
  universityFullName: "Rajasthan Technical University",
  
  examSchedule: [
    { date: "2nd Jan 2026", subject: "Advanced Engineering Mathematics", subjectCode: "AEM" },
    { date: "5th Jan 2026", subject: "Managerial Economics and Financial Accounting", subjectCode: "MEFA" },
    { date: "7th Jan 2026", subject: "Digital Electronics", subjectCode: "DE" },
    { date: "9th Jan 2026", subject: "Data Structures and Algorithms", subjectCode: "DSA" },
    { date: "13th Jan 2026", subject: "Object Oriented Programming", subjectCode: "OOPS" },
    { date: "15th Jan 2026", subject: "Software Engineering", subjectCode: "SE" },
  ],
  
  subjects: [
    { name: "Advanced Engineering Mathematics", code: "AEM", keywords: ["aem", "advanced engineering mathematics", "mathematics", "maths", "calculus", "differential equations"] },
    { name: "Managerial Economics and Financial Accounting", code: "MEFA", keywords: ["mefa", "managerial economics", "financial accounting", "economics", "accounting"] },
    { name: "Digital Electronics", code: "DE", keywords: ["de", "digital electronics", "electronics", "logic gates", "boolean algebra", "flip flops"] },
    { name: "Data Structures and Algorithms", code: "DSA", keywords: ["dsa", "data structures", "algorithms", "arrays", "linked list", "trees", "graphs", "sorting"] },
    { name: "Object Oriented Programming", code: "OOPS", keywords: ["oops", "object oriented", "oop", "java", "classes", "inheritance", "polymorphism", "encapsulation"] },
    { name: "Software Engineering", code: "SE", keywords: ["se", "software engineering", "sdlc", "software development", "testing", "agile", "waterfall"] },
    { name: "Technical Communication", code: "TC", keywords: ["tc", "technical communication", "communication", "writing", "report writing"] },
  ],
  
  systemPromptAdditions: `
You are assisting an RTU (Rajasthan Technical University) student.
- RTU follows a semester-based system with theory exams typically in January and June.
- Reference RTU syllabus and exam patterns when answering academic questions.
- RTU 3rd Sem CSE covers: AEM, MEFA, DE, DSA, OOPS, SE, TC.
`,
  isActive: true,
};

// RTU AIDS - same syllabus as CSE
const rtuAidsContext = {
  ...rtuCseContext,
  branch: "AIDS",
  systemPromptAdditions: `
You are assisting an RTU (Rajasthan Technical University) AIDS (AI & Data Science) student.
- AIDS branch shares the same syllabus as CSE for core subjects.
- RTU follows a semester-based system with theory exams typically in January and June.
- Reference RTU syllabus and exam patterns when answering academic questions.
`,
};

// Generic context for unsupported universities
const genericContext = {
  university: "OTHER",
  branch: "ALL",
  semester: "ALL",
  universityFullName: "Your University",
  examSchedule: [],
  subjects: [],
  systemPromptAdditions: `
This student is from a university not yet fully supported in MEDHA.
- Provide general academic help and study tips.
- Mention that exam-specific content is coming soon for their university.
- Focus on fundamental concepts that are universal across universities.
`,
  isActive: true,
};

// POST /api/seed/university-context - Seed university context data
router.post("/university-context", async (req, res) => {
  try {
    // Upsert RTU CSE Context
    await UniversityContext.findOneAndUpdate(
      { university: "RTU", branch: "CSE", semester: "3" },
      rtuCseContext,
      { upsert: true, new: true }
    );

    // Upsert RTU AIDS Context
    await UniversityContext.findOneAndUpdate(
      { university: "RTU", branch: "AIDS", semester: "3" },
      rtuAidsContext,
      { upsert: true, new: true }
    );

    // Upsert Generic Context
    await UniversityContext.findOneAndUpdate(
      { university: "OTHER", branch: "ALL", semester: "ALL" },
      genericContext,
      { upsert: true, new: true }
    );

    res.json({ 
      success: true, 
      message: "University context data seeded successfully!",
      seeded: ["RTU CSE 3rd Sem", "RTU AIDS 3rd Sem", "Generic/Other"]
    });
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/seed/university-context - Check seeded data
router.get("/university-context", async (req, res) => {
  try {
    const contexts = await UniversityContext.find({}).lean();
    res.json({ count: contexts.length, contexts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
