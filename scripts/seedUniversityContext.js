/**
 * Seed script for UniversityContext
 * Run with: node scripts/seedUniversityContext.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const UniversityContext = require("../models/UniversityContext");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medha";

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
    { 
      name: "Advanced Engineering Mathematics", 
      code: "AEM",
      keywords: ["aem", "advanced engineering mathematics", "mathematics", "maths", "calculus", "differential equations"]
    },
    { 
      name: "Managerial Economics and Financial Accounting", 
      code: "MEFA",
      keywords: ["mefa", "managerial economics", "financial accounting", "economics", "accounting"]
    },
    { 
      name: "Digital Electronics", 
      code: "DE",
      keywords: ["de", "digital electronics", "electronics", "logic gates", "boolean algebra", "flip flops"]
    },
    { 
      name: "Data Structures and Algorithms", 
      code: "DSA",
      keywords: ["dsa", "data structures", "algorithms", "arrays", "linked list", "trees", "graphs", "sorting"]
    },
    { 
      name: "Object Oriented Programming", 
      code: "OOPS",
      keywords: ["oops", "object oriented", "oop", "java", "classes", "inheritance", "polymorphism", "encapsulation"]
    },
    { 
      name: "Software Engineering", 
      code: "SE",
      keywords: ["se", "software engineering", "sdlc", "software development", "testing", "agile", "waterfall"]
    },
    { 
      name: "Technical Communication", 
      code: "TC",
      keywords: ["tc", "technical communication", "communication", "writing", "report writing"]
    },
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

async function seedContext() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Upsert RTU CSE Context
    await UniversityContext.findOneAndUpdate(
      { university: "RTU", branch: "CSE", semester: "3" },
      rtuCseContext,
      { upsert: true, new: true }
    );
    console.log("✅ RTU CSE 3rd Sem context seeded");

    // Upsert RTU AIDS Context
    await UniversityContext.findOneAndUpdate(
      { university: "RTU", branch: "AIDS", semester: "3" },
      rtuAidsContext,
      { upsert: true, new: true }
    );
    console.log("✅ RTU AIDS 3rd Sem context seeded");

    // Upsert Generic Context
    await UniversityContext.findOneAndUpdate(
      { university: "OTHER", branch: "ALL", semester: "ALL" },
      genericContext,
      { upsert: true, new: true }
    );
    console.log("✅ Generic context seeded");

    console.log("\n🎉 All university contexts seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedContext();
