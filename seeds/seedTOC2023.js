/**
 * Seed script: Theory of Computation 2023 PYQ Analysis
 * Run: node seeds/seedTOC2023.js
 *
 * B.Tech IV Sem Main/Back Exam July 2023
 * Paper: 4E1306 | Subject: Theory of Computation (4CS4-06)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const TOC_2023_YEAR = {
  year: 2023,
  units: [
    // ─── Unit 2: Finite Automata & Regular Expressions (30 marks) ───
    {
      unitSerial: 2,
      unitName: "Finite Automata & Regular Expressions",
      totalMarks: 30,
      questions: [
        { qCode: "A1", marks: 2, text: "Give the mathematical definition of finite automaton." },
        { qCode: "A2", marks: 2, text: "Construct an NFA, with the specified number of states, that accepts the language {w : w ends with 10} with three states." },
        { qCode: "A3", marks: 2, text: "Write a regular expressions over {0,1} consisting of strings that contain exactly two 1's." },
        { qCode: "A4", marks: 2, text: "Prove (1+00*1)+(1+00*1)(0+10*1)* (0+10*1) = 0*1(0+10*1)*." },
        { qCode: "B1", marks: 4, text: "Convert the following NFA to an equivalent DFA. [NFA diagram with states 1 and 2, transitions on a and b given]" },
        { qCode: "B2", marks: 4, text: "Design a Mealy Machine that computes 2's complement of the given binary input number." },
        { qCode: "B3", marks: 4, text: "Use the pumping lemma to prove that the following languages is not regular. {aⁿbⁿ : n≥0}" },
        { qCode: "C1", marks: 10, text: "Describe in English the set accepted by the finite automaton whose transition diagram is as shown in following figure. [FA diagram with states q1, q2, q3 given]" },
      ],
    },
    // ─── Unit 3: Context Free Grammars (CFG) (16 marks) ───
    {
      unitSerial: 3,
      unitName: "Context Free Grammars (CFG)",
      totalMarks: 16,
      questions: [
        { qCode: "A5", marks: 2, text: "Explain why the grammar given below is ambiguous. S→0A|1B, A→0AA|1S|1, B→1BB|0S|0" },
        { qCode: "B4", marks: 4, text: "Let G be the grammar S->0B|1A, A->0|0S|1AA, B->1|1S|0BB. For the string 00110101, find (a) the leftmost derivation, (b) the rightmost derivation, and (c) the derivation tree." },
        { qCode: "C2", marks: 10, text: "Consider the context-free grammar G = (S, Σ, V, P), where V = {S,B}, Σ={0, 1}, S is the start variable, and P consists of the rules S→BSB|B|ε, B→00|ε. Convert this grammar to a context-free grammar in Chomsky normal form whose language is the same as that of G." },
      ],
    },
    // ─── Unit 4: Pushdown Automata (PDA) & CFL (16 marks) ───
    {
      unitSerial: 4,
      unitName: "Pushdown Automata (PDA) & CFL",
      totalMarks: 16,
      questions: [
        { qCode: "A6", marks: 2, text: "What is difference between Finite State Automaton and Pushdown Automaton?" },
        { qCode: "B5", marks: 4, text: "Design a PDA accepting {aⁿbᵐcⁿ m, n ≥ 1} by null store" },
        { qCode: "C3", marks: 10, text: "Let Σ={int, +, *, (,)} and consider the language ARITH = {w ∈ Σ* | w is a legal arithmetic expression}. Design a PDA that accepts the int + int* int, ((int + int)*(int+int))+(int) types of arithmetic expression?" },
      ],
    },
    // ─── Unit 5: Turing Machines & Formal Languages (16 marks) ───
    {
      unitSerial: 5,
      unitName: "Turing Machines & Formal Languages",
      totalMarks: 16,
      questions: [
        { qCode: "A7", marks: 2, text: "Explain the Chomsky Hierarchy in details." },
        { qCode: "B6", marks: 4, text: "Consider the TM description given M as shown in table. Draw the computation sequence of the input string 00. [TM transition table given]" },
        { qCode: "C4", marks: 10, text: "Design a Turing machine over {1,b} which can compute a concatenation function over Σ={1}. If a pair of words (w₁,w₂) is the input and the output has to be w₁w₂." },
      ],
    },
    // ─── Unit 6: Tractable/Untractable & Undecidability (20 marks) ───
    {
      unitSerial: 6,
      unitName: "Tractable/Untractable & Undecidability",
      totalMarks: 20,
      questions: [
        { qCode: "A8", marks: 2, text: "Can all computational problems solved by computer?" },
        { qCode: "A9", marks: 2, text: "What is Halting Problem?" },
        { qCode: "A10", marks: 2, text: "List the problems belonging to polynomial class." },
        { qCode: "B7", marks: 4, text: "Write a note on Tractable and Untractable Problems." },
        { qCode: "C5", marks: 10, text: "Explain the traveling salesperson problem? Why this problem is NP-complete?" },
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
      const yearExists = existing.years.some((y) => y.year === 2023);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2023);
      }
      existing.years.push(TOC_2023_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2023 data for Theory Of Computation");
    } else {
      await ExamAnalysis.create({
        subjectName: "Theory Of Computation",
        totalPaperMarks: 98,
        years: [TOC_2023_YEAR],
      });
      console.log("✅ Created new TOC subject with 2023 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Theory Of Computation",
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
