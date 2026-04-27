/**
 * Seed script: Data Communication & Computer Networks 2023 PYQ Analysis
 * Run: node seeds/seedDCCN2023.js
 *
 * B.Tech IV Sem Main Exam 2023
 * Paper: 4E1307 | Subject: DCCN (4CS4-07)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DCCN_2023_YEAR = {
  year: 2023,
  units: [
    // ─── Unit 2: Physical Layer (18 marks) ───
    {
      unitSerial: 2,
      unitName: "Physical Layer — OSI/TCP, Signals, Line Coding, Modulation",
      totalMarks: 18,
      questions: [
        { qCode: "A3", marks: 2, text: "Differentiate digital and analog signals." },
        { qCode: "A7", marks: 2, text: "What are the key elements of network protocols?" },
        { qCode: "B3", marks: 4, text: "What is guided transmission media? Explain Coaxial cable." },
        { qCode: "C1", marks: 10, text: "Explain OSI network model in detail." },
      ],
    },
    // ─── Unit 3: Data Link Layer (20 marks) ───
    {
      unitSerial: 3,
      unitName: "Data Link Layer — Error Control, ARQ, ALOHA, CSMA",
      totalMarks: 20,
      questions: [
        { qCode: "A1", marks: 2, text: "What is piggybacking?" },
        { qCode: "A2", marks: 2, text: "Write use of checksum to find errors in data packet." },
        { qCode: "A8", marks: 2, text: "What are cyclic codes?" },
        { qCode: "B4", marks: 4, text: "Describe selective repeat ARQ with example." },
        { qCode: "C4", marks: 10, text: "Explain Carrier sense multiple Access protocol (CSMA). Differentiate CSMA and ALOHA." },
      ],
    },
    // ─── Unit 4: Network Layer (24 marks) ───
    {
      unitSerial: 4,
      unitName: "Network Layer — Routing, IPv4/IPv6, Congestion, Subnetting",
      totalMarks: 24,
      questions: [
        { qCode: "A5", marks: 2, text: "Differentiate virtual circuit subnets and datagram subnets." },
        { qCode: "A9", marks: 2, text: "Explain DHCP in brief." },
        { qCode: "A10", marks: 2, text: "Differentiate gateway and routers." },
        { qCode: "B1", marks: 4, text: "What is optimality principle? Explain link state routing algorithm." },
        { qCode: "B2", marks: 4, text: "Explain the concept of fragmentation. Why fragmentation is done and how?" },
        { qCode: "C2", marks: 10, text: "How congestion is controlled at network layer? Explain leaky bucket algorithm." },
      ],
    },
    // ─── Unit 5: Transport Layer (20 marks) ───
    {
      unitSerial: 5,
      unitName: "Transport Layer — TCP, UDP, QoS, Leaky/Token Bucket",
      totalMarks: 20,
      questions: [
        { qCode: "A6", marks: 2, text: "What is jitter?" },
        { qCode: "B6", marks: 4, text: "Explain the term 'Three Way Handshake' in Transport layer connection management." },
        { qCode: "B7", marks: 4, text: "What is silly window syndrome problem? Describe Clark's solution." },
        { qCode: "C3", marks: 10, text: "Explain TCP header format. Differentiate TCP and UDP." },
      ],
    },
    // ─── Unit 6: Application Layer (16 marks) ───
    {
      unitSerial: 6,
      unitName: "Application Layer — DNS, HTTP, FTP, SMTP, Security",
      totalMarks: 16,
      questions: [
        { qCode: "A4", marks: 2, text: "What is FTP?" },
        { qCode: "B5", marks: 4, text: "What is DNS? Explain its functioning." },
        { qCode: "C5", marks: 10, text: "What is POP3? Explain how it is different from SMTP." },
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
      const yearExists = existing.years.some((y) => y.year === 2023);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2023);
      }
      existing.years.push(DCCN_2023_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2023 data for DCCN");
    } else {
      await ExamAnalysis.create({
        subjectName: "Data Communication & Computer Networks",
        totalPaperMarks: 98,
        years: [DCCN_2023_YEAR],
      });
      console.log("✅ Created new DCCN subject with 2023 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Data Communication & Computer Networks",
    });
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
