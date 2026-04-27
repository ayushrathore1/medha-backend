/**
 * Seed script: Technical Communication 2022 PYQ Analysis
 * Run: node seeds/seedTC2022.js
 *
 * B.Tech IV Sem 2023 (Back Exam) — effectively 2022 batch paper
 * Subject: Technical Communication
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const TC_2022_YEAR = {
  year: 2022,
  units: [
    {
      unitSerial: 2,
      unitName: "Introduction to Technical Communication",
      totalMarks: 22,
      questions: [
        { qCode: "A1", marks: 2, text: "Mention two objectives of Technical communication." },
        { qCode: "A5", marks: 2, text: "Distinguish between Technical and non-Technical communication." },
        { qCode: "A6", marks: 2, text: "Suggest two methods of enhancing Listening communication skills." },
        { qCode: "A7", marks: 2, text: "Mention any two ways for improving Linguistic abilities of engineering students." },
        { qCode: "B4", marks: 4, text: "What is the importance of Communication Skills? Discuss in detail." },
        { qCode: "C1", marks: 10, text: "What is technical communication? Discuss the different forms of communication." },
      ],
    },
    {
      unitSerial: 3,
      unitName: "Comprehension, Information Design & Development",
      totalMarks: 22,
      questions: [
        { qCode: "A2", marks: 2, text: "What do you understand by the term 'Technical Document'?" },
        { qCode: "A8", marks: 2, text: "What do you mean by Information Development." },
        { qCode: "B5", marks: 4, text: "On the basis of your reading of the passage given below, make notes in points only, using abbreviations, wherever necessary. Also, suggest a suitable title." },
        { qCode: "B6", marks: 4, text: "Suggest some tried and tested techniques on how to Revise a technical text." },
        { qCode: "C5", marks: 10, text: "Write a note on information Design." },
      ],
    },
    {
      unitSerial: 4,
      unitName: "Technical Writing, Grammar, Editing & Official Documents",
      totalMarks: 30,
      questions: [
        { qCode: "A3", marks: 2, text: "Define the term 'Technical Discourse'?" },
        { qCode: "B3", marks: 4, text: "Write an E-mail to announce and congratulate your team as it has achieved the quarterly goal of reaching $500,000 in sales. Invent all relevant information." },
        { qCode: "B7", marks: 4, text: "Fill in the blanks (Any four): [Grammar fill-in-the-blank questions]" },
        { qCode: "C2", marks: 10, text: "What do you mean by minutes of meeting? What 8 things should the minutes of a meeting include?" },
        { qCode: "C3", marks: 10, text: "Ankush Goyal, a resident of 315, Goal Chouraila, Mumbai reads an advertisement in the newspaper for the requirement of engineering graduates to market the products of a multinational company located in Mumbai. Write Ankush's application to the personnel manager, Larsen and Turbo Ltd. 365, Badlapur, Mumbai." },
      ],
    },
    {
      unitSerial: 5,
      unitName: "Advanced Writing — Reports, Proposals, Articles",
      totalMarks: 24,
      questions: [
        { qCode: "A4", marks: 2, text: "Name different types of 'Technical Reports'?" },
        { qCode: "A9", marks: 2, text: "What does Structure of technical articles stand for." },
        { qCode: "A10", marks: 2, text: "Mention the different types of Technical Articles." },
        { qCode: "B1", marks: 4, text: "Describe how to write a Technical Project Proposal in a step by step manner." },
        { qCode: "B2", marks: 4, text: "Recently your college held several competitions as part of Techfest celebrations. Write an article in 100-125 words on the topic 'The prize distribution' for your college magazine." },
        { qCode: "C4", marks: 10, text: "You are Ankush/Ankita. You partook in a program planned by 'Entrepreneurs Club'. Write a report on the program of about 150-200 words for 'Entrepreneurs Avenues' mentioning the importance of entrepreneurship." },
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
      existing.years = existing.years.filter((y) => y.year !== 2022);
      existing.years.push(TC_2022_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2022 data for Technical Communication");
    } else {
      await ExamAnalysis.create({
        subjectName: "Technical Communication",
        totalPaperMarks: 98,
        years: [TC_2022_YEAR],
      });
      console.log("✅ Created new Technical Communication subject with 2022 data");
    }

    const result = await ExamAnalysis.findOne({ subjectName: "Technical Communication" });
    console.log(`\n📊 Verification:`);
    console.log(`   Subject: ${result.subjectName}`);
    console.log(`   Available years: ${result.years.map((y) => y.year).sort().join(", ")}`);
    const yearData = result.years.find((y) => y.year === 2022);
    yearData.units.forEach((u) => {
      console.log(`     Unit ${u.unitSerial}: ${u.unitName} — ${u.totalMarks} marks (${u.questions.length} questions)`);
    });
    const total = yearData.units.reduce((s, u) => s + u.totalMarks, 0);
    console.log(`   Total marks (2022): ${total}`);

    await mongoose.disconnect();
    console.log("\n✅ Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
