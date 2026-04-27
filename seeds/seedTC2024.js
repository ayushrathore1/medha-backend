/**
 * Seed script: Technical Communication 2024 PYQ Analysis
 * Run: node seeds/seedTC2024.js
 *
 * B.Tech III Sem Main Exam — Feb 2024
 * Paper: 4E1307 | Subject: Technical Communication
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const TC_2024_YEAR = {
  year: 2024,
  units: [
    // ─── Unit 2: Introduction to Technical Communication (18 marks) ───
    {
      unitSerial: 2,
      unitName: "Introduction to Technical Communication",
      totalMarks: 18,
      questions: [
        { qCode: "A1", marks: 2, text: "What are various aspects of technical communication?" },
        { qCode: "A2", marks: 2, text: "Write two importance of technical communication." },
        { qCode: "A3", marks: 2, text: "Define style in technical communication." },
        { qCode: "A10", marks: 2, text: "Write a short note on Linguistic Ability." },
        { qCode: "C2", marks: 10, text: "Describe various features of style in technical communication." },
      ],
    },
    // ─── Unit 3: Comprehension, Information Design & Development (36 marks) ───
    {
      unitSerial: 3,
      unitName: "Comprehension, Information Design & Development",
      totalMarks: 36,
      questions: [
        { qCode: "A4", marks: 2, text: "What are various steps to read a technical text?" },
        { qCode: "A5", marks: 2, text: "List the benefits of note-making." },
        { qCode: "A6", marks: 2, text: "Name different technical texts." },
        { qCode: "B1", marks: 4, text: "Explain ERRQ and SQ3R Reading Technique." },
        { qCode: "B2", marks: 4, text: "Reading makes a man complete francis Bacon. How can you develop effective reading skills?" },
        { qCode: "B3", marks: 4, text: "What is the process of reading a technical manual?" },
        { qCode: "B4", marks: 4, text: "Elaborate various ways to collect information." },
        { qCode: "B5", marks: 4, text: "Enlist various factors which affect designing of a document." },
        { qCode: "C1", marks: 10, text: "Explain various types of note-making." },
      ],
    },
    // ─── Unit 4: Technical Writing, Grammar, Editing & Official Documents (26 marks) ───
    {
      unitSerial: 4,
      unitName: "Technical Writing, Grammar, Editing & Official Documents",
      totalMarks: 26,
      questions: [
        { qCode: "A7", marks: 2, text: "Correct the following sentences. i) Both the sister were seen at the party. ii) She is one of the best student in our class." },
        { qCode: "A8", marks: 2, text: "Form two words by using the each prefix - in and - un." },
        { qCode: "A9", marks: 2, text: "Underline and rewrite the noun phrase in the following sentences. i) The cat with the stripes tried to trip me. ii) My green gym socks are in the hamper." },
        { qCode: "C3", marks: 10, text: "Assume yourself as the cultural secretary, you are organizing an instrument playing programme in your Institute/College/University. Draft an e-mail informing all the teachers, students and staff members of your College about the event and invite them to attend the event. Invent the necessary details." },
        { qCode: "C4", marks: 10, text: "Assuming yourself a hostler, write minutes of the meeting, which you have attended with the hostel warden and chief warden to improve the quality of food served in the hostel mess." },
      ],
    },
    // ─── Unit 5: Advanced Writing — Reports, Proposals, Articles (18 marks) ───
    {
      unitSerial: 5,
      unitName: "Advanced Writing — Reports, Proposals, Articles",
      totalMarks: 18,
      questions: [
        { qCode: "B6", marks: 4, text: "What are various types of technical articles? Explain." },
        { qCode: "B7", marks: 4, text: "Enumerate the different characteristics of technical project proposal." },
        { qCode: "C5", marks: 10, text: "Prepare a report on the Campus placement Drive organized in your College on 12th Jan. 2023." },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({
      subjectName: "Technical Communication",
    });

    if (existing) {
      const yearExists = existing.years.some((y) => y.year === 2024);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2024);
      }
      existing.years.push(TC_2024_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2024 data for Technical Communication");
    } else {
      await ExamAnalysis.create({
        subjectName: "Technical Communication",
        totalPaperMarks: 98,
        years: [TC_2024_YEAR],
      });
      console.log("✅ Created new Technical Communication subject with 2024 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Technical Communication",
    });
    console.log(`\n📊 Verification:`);
    console.log(`   Subject: ${result.subjectName}`);
    console.log(`   Available years: ${result.years.map((y) => y.year).sort().join(", ")}`);
    const yearData = result.years.find((y) => y.year === 2024);
    yearData.units.forEach((u) => {
      console.log(`     Unit ${u.unitSerial}: ${u.unitName} — ${u.totalMarks} marks (${u.questions.length} questions)`);
    });
    const total = yearData.units.reduce((s, u) => s + u.totalMarks, 0);
    console.log(`   Total marks (2024): ${total}`);

    await mongoose.disconnect();
    console.log("\n✅ Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
