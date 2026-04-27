/**
 * Seed script: Data Communication & Computer Networks 2022 PYQ Analysis
 * Run: node seeds/seedDCCN2022.js
 *
 * B.Tech IV Sem Main Exam 2022
 * Paper: 4E1307 | Subject: DCCN (4CS4-07)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DCCN_2022_YEAR = {
  year: 2022,
  units: [
    // ─── Unit 2: Physical Layer (12 marks) ───
    {
      unitSerial: 2,
      unitName: "Physical Layer — OSI/TCP, Signals, Line Coding, Modulation",
      totalMarks: 12,
      questions: [
        { qCode: "A1", marks: 2, text: "What is Data Communication?" },
        { qCode: "A2", marks: 2, text: "Differentiate Analog and Digital signals." },
        { qCode: "B1", marks: 4, text: "Explain OSI reference model with neat diagram." },
        { qCode: "B7", marks: 4, text: "Explain the various network topologies in detail." },
      ],
    },
    // ─── Unit 3: Data Link Layer (28 marks) ───
    {
      unitSerial: 3,
      unitName: "Data Link Layer — Error Control, ARQ, ALOHA, CSMA",
      totalMarks: 28,
      questions: [
        { qCode: "A3", marks: 2, text: "What is ALOHA?" },
        { qCode: "A4", marks: 2, text: "Define Piggybacking." },
        { qCode: "B2", marks: 4, text: "Describe Go Back N protocol." },
        { qCode: "C1", marks: 10, text: "Explain the working of the following CSMA protocols in detail. (a) Persistent (b) Non-Persistent (c) P-Persistent" },
        { qCode: "C4", marks: 10, text: "Explain types of sliding window ARQ error control. How do they differ from each other?" },
      ],
    },
    // ─── Unit 4: Network Layer (22 marks) ───
    {
      unitSerial: 4,
      unitName: "Network Layer — Routing, IPv4/IPv6, Congestion, Subnetting",
      totalMarks: 22,
      questions: [
        { qCode: "A5", marks: 2, text: "What is Tunneling?" },
        { qCode: "A6", marks: 2, text: "Write any two differences between classful and classless addressing." },
        { qCode: "B3", marks: 4, text: "Explain, how congestion is controlled at network layer?" },
        { qCode: "B6", marks: 4, text: "What is the purpose of Subnetting? Explain the use of masking in Subnetting." },
        { qCode: "C2", marks: 10, text: "Explain IPv4 Header format in detail. Compare it with IPv6." },
      ],
    },
    // ─── Unit 5: Transport Layer (18 marks) ───
    {
      unitSerial: 5,
      unitName: "Transport Layer — TCP, UDP, QoS, Leaky/Token Bucket",
      totalMarks: 18,
      questions: [
        { qCode: "A7", marks: 2, text: "Write features of UDP." },
        { qCode: "A8", marks: 2, text: "Write uses of Leaky Bucket Algorithm." },
        { qCode: "B4", marks: 4, text: "Draw and explain TCP header format in detail." },
        { qCode: "C5", marks: 10, text: "What are three way handshaking protocol in TCP? Explain, why connection termination in TCP is symmetric, whereas connection establishment is not?" },
      ],
    },
    // ─── Unit 6: Application Layer (18 marks) ───
    {
      unitSerial: 6,
      unitName: "Application Layer — DNS, HTTP, FTP, SMTP, Security",
      totalMarks: 18,
      questions: [
        { qCode: "A9", marks: 2, text: "What is SMTP?" },
        { qCode: "A10", marks: 2, text: "Draw Header format of HTTP reply message." },
        { qCode: "B5", marks: 4, text: "Explain DNS and its working." },
        { qCode: "C3", marks: 10, text: "Describe File Transfer Protocol (FTP) with suitable diagram. Explain SNMP." },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({
      subjectName: "Data Communication & Computer Networks",
    });

    if (existing) {
      const yearExists = existing.years.some((y) => y.year === 2022);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2022);
      }
      existing.years.push(DCCN_2022_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2022 data for DCCN");
    } else {
      await ExamAnalysis.create({
        subjectName: "Data Communication & Computer Networks",
        totalPaperMarks: 98,
        years: [DCCN_2022_YEAR],
      });
      console.log("✅ Created new DCCN subject with 2022 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Data Communication & Computer Networks",
    });
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
