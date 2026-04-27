/**
 * Seed script: Microprocessor & Interfaces 2023 PYQ Analysis
 * Run: node seeds/seedMPI2023.js
 *
 * B.Tech IV Sem Main/Back Exam 2023
 * Subject: Microprocessor & Interfaces
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const MPI_2023_YEAR = {
  year: 2023,
  units: [
    // ─── Unit 2: 8085 Architecture, Bus, RAM/ROM & Memory Map (26 marks) ───
    {
      unitSerial: 2,
      unitName: "8085 Architecture, Bus, RAM/ROM & Memory Map",
      totalMarks: 26,
      questions: [
        { qCode: "A1", marks: 2, text: "What is the clock frequency and duty cycle required for 8085?" },
        { qCode: "A2", marks: 2, text: "Write the uses of ALE and HOLD pins of 8085." },
        { qCode: "A4", marks: 2, text: "What is the use of temporary registers W and Z in 8085?" },
        { qCode: "A6", marks: 2, text: "Name the different machine cycles." },
        { qCode: "B2", marks: 4, text: "Draw the bus architecture of 8085 and explain." },
        { qCode: "B4", marks: 4, text: "Draw and explain the timing diagram for memory write machine cycle." },
        { qCode: "C1", marks: 10, text: "Draw the architecture of 8085 and explain each block clearly." },
      ],
    },
    // ─── Unit 3: Instruction Set, Addressing Modes & Assembly Programming (24 marks) ───
    {
      unitSerial: 3,
      unitName: "Instruction Set, Addressing Modes & Assembly Programming",
      totalMarks: 24,
      questions: [
        { qCode: "A3", marks: 2, text: "What are the steps involved in instruction cycle?" },
        { qCode: "A7", marks: 2, text: "Which addressing mode is used in instruction STAX D?" },
        { qCode: "A10", marks: 2, text: "What is PSW in 8085?" },
        { qCode: "B1", marks: 4, text: "What are the different types of flags available in 8085? Explain in brief." },
        { qCode: "B5", marks: 4, text: "Explain various addressing modes in 8085 with suitable example." },
        { qCode: "C2", marks: 10, text: "Write a program to transfer a block of memory data starting from one memory location to another memory location in reverse order." },
      ],
    },
    // ─── Unit 4: Advanced ALP, Interrupts, 8259, Stack & Subroutines (22 marks) ───
    {
      unitSerial: 4,
      unitName: "Advanced ALP, Interrupts, 8259, Stack & Subroutines",
      totalMarks: 22,
      questions: [
        { qCode: "A5", marks: 2, text: "What happen with stack pointer after executing two PUSH instructions?" },
        { qCode: "A8", marks: 2, text: "What is the use of RET instruction?" },
        { qCode: "B6", marks: 4, text: "Write a delay subroutine using 8 bit register. What is the maximum possible delay obtainable." },
        { qCode: "B7", marks: 4, text: "Differentiate between Macro and Subroutine." },
        { qCode: "C4", marks: 10, text: "Draw the architecture of 8259 PIC and explain." },
      ],
    },
    // ─── Unit 5: 8085 Interfacing — 8255 PPI, 8254 PIT, 8279 (16 marks) ───
    {
      unitSerial: 5,
      unitName: "8085 Interfacing — 8255 PPI, 8254 PIT, 8279",
      totalMarks: 16,
      questions: [
        { qCode: "A9", marks: 2, text: "List the operating modes of 8255 PPI." },
        { qCode: "B3", marks: 4, text: "Discuss bidirectional handshaking in 8255 PPI." },
        { qCode: "C3", marks: 10, text: "Explain the use of control word for 8254 PIT." },
      ],
    },
    // ─── Unit 6: MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488 (10 marks) ───
    {
      unitSerial: 6,
      unitName: "MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488",
      totalMarks: 10,
      questions: [
        { qCode: "C5", marks: 10, text: "Write technical note on RS422A and IEEE488." },
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
      const yearExists = existing.years.some((y) => y.year === 2023);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2023);
      }
      existing.years.push(MPI_2023_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2023 data for Microprocessor & Interfaces");
    } else {
      await ExamAnalysis.create({
        subjectName: "Microprocessor & Interfaces",
        totalPaperMarks: 98,
        years: [MPI_2023_YEAR],
      });
      console.log("✅ Created new Microprocessor & Interfaces subject with 2023 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Microprocessor & Interfaces",
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
