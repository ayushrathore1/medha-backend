/**
 * Seed script: Database Management System 2024 PYQ Analysis
 * Run: node seeds/seedDBMS2024.js
 *
 * B.Tech IV Sem Main/Back Exam 2024
 * Subject: Database Management System
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DBMS_2024_YEAR = {
  year: 2024,
  units: [
    // ─── Unit 2: Introduction to DBMS & ER Model (32 marks) ───
    {
      unitSerial: 2,
      unitName: "Introduction to DBMS & ER Model",
      totalMarks: 32,
      questions: [
        { qCode: "A1", marks: 2, text: "How candidate key is different from super key?" },
        { qCode: "A2", marks: 2, text: "Differentiate between structured and unstructured data." },
        { qCode: "A3", marks: 2, text: "What do you mean by Attributes?" },
        { qCode: "A4", marks: 2, text: "Explain the concepts of Primary Key." },
        { qCode: "A5", marks: 2, text: "List out any three responsibilities of Database Administrator." },
        { qCode: "A6", marks: 2, text: "What is Indexing?" },
        { qCode: "A7", marks: 2, text: "What is Weak Entity set and Strong Entity set?" },
        { qCode: "A9", marks: 2, text: "Define instance and schema." },
        { qCode: "B2", marks: 4, text: "What is Data Model? Explain its types." },
        { qCode: "B3", marks: 4, text: "What is DBMS? Write difference between File System and DBMS." },
        { qCode: "B4", marks: 4, text: "Explain the Three-level Architecture of DBMS. Also mention its advantages." },
        { qCode: "B5", marks: 4, text: "Discuss the clear difference between specialization and generalization with the help of an example. Is it possible to represent their difference with the help of an E-R diagram? Explain." },
      ],
    },
    // ─── Unit 3: Relational Algebra, Calculus, SQL & Triggers (24 marks) ───
    {
      unitSerial: 3,
      unitName: "Relational Algebra, Calculus, SQL & Triggers",
      totalMarks: 24,
      questions: [
        { qCode: "A8", marks: 2, text: "Define query language." },
        { qCode: "A10", marks: 2, text: "Define null values." },
        { qCode: "C1", marks: 10, text: "(a) Consider the following database tables and answer queries using SQL: Employee (emp_no, name, skill, pay_rate), Position (posting_no, skill), Duty-allocation (posting_no, emp_no, day, shift). (i) Get employee whose rate of pay is more than or equal to the rate of pay of employee 'XYZ'. (ii) Find the employee with the lowest pay rate. (iii) Get a count of different employee on each shift. (b) What are Recoverable Schedules, and Cascadeless Schedules? Explain with suitable example." },
        { qCode: "C2", marks: 10, text: "(a) What are relational set operators? Explain with example. (b) What are the challenges in the database design?" },
      ],
    },
    // ─── Unit 4: Schema Refinement & Normal Forms (10 marks) ───
    {
      unitSerial: 4,
      unitName: "Schema Refinement & Normal Forms",
      totalMarks: 10,
      questions: [
        { qCode: "C4", marks: 10, text: "(a) Compute the Closure of the following set F of functional dependencies for relation schema: R=(A, B, C, D, E), F = {A → BC, CD → E, B → D, E → A}. (b) Write short notes on the following: (i) Multi-valued dependencies (ii) 3NF" },
      ],
    },
    // ─── Unit 5: Transaction Processing (4 marks) ───
    {
      unitSerial: 5,
      unitName: "Transaction Processing",
      totalMarks: 4,
      questions: [
        { qCode: "B1", marks: 4, text: "Define transaction. Explain various states of transaction with suitable diagram." },
      ],
    },
    // ─── Unit 6: Concurrency Control & Database Recovery (28 marks) ───
    {
      unitSerial: 6,
      unitName: "Concurrency Control & Database Recovery",
      totalMarks: 28,
      questions: [
        { qCode: "B6", marks: 4, text: "Discuss the different types of database failures that may occur in a database environment." },
        { qCode: "B7", marks: 4, text: "Differentiate between immediate update and deferred update recovery techniques." },
        { qCode: "C3", marks: 10, text: "(a) What is log based recovery? Explain immediate database modification technique for database recovery. (b) Explain the following operations in relational algebra with suitable examples: (i) Rename (ii) Natural Join (iii) Projection (iv) Grouping" },
        { qCode: "C5", marks: 10, text: "Write short notes on the following: (i) Deadlock Handling (ii) Database Recovery schemes (iii) Triggers and Active Databases (iv) Schema Refinement and Functional Dependencies" },
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
      const yearExists = existing.years.some((y) => y.year === 2024);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2024);
      }
      existing.years.push(DBMS_2024_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2024 data for Database Management System");
    } else {
      await ExamAnalysis.create({
        subjectName: "Database Management System",
        totalPaperMarks: 98,
        years: [DBMS_2024_YEAR],
      });
      console.log("✅ Created new Database Management System subject with 2024 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Database Management System",
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
