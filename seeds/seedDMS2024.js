/**
 * Seed script: DMS 2024 PYQ Analysis
 * Run: node seeds/seedDMS2024.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DMS_2024_YEAR = {
  year: 2024,
  units: [
    // ─── Unit 2: Set Theory, Relations & Functions (28 marks) ───
    {
      unitSerial: 2,
      unitName: "Set Theory, Relations & Functions",
      totalMarks: 28,
      questions: [
        { qCode: "A1", marks: 2, text: "Represent the symmetric difference of two sets by Venn diagram." },
        { qCode: "A2", marks: 2, text: "Define the properties of Partial Order Relation." },
        { qCode: "A3", marks: 2, text: "What is Pigeonhole Principle?" },
        { qCode: "B1", marks: 4, text: "Participation in sports is compulsory in a college. In a class of 80 students, 60 play football, 40 play basketball. Find: (i) how many play both the games (ii) how many play football only" },
        { qCode: "B2", marks: 4, text: "Let A = {1, 2, 3, 4} and consider the partition P = {{1, 2, 3}, {4}} of A. Obtain the equivalence relation R on A determined by P." },
        { qCode: "B6", marks: 4, text: "Prove that 1³ + 2³ + .... + n³ = [n(n+1)/2]², n ≥ 1 by mathematical induction." },
        { qCode: "C1", marks: 10, text: "Out of 250 failed students, 128 failed in Maths, 87 in Physics and 134 in aggregate, 31 failed in Maths and Physics, 54 failed in aggregate and in Maths, 30 failed in aggregate and in Physics. Find how many candidates failed: (i) In all three subjects (ii) In Maths not in Physics (iii) In aggregate but not in Maths (iv) In Physics but not in aggregate or Maths (v) In the aggregate or in Maths, but not in Physics" },
      ],
    },
    // ─── Unit 3: Propositional Logic & FSM (18 marks) ───
    {
      unitSerial: 3,
      unitName: "Propositional Logic & FSM",
      totalMarks: 18,
      questions: [
        { qCode: "A4", marks: 2, text: "Obtain the DNF of the proposition (p → q) ∧ (¬p ∧ q)." },
        { qCode: "A5", marks: 2, text: "Explain Quantifiers. Also write properties of quantifiers." },
        { qCode: "B3", marks: 4, text: "State the converse, inverse and contrapositive of the statement 'If today is Easter, then tomorrow is Monday'. Also construct truth table." },
        { qCode: "C2", marks: 10, text: "(a) Define tautology and prove the following: (p → q) → (¬q → ¬p) is tautology. (b) Define fallacy and prove the following: (p ∧ q) ∨ ¬(p ∧ q) is a fallacy. (c) Prove the following: (i) p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∨ r) (ii) p ↔ q ≡ (p → q) ∧ (q → p)" },
      ],
    },
    // ─── Unit 4: Posets, Combinatorics & Recurrence (18 marks) ───
    {
      unitSerial: 4,
      unitName: "Posets, Combinatorics & Recurrence",
      totalMarks: 18,
      questions: [
        { qCode: "A6", marks: 2, text: "Find the least upper bound of {2, 9} and greatest lower bound of {60, 72}, if it exists, of the poset ({2, 4, 6, 9, 12, 18, 27, 36, 48, 60, 72},|)." },
        { qCode: "A7", marks: 2, text: "What is a generating function? Give example." },
        { qCode: "B4", marks: 4, text: "Solve the recurrence relation: aₙ = 2aₙ₋₁ − aₙ₋₂, r ≥ 2, where a₀ = 1, a₁ = 2." },
        { qCode: "C3", marks: 10, text: "Use generating functions to solve the recurrence relation aₙ − 7aₙ₋₁ + 10aₙ₋₂ = 0 for r ≥ 2 where a₀ = 10 and a₁ = 41." },
      ],
    },
    // ─── Unit 5: Algebraic Structures (16 marks) ───
    {
      unitSerial: 5,
      unitName: "Algebraic Structures",
      totalMarks: 16,
      questions: [
        { qCode: "A8", marks: 2, text: "Show that the multiplicative group G = {1, −1, i, −i} is cyclic. Find its generators." },
        { qCode: "B5", marks: 4, text: "Define the following: (i) Permutation groups (ii) Normal subgroup (iii) Homomorphism group (iv) Isomorphism group" },
        { qCode: "C4", marks: 10, text: "Consider an algebraic system (G,*), where G is the set of all non-zero real numbers and * is a binary operation defined by a * b = ab/4, show that (G,*) is an abelian group." },
      ],
    },
    // ─── Unit 6: Graph Theory (18 marks) ───
    {
      unitSerial: 6,
      unitName: "Graph Theory",
      totalMarks: 18,
      questions: [
        { qCode: "A9", marks: 2, text: "State the Kurtowski's theorem." },
        { qCode: "A10", marks: 2, text: "What is the difference between path and circuit? Define Hamiltonian path and circuit." },
        { qCode: "B7", marks: 4, text: "Find the chromatic polynomial, chromatic number and number of ways of proper coloring with minimum colors of the given graph." },
        { qCode: "C5", marks: 10, text: "(a) Find the shortest path and its length between the vertices a and h in the following weighted graph. (b) Define and explain the following by suitable example: (i) Isomorphism of graphs (ii) Planar graphs" },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({
      subjectName: "Discrete Mathematics Structure",
    });

    if (existing) {
      const yearExists = existing.years.some((y) => y.year === 2024);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2024);
      }
      existing.years.push(DMS_2024_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2024 data for DMS");
    } else {
      await ExamAnalysis.create({
        subjectName: "Discrete Mathematics Structure",
        totalPaperMarks: 98,
        years: [DMS_2024_YEAR],
      });
      console.log("✅ Created new DMS subject with 2024 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Discrete Mathematics Structure",
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
