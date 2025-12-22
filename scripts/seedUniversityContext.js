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

[ADMIN EMAIL TEMPLATE STYLE GUIDE]
When asked to generate HTML email templates, use this modern dark theme style:
- Background: Dark slate (#0f172a outer, #1e293b inner container)
- Header: Vibrant gradient (purple/violet: #6366f1 → #8b5cf6 → #a855f7)
- Feature Cards: Each feature should have a UNIQUE gradient background color:
  • Red gradient (#dc2626 → #b91c1c) for YouTube/Video features
  • Green gradient (#059669 → #047857) for Notes features
  • Blue gradient (#2563eb → #1d4ed8) for AI/Chatbot features
  • Purple gradient (#7c3aed → #6d28d9) for Exam features
  • Cyan gradient (#0891b2 → #0e7490) for Updates features
  • Orange gradient (#ea580c → #c2410c) for Flashcards features
  • Pink gradient (#db2777 → #be185d) for Quiz features
  • Indigo gradient (#4f46e5 → #4338ca) for Dashboard features
  • Slate gradient (#475569 → #334155) for Support/Messaging features
- Text: White on colored cards, slate-400 (#94a3b8) for body text on dark bg
- NO images - use large emoji icons (48px font-size) inside each card
- Card style: border-radius: 16px, padding: 30px
- CTA Button: Gradient background with large border-radius (50px), uppercase, letter-spacing
- Use "NEW" badges (yellow bg #fef08a with dark text) for new features
- Include credits: "Team Medha" in footer
- Font: 'Segoe UI', Tahoma, sans-serif
- Always use inline styles (not CSS classes) for email compatibility

MEDHA Features to highlight in emails:
1. YouTube Video Lectures (NEW) - Watch curated videos from Jenny's Lectures, CodeWithHarry, CodeHelp, Chai Aur Code directly in MEDHA
2. Public Notes - Share and explore community notes
3. AI Chatbot with Web Access - Llama-3-70b powered with real-time web access
4. RTU Exams & "Medha, Solve It!" - PYQs with AI-generated solutions + Unit Weightage Analysis
5. Real-Time RTU Updates - Exam notifications, date sheets, results
6. Smart AI Flashcards - AI-generated revision cards
7. Interactive Quizzes - Subject-wise and topic-wise quizzes
8. Daily Planner & Dashboard - AI study plans with activity calendar
9. Direct Admin Support - Message developers directly
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
