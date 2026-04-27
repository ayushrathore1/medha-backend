/**
 * Seed script: Data Communication & Computer Networks 2025 PYQ Analysis
 * Run: node seeds/seedDCCN2025.js
 *
 * B.Tech IV Sem Main/Back Exam 2025
 * Paper: 4E1307 | Subject: DCCN (4AID4-07)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DCCN_2025_YEAR = {
  year: 2025,
  units: [
    // ─── Unit 2: Physical Layer (18 marks) ───
    {
      unitSerial: 2,
      unitName: "Physical Layer — OSI/TCP, Signals, Line Coding, Modulation",
      totalMarks: 18,
      questions: [
        { qCode: "A1", marks: 2, text: "Name any three common network topologies." },
        { qCode: "A2", marks: 2, text: "What is the purpose of communication protocols in a computer network?" },
        { qCode: "A3", marks: 2, text: "Which layers of the OSI model are combined into a single layer in the TCP/IP model?" },
        { qCode: "A4", marks: 2, text: "What is line coding, and why is it important in digital communication?" },
        { qCode: "A5", marks: 2, text: "What are the three main factors that affect the performance of a communication system?" },
        { qCode: "B1", marks: 4, text: "Explain the concept of data rate limitations in signal transmission and one factor that influences it." },
        { qCode: "B2", marks: 4, text: "Define modulation and mention one advantage of using digital modulation techniques." },
      ],
    },
    // ─── Unit 3: Data Link Layer (32 marks) ───
    {
      unitSerial: 3,
      unitName: "Data Link Layer — Error Control, ARQ, ALOHA, CSMA",
      totalMarks: 32,
      questions: [
        { qCode: "A8", marks: 2, text: "What is Forward Error Correction (FEC), and how is it different from error detection methods?" },
        { qCode: "A10", marks: 2, text: "What is the Stop-and-Wait ARQ protocol?" },
        { qCode: "B3", marks: 4, text: "What are the two main types of errors in data transmission? Provide a brief explanation of each." },
        { qCode: "B4", marks: 4, text: "What is the main difference between CSMA/CD and CSMA/CA in managing data collisions?" },
        { qCode: "C3", marks: 10, text: "In a sliding window protocol with a window size of 4, if frames 0, 1, 2, and 3 are sent and frame 1 is lost: (a) How does the Go-Back-N protocol handle the error? (b) How does the Selective Repeat protocol handle the error?" },
        { qCode: "C5", marks: 10, text: "A network using Slotted ALOHA has a frame generation rate of 200 frames/second. If the time slot duration is 5 ms, calculate probability of successful transmission using the formula: P=Ge^-G. Where G is the average number of frames generated per time slot?" },
      ],
    },
    // ─── Unit 4: Network Layer (28 marks) ───
    {
      unitSerial: 4,
      unitName: "Network Layer — Routing, IPv4/IPv6, Congestion, Subnetting",
      totalMarks: 28,
      questions: [
        { qCode: "A6", marks: 2, text: "Differentiate between IPv4 and IPv6 addressing. Mention one advantage of IPv6." },
        { qCode: "A9", marks: 2, text: "What is congestion control, and why is it important in the network layer?" },
        { qCode: "B5", marks: 4, text: "Explain the difference between unicast, multicast, and broadcast communication." },
        { qCode: "C1", marks: 10, text: "Given the following IPv4 subnet mask (255.255.255.192): (a) How many subnets and hosts per subnet can be created? (b) Identify the network address and broadcast address for the IP 192.168.10.65/26." },
        { qCode: "C2", marks: 10, text: "A network experiences packet loss due to congestion. Suggest and explain two congestion control techniques the network layer can implement to mitigate this issue." },
      ],
    },
    // ─── Unit 5: Transport Layer (6 marks) ───
    {
      unitSerial: 5,
      unitName: "Transport Layer — TCP, UDP, QoS, Leaky/Token Bucket",
      totalMarks: 6,
      questions: [
        { qCode: "A7", marks: 2, text: "What is Quality of Service (QoS)?" },
        { qCode: "B6", marks: 4, text: "Briefly describe the leaky bucket and token bucket algorithms and their role in traffic management." },
      ],
    },
    // ─── Unit 6: Application Layer (14 marks) ───
    {
      unitSerial: 6,
      unitName: "Application Layer — DNS, HTTP, FTP, SMTP, Security",
      totalMarks: 14,
      questions: [
        { qCode: "B7", marks: 4, text: "List and briefly describe any two protocols used for email transmission." },
        { qCode: "C4", marks: 10, text: "A user reports that they cannot reach a website using its domain name, but accessing it via its IP address works fine. Diagnose and explain the most likely cause of the issue and propose a troubleshooting method." },
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
      const yearExists = existing.years.some((y) => y.year === 2025);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2025);
      }
      existing.years.push(DCCN_2025_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2025 data for DCCN");
    } else {
      await ExamAnalysis.create({
        subjectName: "Data Communication & Computer Networks",
        totalPaperMarks: 98,
        years: [DCCN_2025_YEAR],
      });
      console.log("✅ Created new DCCN subject with 2025 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Data Communication & Computer Networks",
    });
    console.log(`\n📊 Verification:`);
    console.log(`   Subject: ${result.subjectName}`);
    console.log(`   Available years: ${result.years.map((y) => y.year).sort().join(", ")}`);
    const yearData = result.years.find((y) => y.year === 2025);
    yearData.units.forEach((u) => {
      console.log(`     Unit ${u.unitSerial}: ${u.unitName} — ${u.totalMarks} marks (${u.questions.length} questions)`);
    });
    const total = yearData.units.reduce((s, u) => s + u.totalMarks, 0);
    console.log(`   Total marks (2025): ${total}`);

    await mongoose.disconnect();
    console.log("\n✅ Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
