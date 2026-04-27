/**
 * Seed script: Database Management System 2025 PYQ Analysis
 * Run: node seeds/seedDBMS2025.js
 *
 * B.Tech IV Sem Main/Back Exam 2025
 * Subject: Database Management System
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DBMS_2025_YEAR = {
  year: 2025,
  units: [
    // ─── Unit 2: Introduction to DBMS & ER Model (28 marks) ───
    {
      unitSerial: 2,
      unitName: "Introduction to DBMS & ER Model",
      totalMarks: 28,
      questions: [
        { qCode: "A1", marks: 2, text: "Why is a DBMS preferred over a traditional file system?" },
        { qCode: "A2", marks: 2, text: "What is the difference between a weak entity and a strong entity?" },
        { qCode: "A5", marks: 2, text: "Explain the concepts of Primary Key." },
        { qCode: "A7", marks: 2, text: "Draw a neat diagram of database system architecture." },
        { qCode: "A8", marks: 2, text: "What is Entity? Explain with example." },
        { qCode: "B1", marks: 4, text: "Explain binary, ternary and weak entity relationship with examples." },
        { qCode: "B2", marks: 4, text: "Define the following with example – (a) Aggregation in E-R model (b) Data Integrity" },
        { qCode: "C1", marks: 10, text: "Explain Entity Relationship model. Draw E-R diagram for university management system with complete labelling." },
      ],
    },
    // ─── Unit 3: Relational Algebra, Calculus, SQL & Triggers (20 marks) ───
    {
      unitSerial: 3,
      unitName: "Relational Algebra, Calculus, SQL & Triggers",
      totalMarks: 20,
      questions: [
        { qCode: "A3", marks: 2, text: "Name any two operations of relational algebra with example." },
        { qCode: "A4", marks: 2, text: "What is ODBC? How does it differ from JDBC?" },
        { qCode: "A10", marks: 2, text: "Explain role of Triggers in SQL programming." },
        { qCode: "B4", marks: 4, text: "Describe relationship algebra selection and projection with example." },
        { qCode: "C4", marks: 10, text: "Create a table called Employee that contain attributes (EMPNO, ENAME, JOB, MGR, SAL) execute the following – (1) Add a column commission with domain to the Employee table. (2) Insert any five records into the table. (3) Update the column details of job. (4) Rename the column of Employee table using alter command. (5) Delete the employee whose Empno. is 105." },
      ],
    },
    // ─── Unit 4: Schema Refinement & Normal Forms (14 marks) ───
    {
      unitSerial: 4,
      unitName: "Schema Refinement & Normal Forms",
      totalMarks: 14,
      questions: [
        { qCode: "B3", marks: 4, text: "What is Boyce-Codd Normal Forms & 3-NF in detail?" },
        { qCode: "C2", marks: 10, text: "What are functional dependencies? Give a relation R (A, B, C, D) with dependencies {A→B, B→C, C→D}, decompose it into BCNF and explain the process." },
      ],
    },
    // ─── Unit 5: Transaction Processing (6 marks) ───
    {
      unitSerial: 5,
      unitName: "Transaction Processing",
      totalMarks: 6,
      questions: [
        { qCode: "A9", marks: 2, text: "What is the need of Serializability in transaction processing?" },
        { qCode: "B6", marks: 4, text: "What is transaction? Explain its ACID properties?" },
      ],
    },
    // ─── Unit 6: Concurrency Control & Database Recovery (30 marks) ───
    {
      unitSerial: 6,
      unitName: "Concurrency Control & Database Recovery",
      totalMarks: 30,
      questions: [
        { qCode: "A6", marks: 2, text: "What is Concurrency?" },
        { qCode: "B5", marks: 4, text: "What is shadow paging? Explain in detail." },
        { qCode: "B7", marks: 4, text: "Compare lock-based and timestamp-based concurrency control." },
        { qCode: "C3", marks: 10, text: "Explain different types of concurrency control technique. Compare their advantages and disadvantages." },
        { qCode: "C5", marks: 10, text: "Explain the recovery schemes in database. Also explain deadlock handling." },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({
      subjectName: "Database Management System",
    });

    if (existing) {
      const yearExists = existing.years.some((y) => y.year === 2025);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2025);
      }
      existing.years.push(DBMS_2025_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2025 data for Database Management System");
    } else {
      await ExamAnalysis.create({
        subjectName: "Database Management System",
        totalPaperMarks: 98,
        years: [DBMS_2025_YEAR],
      });
      console.log("✅ Created new Database Management System subject with 2025 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Database Management System",
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
