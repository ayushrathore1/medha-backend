/**
 * Seed script: Technical Communication 2023 PYQ Analysis
 * Run: node seeds/seedTC2023.js
 *
 * B.Tech III Sem Main/Back Exam — Feb 2023
 * Paper: 3E1250 | Subject: Technical Communication | All Branches (AI & DS)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const TC_2023_YEAR = {
  year: 2023,
  units: [
    {
      unitSerial: 2,
      unitName: "Introduction to Technical Communication",
      totalMarks: 22,
      questions: [
        { qCode: "A1", marks: 2, text: "What are the four main features of technical communication?" },
        { qCode: "A2", marks: 2, text: "What are linguistic abilities?" },
        { qCode: "A8", marks: 2, text: "How can you improve your Speaking Skills?" },
        { qCode: "A9", marks: 2, text: "What is the difference between Listening and Hearing?" },
        { qCode: "B1", marks: 4, text: "Discuss the aspects of Technical Communication in detail." },
        { qCode: "C2", marks: 10, text: "Define the term technical communication. Explain the process (cycle) of communication in detail." },
      ],
    },
    {
      unitSerial: 3,
      unitName: "Comprehension, Information Design & Development",
      totalMarks: 18,
      questions: [
        { qCode: "A3", marks: 2, text: "Name the different types of manuals?" },
        { qCode: "A4", marks: 2, text: "Which is more reliable- Print Media or Online Media? Why?" },
        { qCode: "A5", marks: 2, text: "What is the meaning of document design?" },
        { qCode: "A10", marks: 2, text: "Why is reading important for improving Communication Skills?" },
        { qCode: "C4", marks: 10, text: "Describe the factor which influence information and document design." },
      ],
    },
    {
      unitSerial: 4,
      unitName: "Technical Writing, Grammar, Editing & Official Documents",
      totalMarks: 36,
      questions: [
        { qCode: "B4", marks: 4, text: "Discuss the difference between agenda and minutes of meeting. What are the objectives of agenda?" },
        { qCode: "B5", marks: 4, text: "Correct the following sentences: (1) She always felt inferior than her younger sister. (2) I have visited Niagara Falls last weekend. (3) The woman which works here is from Rajasthan (4) She's married with a dentist." },
        { qCode: "B6", marks: 4, text: "Explain the form/ format/ structure/ style of writing Official Notes." },
        { qCode: "B7", marks: 4, text: "What are some strategies for an effective editing and proofreading?" },
        { qCode: "C1", marks: 10, text: "What is Style in Technical communication? Explain the guidelines for writing a good technical document." },
        { qCode: "C5", marks: 10, text: "Evaluate your education, professional training, skills, accomplishments and achievement, interest/ activities and experience. Write a resume for the post of computer executive." },
      ],
    },
    {
      unitSerial: 5,
      unitName: "Advanced Writing — Reports, Proposals, Articles",
      totalMarks: 22,
      questions: [
        { qCode: "A6", marks: 2, text: "What are the steps in Technical Proposal Writing?" },
        { qCode: "A7", marks: 2, text: "Mention the types of technical article." },
        { qCode: "B2", marks: 4, text: "Draft a report on various curricular and co-curricular activities organized in your department/college to be published on RTU website." },
        { qCode: "B3", marks: 4, text: "There is no canteen in your company. Write a proposal to establish a canteen in your College/Institute." },
        { qCode: "C3", marks: 10, text: "What is a Technical Report? Explain in detail about the type, characteristic and objectives of Technical Report." },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({ subjectName: "Technical Communication" });

    if (existing) {
      existing.years = existing.years.filter((y) => y.year !== 2023);
      existing.years.push(TC_2023_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2023 data for Technical Communication");
    } else {
      await ExamAnalysis.create({
        subjectName: "Technical Communication",
        totalPaperMarks: 98,
        years: [TC_2023_YEAR],
      });
      console.log("✅ Created new Technical Communication subject with 2023 data");
    }

    const result = await ExamAnalysis.findOne({ subjectName: "Technical Communication" });
    console.log(`\n📊 Verification:`);
    console.log(`   Subject: ${result.subjectName}`);
    console.log(`   Available years: ${result.years.map((y) => y.year).sort().join(", ")}`);
    const yearData = result.years.find((y) => y.year === 2023);
    yearData.units.forEach((u) => {
      console.log(`     Unit ${u.unitSerial}: ${u.unitName} — ${u.totalMarks} marks (${u.questions.length} questions)`);
    });
    const total = yearData.units.reduce((s, u) => s + u.totalMarks, 0);
    console.log(`   Total marks (2023): ${total}`);

    await mongoose.disconnect();
    console.log("\n✅ Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
