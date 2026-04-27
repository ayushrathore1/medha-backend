/**
 * Seed script: Microprocessor & Interfaces 2024 PYQ Analysis
 * Run: node seeds/seedMPI2024.js
 *
 * B.Tech IV Sem Main/Back Exam 2024
 * Paper: 4E1304 | Subject: Microprocessor & Interfaces (4CAI3-04)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const MPI_2024_YEAR = {
  year: 2024,
  units: [
    // ─── Unit 2: 8085 Architecture, Bus, RAM/ROM & Memory Map (24 marks) ───
    {
      unitSerial: 2,
      unitName: "8085 Architecture, Bus, RAM/ROM & Memory Map",
      totalMarks: 24,
      questions: [
        { qCode: "A1", marks: 2, text: "Specify the size of data, address, memory word and memory capacity of 8085 microprocessor." },
        { qCode: "A4", marks: 2, text: "What is the use of tristate devices in bus oriented system?" },
        { qCode: "A10", marks: 2, text: "Mention the purpose of HOLD and READY pins of 8085 microprocessor." },
        { qCode: "B1", marks: 4, text: "Explain the internal architecture of 8085 microprocessor using neat diagram." },
        { qCode: "B2", marks: 4, text: "What are external initiated operations in 8085 microprocessor? Explain briefly." },
        { qCode: "C1", marks: 10, text: "Design 8085 based system with following specifications: (i) System frequency 3MHz (ii) Interface 16 kb EPROM using 8kb chip (iii) Interface 32 kb RAM using 16 kb chip" },
      ],
    },
    // ─── Unit 3: Instruction Set, Addressing Modes & Assembly Programming (16 marks) ───
    {
      unitSerial: 3,
      unitName: "Instruction Set, Addressing Modes & Assembly Programming",
      totalMarks: 16,
      questions: [
        { qCode: "A2", marks: 2, text: "Draw the flag register configuration for 8085 microprocessor." },
        { qCode: "A3", marks: 2, text: "State the difference between direct and indirect addressing." },
        { qCode: "A6", marks: 2, text: "Write a program to add 7 BH and 6 AH using ADI instruction." },
        { qCode: "A8", marks: 2, text: "State the difference between JUMP and CALL instruction." },
        { qCode: "B3", marks: 4, text: "Compare the function of following instruction pairs: (i) JMP & CALL (ii) STAX & LDAX (iii) LHLD & LXI (iv) ANA & ANI" },
        { qCode: "B6", marks: 4, text: "Write a program to do addition of two 8 bit numbers whose 16 bit result is stored at memory location 5080H." },
      ],
    },
    // ─── Unit 4: Advanced ALP, Interrupts, 8259, Stack & Subroutines (28 marks) ───
    {
      unitSerial: 4,
      unitName: "Advanced ALP, Interrupts, 8259, Stack & Subroutines",
      totalMarks: 28,
      questions: [
        { qCode: "A5", marks: 2, text: "Describe the use of RIM and SIM instruction." },
        { qCode: "A7", marks: 2, text: "What is the difference between delay and counter?" },
        { qCode: "B4", marks: 4, text: "What is the use of stack? Explain the PUSH & POP operations using suitable example." },
        { qCode: "C2", marks: 10, text: "Draw the block diagram of 8259 programmable interrupt controllers and explain its operation." },
        { qCode: "C5", marks: 10, text: "Write short notes on the following: (i) Memory interfacing (ii) IEEE 488" },
      ],
    },
    // ─── Unit 5: 8085 Interfacing — 8255 PPI, 8254 PIT, 8279 (6 marks) ───
    {
      unitSerial: 5,
      unitName: "8085 Interfacing — 8255 PPI, 8254 PIT, 8279",
      totalMarks: 6,
      questions: [
        { qCode: "A9", marks: 2, text: "What are different modes of 8255 PPI?" },
        { qCode: "B5", marks: 4, text: "Explain the control word of 8254 program interval timer using suitable diagram." },
      ],
    },
    // ─── Unit 6: MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488 (24 marks) ───
    {
      unitSerial: 6,
      unitName: "MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488",
      totalMarks: 24,
      questions: [
        { qCode: "B7", marks: 4, text: "Compare RS232C and RS422A serial data standards." },
        { qCode: "C3", marks: 10, text: "How Liquid crystal display is interfaced with 8085 microprocessor? Explain it using neat diagram." },
        { qCode: "C4", marks: 10, text: "Draw the internal block diagram of 8251 USART and explain its initialization process." },
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
      const yearExists = existing.years.some((y) => y.year === 2024);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2024);
      }
      existing.years.push(MPI_2024_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2024 data for Microprocessor & Interfaces");
    } else {
      await ExamAnalysis.create({
        subjectName: "Microprocessor & Interfaces",
        totalPaperMarks: 98,
        years: [MPI_2024_YEAR],
      });
      console.log("✅ Created new Microprocessor & Interfaces subject with 2024 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Microprocessor & Interfaces",
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
