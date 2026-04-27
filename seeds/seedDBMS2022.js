/**
 * Seed script: Database Management System 2022 PYQ Analysis
 * Run: node seeds/seedDBMS2022.js
 *
 * B.Tech IV Sem Main Exam 2022
 * Subject: DBMS
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DBMS_2022_YEAR = {
  year: 2022,
  units: [
    // ─── Unit 2: Introduction to DBMS & ER Model (26 marks) ───
    {
      unitSerial: 2,
      unitName: "Introduction to DBMS & ER Model",
      totalMarks: 26,
      questions: [
        { qCode: "A1", marks: 2, text: "Which data independence is difficult to achieve and why? (a) Physical data independence (b) Logical data independence" },
        { qCode: "A5", marks: 2, text: "What are the properties of a weak entity? How the primary key of weak entity is defined when it is converted to a relation in relational model?" },
        { qCode: "A6", marks: 2, text: "What is the upper limit on number of primary keys and candidate keys for any relation in relational model?" },
        { qCode: "A9", marks: 2, text: "Draw a neat diagram of database system architecture." },
        { qCode: "B5", marks: 4, text: "Define briefly with example – (a) Data Integrity (b) Aggregation in E-R model (c) Tuple relational calculus (d) Cascadeless schedules" },
        { qCode: "B6", marks: 4, text: "Explain ternary relationship with example. Can we represent every ternary relationship with multiple binary relation?" },
        { qCode: "C4", marks: 10, text: "Draw the E-R diagram for University management system with complete labeling. Convert the drawn E-R diagram into relational model. For each relation in relational model, clearly specify primary key and foreign keys." },
      ],
    },
    // ─── Unit 3: Relational Algebra, Calculus, SQL & Triggers (28 marks) ───
    {
      unitSerial: 3,
      unitName: "Relational Algebra, Calculus, SQL & Triggers",
      totalMarks: 28,
      questions: [
        { qCode: "A4", marks: 2, text: "Which out of these are Data Manipulation Language (DML) commands and why? Create, Update, Alter, Delete, Drop, Insert." },
        { qCode: "A7", marks: 2, text: "How does aggregate operators of SQL treat NULL values? Explain with example." },
        { qCode: "A8", marks: 2, text: "Difference between Join and Cartesian product. Explain with an example." },
        { qCode: "B1", marks: 4, text: "Explain the role and importance of relational algebra. Also, explain six basic operators of relational algebra with example." },
        { qCode: "B4", marks: 4, text: "Consider two relation customers and orders with values as follows. What will be the result of natural join, left outer join, right outer join, and full outer join." },
        { qCode: "B7", marks: 4, text: "Differentiate Dynamic and Embedded SQL. Give example of Dynamic SQL." },
        { qCode: "C5", marks: 10, text: "Consider the following three relations with attributes shown in brackets for an organization. employee (eno, ename, esalary, dcode), dept (dcode, dname), dependent (depndtname, eno, relation). Write SQL queries for the following – (a) to (j) [10 SQL queries]" },
      ],
    },
    // ─── Unit 4: Schema Refinement & Normal Forms (14 marks) ───
    {
      unitSerial: 4,
      unitName: "Schema Refinement & Normal Forms",
      totalMarks: 14,
      questions: [
        { qCode: "B2", marks: 4, text: "Consider a relation R (ABCDEF) where, A, B, C, D, E are the attributes of R. Consider functional dependency set F = {A->EC, C->D, B->F}. Find out candidate key(s) and check the highest normal form." },
        { qCode: "C3", marks: 10, text: "What is the role of normalization in database design? Explain first normal form, second normal form, third normal form and BCNF with example of each?" },
      ],
    },
    // ─── Unit 5: Transaction Processing (8 marks) ───
    {
      unitSerial: 5,
      unitName: "Transaction Processing",
      totalMarks: 8,
      questions: [
        { qCode: "A2", marks: 2, text: "Consider the following schedule for three transactions T1, T2, T3, where R indicates a read of a Data item, W indicates a write of a data item and COM indicates a commit. (a) Draw the dependency graph for this schedule. (b) Whether the schedule is conflict serializable?" },
        { qCode: "A10", marks: 2, text: "Draw a labeled transaction state diagram." },
        { qCode: "B3", marks: 4, text: "Differentiate View and Conflict Serializability with an example." },
      ],
    },
    // ─── Unit 6: Concurrency Control & Database Recovery (22 marks) ───
    {
      unitSerial: 6,
      unitName: "Concurrency Control & Database Recovery",
      totalMarks: 22,
      questions: [
        { qCode: "A3", marks: 2, text: "What is the difference between strict two phase locking and simple two phase locking protocols?" },
        { qCode: "C1", marks: 10, text: "Write the algorithm for basic time stamp ordering protocol. For the below schedule S with transactions T1, T2, T3, whether the timestamp order T1, T2, T3 will successfully execute this schedule using basic time stamp protocol? S: r1(A), r2(B), w1(C), r3(B), r3(C), w2(B), w3(A)" },
        { qCode: "C2", marks: 10, text: "Explain shadow paging recovery protocol along with its pros and cons. How does this differ from log based recovery scheme?" },
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
      const yearExists = existing.years.some((y) => y.year === 2022);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2022);
      }
      existing.years.push(DBMS_2022_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2022 data for Database Management System");
    } else {
      await ExamAnalysis.create({
        subjectName: "Database Management System",
        totalPaperMarks: 98,
        years: [DBMS_2022_YEAR],
      });
      console.log("✅ Created new Database Management System subject with 2022 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Database Management System",
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
