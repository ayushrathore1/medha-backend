/**
 * Seed script: Theory of Computation 2024 PYQ Analysis
 * Run: node seeds/seedTOC2024.js
 *
 * B.Tech IV Sem Main/Back Exam 2024
 * Paper: 4E1306 | Subject: Theory of Computation (4CA14-06)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const TOC_2024_YEAR = {
  year: 2024,
  units: [
    // ─── Unit 2: Finite Automata & Regular Expressions (38 marks) ───
    {
      unitSerial: 2,
      unitName: "Finite Automata & Regular Expressions",
      totalMarks: 38,
      questions: [
        { qCode: "A1", marks: 2, text: "Design a DFA which accepts strings with even number of 1's on S = {0, 1}." },
        { qCode: "A2", marks: 2, text: "Write the regular set of following regular expression: (a + b) * (aa + bb + ab + ba)*" },
        { qCode: "A3", marks: 2, text: "Is L = {a²ⁿ / n ≥ 1} regular?" },
        { qCode: "B1", marks: 4, text: "Convert the given NDFA to its equivalent DFA. [NDFA diagram with states q0, q1, q2, q3, q4 given]" },
        { qCode: "B2", marks: 4, text: "Construct the finite automation equivalent to the regular expression (0 + 1)*(00+11)(0 + 1)*." },
        { qCode: "B3", marks: 4, text: "Explain the role of Finite Automata and Regular Expression in Compiler Design." },
        { qCode: "C1", marks: 10, text: "Minimize the DFA as shown in below figure. [DFA diagram with states a,b,c,d,e,f given]" },
        { qCode: "C2", marks: 10, text: "Show that the language L = {aⁿbᵐ: n ≠ m} is not regular." },
      ],
    },
    // ─── Unit 3: Context Free Grammars (CFG) (18 marks) ───
    {
      unitSerial: 3,
      unitName: "Context Free Grammars (CFG)",
      totalMarks: 18,
      questions: [
        { qCode: "A4", marks: 2, text: "Let G = (V, Σ, R, S) be the context-free grammar, where V = {A, B, S}, Σ = {a, b}, S is the start variable, and R consists of the rules: S → aB|bA, A → a|aS|BAA, B → b|bS|ABB. Prove that ababba ∈ L(G)" },
        { qCode: "A5", marks: 2, text: "What is ambiguity? Explain with example." },
        { qCode: "B4", marks: 4, text: "Design the context free grammar for the languages L = {aⁱbⁱcᵏ | i = j + k}." },
        { qCode: "C3", marks: 10, text: "Explain the following: (a) Leftmost derivation (b) Rightmost derivation (c) Sentential forms (d) Null production" },
      ],
    },
    // ─── Unit 4: Pushdown Automata (PDA) & CFL (16 marks) ───
    {
      unitSerial: 4,
      unitName: "Pushdown Automata (PDA) & CFL",
      totalMarks: 16,
      questions: [
        { qCode: "A6", marks: 2, text: "What is the difference between Finite Automata and Pushdown Automata?" },
        { qCode: "B5", marks: 4, text: "Explain the working of Pushdown Automata with mathematical description." },
        { qCode: "C4", marks: 10, text: "Construct a PDA accepting the set of all strings over {a, b} with equal number of a's and b's." },
      ],
    },
    // ─── Unit 5: Turing Machines & Formal Languages (20 marks) ───
    {
      unitSerial: 5,
      unitName: "Turing Machines & Formal Languages",
      totalMarks: 20,
      questions: [
        { qCode: "A7", marks: 2, text: "Define the recursive and recursively enumerable languages." },
        { qCode: "A8", marks: 2, text: "Draw the diagram of Multiple Tracks Turing Machine." },
        { qCode: "A9", marks: 2, text: "Write the generic Form of the production of Context sensitive grammars." },
        { qCode: "B6", marks: 4, text: "Explain the Chomsky Classification of Languages with the help of examples." },
        { qCode: "C5", marks: 10, text: "Design a Turing machine over {1, b} which can compute a concatenation function over L = {1}. If a pair of words (w₁, w₂) is the input and output has to be w₁w₂." },
      ],
    },
    // ─── Unit 6: Tractable/Untractable & Undecidability (6 marks) ───
    {
      unitSerial: 6,
      unitName: "Tractable/Untractable & Undecidability",
      totalMarks: 6,
      questions: [
        { qCode: "A10", marks: 2, text: "What are the Tractable and Untractable Problems?" },
        { qCode: "B7", marks: 4, text: "What are the NP complete and NP hard problems? In which category Hamiltonian path problem and travelling salesman problem lies and why?" },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await ExamAnalysis.findOne({
      subjectName: "Theory Of Computation",
    });

    if (existing) {
      const yearExists = existing.years.some((y) => y.year === 2024);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2024);
      }
      existing.years.push(TOC_2024_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2024 data for Theory Of Computation");
    } else {
      await ExamAnalysis.create({
        subjectName: "Theory Of Computation",
        totalPaperMarks: 98,
        years: [TOC_2024_YEAR],
      });
      console.log("✅ Created new TOC subject with 2024 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Theory Of Computation",
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
