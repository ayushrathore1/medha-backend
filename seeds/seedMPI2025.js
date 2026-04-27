/**
 * Seed script: Microprocessor & Interfaces 2025 PYQ Analysis
 * Run: node seeds/seedMPI2025.js
 *
 * B.Tech IV Sem Main/Back Exam 2025
 * Subject: Microprocessor & Interfaces
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const MPI_2025_YEAR = {
  year: 2025,
  units: [
    // ─── Unit 2: 8085 Architecture, Bus, RAM/ROM & Memory Map (32 marks) ───
    {
      unitSerial: 2,
      unitName: "8085 Architecture, Bus, RAM/ROM & Memory Map",
      totalMarks: 32,
      questions: [
        { qCode: "A1", marks: 2, text: "Discuss the concept of static RAM." },
        { qCode: "A2", marks: 2, text: "Differentiate between microprocessor and microcontroller." },
        { qCode: "A5", marks: 2, text: "Explain the purpose of READY and HOLD pins of 8085 MP." },
        { qCode: "A7", marks: 2, text: "What is WZ pair in 8085 microprocessor?" },
        { qCode: "B1", marks: 4, text: "Discuss the concept of multiplexing and de-multiplexing of buses in 8085 MP." },
        { qCode: "C1", marks: 10, text: "Draw the architecture of 8085 microprocessor and discuss each part of it." },
        { qCode: "C3", marks: 10, text: "Draw the timing diagram of memory read machine cycle." },
      ],
    },
    // ─── Unit 3: Instruction Set, Addressing Modes & Assembly Programming (24 marks) ───
    {
      unitSerial: 3,
      unitName: "Instruction Set, Addressing Modes & Assembly Programming",
      totalMarks: 24,
      questions: [
        { qCode: "A4", marks: 2, text: "Define instruction cycle." },
        { qCode: "A6", marks: 2, text: "Draw the flag register of 8085 and explain." },
        { qCode: "A8", marks: 2, text: "Discuss XTHL instruction of 8085 microprocessor." },
        { qCode: "B2", marks: 4, text: "What are the different addressing modes in 8085 MP? Discuss each with suitable example." },
        { qCode: "B7", marks: 4, text: "Write an assembly language program to add two 8-bit number." },
        { qCode: "C5", marks: 10, text: "Write an assembly language program to find the square of a number." },
      ],
    },
    // ─── Unit 4: Advanced ALP, Interrupts, 8259, Stack & Subroutines (22 marks) ───
    {
      unitSerial: 4,
      unitName: "Advanced ALP, Interrupts, 8259, Stack & Subroutines",
      totalMarks: 22,
      questions: [
        { qCode: "A3", marks: 2, text: "What do you mean by stack pointer?" },
        { qCode: "A9", marks: 2, text: "What are the methods of passing parameters to subroutines?" },
        { qCode: "B3", marks: 4, text: "Calculate the total delay produced by using an 8-bit register." },
        { qCode: "B6", marks: 4, text: "Discuss the different operating modes used in 8259." },
        { qCode: "C2", marks: 10, text: "What are the vectored interrupts? How the address of the interrupt service routine calculated in vectored interrupts? Explain with an example." },
      ],
    },
    // ─── Unit 5: 8085 Interfacing — 8255 PPI, 8254 PIT, 8279 (6 marks) ───
    {
      unitSerial: 5,
      unitName: "8085 Interfacing — 8255 PPI, 8254 PIT, 8279",
      totalMarks: 6,
      questions: [
        { qCode: "A10", marks: 2, text: "What is BSR command of 8255 PPI?" },
        { qCode: "B5", marks: 4, text: "Discuss the control word register command for 8254 PIT." },
      ],
    },
    // ─── Unit 6: MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488 (14 marks) ───
    {
      unitSerial: 6,
      unitName: "MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488",
      totalMarks: 14,
      questions: [
        { qCode: "B4", marks: 4, text: "Discuss the concept of RS232C and RS422A." },
        { qCode: "C4", marks: 10, text: "Write the technical note on following – (i) IEEE 488 (ii) Liquid crystal display" },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({
      subjectName: "Microprocessor & Interfaces",
    });

    if (existing) {
      const yearExists = existing.years.some((y) => y.year === 2025);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2025);
      }
      existing.years.push(MPI_2025_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2025 data for Microprocessor & Interfaces");
    } else {
      await ExamAnalysis.create({
        subjectName: "Microprocessor & Interfaces",
        totalPaperMarks: 98,
        years: [MPI_2025_YEAR],
      });
      console.log("✅ Created new Microprocessor & Interfaces subject with 2025 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Microprocessor & Interfaces",
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
