/**
 * Seed script: Data Communication & Computer Networks 2024 PYQ Analysis
 * Run: node seeds/seedDCCN2024.js
 *
 * B.Tech IV Sem Main/Back Exam 2024
 * Paper: 4E1307 | Subject: DCCN (4AID4-07)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DCCN_2024_YEAR = {
  year: 2024,
  units: [
    // ─── Unit 2: Physical Layer (10 marks) ───
    {
      unitSerial: 2,
      unitName: "Physical Layer — OSI/TCP, Signals, Line Coding, Modulation",
      totalMarks: 10,
      questions: [
        { qCode: "A1", marks: 2, text: "What is the use of RJ-45 connector?" },
        { qCode: "A2", marks: 2, text: "What are the differences between star and ring topology?" },
        { qCode: "A3", marks: 2, text: "Define the Data Rate." },
        { qCode: "B1", marks: 4, text: "What is the need of Line Encoding? Draw the wave diagrams of the binary sequence 01110110 for following Line Encoding: (a) NRZ-L (b) NRZ-I (c) Polar RZ (d) Manchester (e) Differential Manchester" },
      ],
    },
    // ─── Unit 3: Data Link Layer (20 marks) ───
    {
      unitSerial: 3,
      unitName: "Data Link Layer — Error Control, ARQ, ALOHA, CSMA",
      totalMarks: 20,
      questions: [
        { qCode: "A5", marks: 2, text: "What is Piggy backing?" },
        { qCode: "B2", marks: 4, text: "Explain the Checksum. Suppose that a message 1001 1100 1010 0011 is transmitted using Internet Checksum (4-bit word). What is the value of the checksum?" },
        { qCode: "B3", marks: 4, text: "Consider the delay of pure ALOHA versus slotted ALOHA at low load. Which one is less? Explain your answer." },
        { qCode: "C2", marks: 10, text: "A 20 Kbps satellite link has a propagation delay of 400 msec, the transmitter employs the 'Go back N ARQ' scheme with N set to 10. Assuming that each frame is 100 bytes long, what is the maximum data rate possible?" },
      ],
    },
    // ─── Unit 4: Network Layer (16 marks) ───
    {
      unitSerial: 4,
      unitName: "Network Layer — Routing, IPv4/IPv6, Congestion, Subnetting",
      totalMarks: 16,
      questions: [
        { qCode: "A6", marks: 2, text: "List the four functions of the Network Layer." },
        { qCode: "B4", marks: 4, text: "Explain the working of Routing Information Protocol (RIP). Why do you think RIP uses UDP instead of TCP?" },
        { qCode: "C3", marks: 10, text: "Compare and contrast the IPv4 header with the IPv6 header. Create a table to compare each field." },
      ],
    },
    // ─── Unit 5: Transport Layer (36 marks) ───
    {
      unitSerial: 5,
      unitName: "Transport Layer — TCP, UDP, QoS, Leaky/Token Bucket",
      totalMarks: 36,
      questions: [
        { qCode: "A4", marks: 2, text: "How we detect the error in packet at the transport layer?" },
        { qCode: "A7", marks: 2, text: "What do you mean by Quality of Services?" },
        { qCode: "A8", marks: 2, text: "Define the segmentation at the transport layer." },
        { qCode: "A9", marks: 2, text: "What is port number?" },
        { qCode: "B5", marks: 4, text: "Why does the maximum packet lifetime, T, have to be large enough to ensure that not only the packet but also its acknowledgments have vanished?" },
        { qCode: "B6", marks: 4, text: "In a TCP connection, the initial sequence number at the client site is 2171. The client opens the connection sends three segments, the second of which carries 1000 bytes of data, and closes the connection. What is the value of the sequence number in each of the following segments sent by the client? (a) The SYN segment (b) The data segment (c) The FIN segment" },
        { qCode: "C1", marks: 10, text: "Assume that an application-layer protocol is written to use the services of UDP. Can the application-layer protocol uses the services TCP without change?" },
        { qCode: "C4", marks: 10, text: "A computer on a 6-Mbps network is regulated by a token bucket. The token bucket is filled at a rate of 1 Mbps. It is initially filled to capacity with 8 megabits. How long can the computer transmit at the full 6 Mbps?" },
      ],
    },
    // ─── Unit 6: Application Layer (16 marks) ───
    {
      unitSerial: 6,
      unitName: "Application Layer — DNS, HTTP, FTP, SMTP, Security",
      totalMarks: 16,
      questions: [
        { qCode: "A10", marks: 2, text: "SMTP is a push protocol. Justify the statement." },
        { qCode: "B7", marks: 4, text: "FTP uses two separate well-known port numbers for control and data connection. Does this mean that two separate TCP connections are created for exchanging control information and data?" },
        { qCode: "C5", marks: 10, text: "Explain the request and response message format of the HTTP protocol." },
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
      const yearExists = existing.years.some((y) => y.year === 2024);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2024);
      }
      existing.years.push(DCCN_2024_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2024 data for DCCN");
    } else {
      await ExamAnalysis.create({
        subjectName: "Data Communication & Computer Networks",
        totalPaperMarks: 98,
        years: [DCCN_2024_YEAR],
      });
      console.log("✅ Created new DCCN subject with 2024 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Data Communication & Computer Networks",
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
