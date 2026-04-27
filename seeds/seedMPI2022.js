/**
 * Seed script: Microprocessor & Interfaces 2022 PYQ Analysis
 * Run: node seeds/seedMPI2022.js
 *
 * B.Tech IV Sem Main Exam 2022
 * Paper: 4E1304 | Subject: Microprocessor & Interfaces (4AID3-04)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const MPI_2022_YEAR = {
  year: 2022,
  units: [
    // ─── Unit 2: 8085 Architecture, Bus, RAM/ROM & Memory Map (32 marks) ───
    {
      unitSerial: 2,
      unitName: "8085 Architecture, Bus, RAM/ROM & Memory Map",
      totalMarks: 32,
      questions: [
        { qCode: "A1", marks: 2, text: "What is the function of ALE signal in 8085 µp?" },
        { qCode: "A2", marks: 2, text: "Specify the size of data, address, memory word and memory capacity of 8085 µp." },
        { qCode: "A6", marks: 2, text: "Why data bus is bidirectional?" },
        { qCode: "A7", marks: 2, text: "Mention the purpose of SID and SOD lines." },
        { qCode: "A9", marks: 2, text: "List 16 bit registers of 8085 microprocessor." },
        { qCode: "A10", marks: 2, text: "What is the purpose of Hold and Ready pins?" },
        { qCode: "C1", marks: 10, text: "Design 8085 µp based system with following specifications – (i) System frequency 3MHz (ii) Interface 16 Kb EPROM using 8 Kb chip (iii) Interface 32 Kb RAM using 16 Kb chip" },
        { qCode: "C3", marks: 10, text: "Explain the evolution of microprocessor and list the sequence of events that occurs. When 8085 µp reads data from memory." },
      ],
    },
    // ─── Unit 3: Instruction Set, Addressing Modes & Assembly Programming (22 marks) ───
    {
      unitSerial: 3,
      unitName: "Instruction Set, Addressing Modes & Assembly Programming",
      totalMarks: 22,
      questions: [
        { qCode: "A3", marks: 2, text: "State the function of following 8085 instructions – (i) JP (ii) JPE (iii) JPO (iv) JNZ" },
        { qCode: "A4", marks: 2, text: "Write a program to add 7B H and 6A H using ADI instruction." },
        { qCode: "A5", marks: 2, text: "Explain the PSW of 8085 µp." },
        { qCode: "B1", marks: 4, text: "What is the use of addressing modes? Explain different types of addressing modes with example." },
        { qCode: "B3", marks: 4, text: "Explain DAA instruction with an example." },
        { qCode: "B4", marks: 4, text: "Write a program to add the contents of memory locations of 2000 H and 2001 H and place the results in memory location 2002 H." },
        { qCode: "B5", marks: 4, text: "Compare the function of following instruction pairs – (i) JMP & CALL (ii) STAX & LDAX (iii) ANA & ANI (iv) LHLD & LXI" },
      ],
    },
    // ─── Unit 4: Advanced ALP, Interrupts, 8259, Stack & Subroutines (14 marks) ───
    {
      unitSerial: 4,
      unitName: "Advanced ALP, Interrupts, 8259, Stack & Subroutines",
      totalMarks: 14,
      questions: [
        { qCode: "A8", marks: 2, text: "What are priority interrupts?" },
        { qCode: "B2", marks: 4, text: "What are stack related operations? Compare call and push instruction." },
        { qCode: "B6", marks: 4, text: "Show which interrupt will be masked if the following instructions are executed – (i) MVI A, 10 H (ii) SIM" },
        { qCode: "B7", marks: 4, text: "Write a 8085 program that enables RST 7.5 and RST 5.5 interrupts." },
      ],
    },
    // ─── Unit 5: 8085 Interfacing — 8255 PPI, 8254 PIT, 8279 (10 marks) ───
    {
      unitSerial: 5,
      unitName: "8085 Interfacing — 8255 PPI, 8254 PIT, 8279",
      totalMarks: 10,
      questions: [
        { qCode: "C2", marks: 10, text: "Draw the block diagram of 8279 Keyboard/display interface. Explain its operation also." },
      ],
    },
    // ─── Unit 6: MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488 (20 marks) ───
    {
      unitSerial: 6,
      unitName: "MP Applications — LCD, 8251 USART, RS232C, RS422A, IEEE 488",
      totalMarks: 20,
      questions: [
        { qCode: "C4", marks: 10, text: "Draw the internal block diagram of 8251 USART and explain its initialization process." },
        { qCode: "C5", marks: 10, text: "Compare RS-422A and RS-423A serial data standard." },
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
      const yearExists = existing.years.some((y) => y.year === 2022);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2022);
      }
      existing.years.push(MPI_2022_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2022 data for Microprocessor & Interfaces");
    } else {
      await ExamAnalysis.create({
        subjectName: "Microprocessor & Interfaces",
        totalPaperMarks: 98,
        years: [MPI_2022_YEAR],
      });
      console.log("✅ Created new Microprocessor & Interfaces subject with 2022 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Microprocessor & Interfaces",
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
