/**
 * Seed script: Database Management System 2023 PYQ Analysis
 * Run: node seeds/seedDBMS2023.js
 *
 * B.Tech IV Sem Main Exam July 2023
 * Paper: 4E1305 | Subject: DBMS (4CAI4-05)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DBMS_2023_YEAR = {
  year: 2023,
  units: [
    // ─── Unit 2: Introduction to DBMS & ER Model (24 marks) ───
    {
      unitSerial: 2,
      unitName: "Introduction to DBMS & ER Model",
      totalMarks: 24,
      questions: [
        { qCode: "A1", marks: 2, text: "Write any four differences between file system and DBMS." },
        { qCode: "A5", marks: 2, text: "How does weak entity differ from strong entity in ER model?" },
        { qCode: "A6", marks: 2, text: "Explain various levels of data abstractions in DBMS." },
        { qCode: "A8", marks: 2, text: "Explain Aggregation with example." },
        { qCode: "A9", marks: 2, text: "Differentiate Generalization and Specialization." },
        { qCode: "B7", marks: 4, text: "Explain following keys with example – a. Primary key b. Candidate key. c. Super key d. Foreign key." },
        { qCode: "C1", marks: 10, text: "How does various E-R model constructs relate to relation model construct. Draw the detailed E-R model for library management system and then convert this ER model to relational model by mapping various constructs." },
      ],
    },
    // ─── Unit 3: Relational Algebra, Calculus, SQL & Triggers (28 marks) ───
    {
      unitSerial: 3,
      unitName: "Relational Algebra, Calculus, SQL & Triggers",
      totalMarks: 28,
      questions: [
        { qCode: "A3", marks: 2, text: "What is ODBC? How does it differ from JDBC?" },
        { qCode: "A7", marks: 2, text: "How does correlated nested queries differ from simple nested queries. Explain with example." },
        { qCode: "A10", marks: 2, text: "In which applications, Embedded and Dynamic SQL are required?" },
        { qCode: "B1", marks: 4, text: "Explain following joins with help of example – i. Theta join. ii. Equi Join. iii. Natural join. iv. Outer join." },
        { qCode: "B2", marks: 4, text: "How does triggers are useful in DBMS? Write a trigger in SQL to confirm value inserted in age field of a table is not less than 18 before inserting value." },
        { qCode: "B3", marks: 4, text: "Explain the role and importance of relational algebra. Also explain six basic operators of relational algebra with example." },
        { qCode: "C2", marks: 10, text: "Consider the relations defined below: DOCTOR (regno, name, telno, city, specialization). PATIENT (pname, street, city). VISIT (pname, regno, data_of_visit, fee). Express following queries in SQL – a. Get the name and regno of doctors who live in Kota. b. Find the name and city of patient(s) who visited a doctor on date 12-Aug-2022. c. Find out all doctors whose name start with letter 'n'. d. Find doctors whose specialization in 'NEURO'. e. Find out total number of patients visited by each doctor. f. Print patient name and doctor name to whom he has visited for treatment. g. Find out name of doctors who have not visited any patient yet." },
      ],
    },
    // ─── Unit 4: Schema Refinement & Normal Forms (16 marks) ───
    {
      unitSerial: 4,
      unitName: "Schema Refinement & Normal Forms",
      totalMarks: 16,
      questions: [
        { qCode: "A4", marks: 2, text: "Consider a relation R(A,B,C,D,E) with A,B,C,D,E as attributes and functional dependency set F = {AB → C, C → D, B → E}. Find out the candidate key." },
        { qCode: "B4", marks: 4, text: "Explain all six inference rules for functional dependency with example." },
        { qCode: "C4", marks: 10, text: "What is normalization? Explain all types of normal forms with example?" },
      ],
    },
    // ─── Unit 5: Transaction Processing (10 marks) ───
    {
      unitSerial: 5,
      unitName: "Transaction Processing",
      totalMarks: 10,
      questions: [
        { qCode: "A2", marks: 2, text: "Draw state diagram of transaction." },
        { qCode: "B5", marks: 4, text: "Consider the following schedule of three transactions T1, T2, T3 where X and Y are data items. Using precedence graph, find out whether the schedule is conflict serializable or not?" },
        { qCode: "B6", marks: 4, text: "Explain irrecoverable and recoverable schedules with example." },
      ],
    },
    // ─── Unit 6: Concurrency Control & Database Recovery (20 marks) ───
    {
      unitSerial: 6,
      unitName: "Concurrency Control & Database Recovery",
      totalMarks: 20,
      questions: [
        { qCode: "C3", marks: 10, text: "Explain Shadow paging and log based recovery techniques with advantages and disadvantages of each." },
        { qCode: "C5", marks: 10, text: "Write short note on following concurrency control schemes: a. Lock-based protocol. b. Timestamp based protocol." },
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
      const yearExists = existing.years.some((y) => y.year === 2023);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2023);
      }
      existing.years.push(DBMS_2023_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2023 data for Database Management System");
    } else {
      await ExamAnalysis.create({
        subjectName: "Database Management System",
        totalPaperMarks: 98,
        years: [DBMS_2023_YEAR],
      });
      console.log("✅ Created new Database Management System subject with 2023 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Database Management System",
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
