/**
 * Seed script: Theory of Computation 2025 PYQ Analysis
 * Run: node seeds/seedTOC2025.js
 *
 * B.Tech IV Sem Main/Back Exam 2025
 * Paper: 4E1306 | Subject: Theory of Computation (4AID4-06)
 * Max ETE: 70 | Total printed marks = 98
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const TOC_2025_YEAR = {
  year: 2025,
  units: [
    // ─── Unit 2: Finite Automata & Regular Expressions (40 marks) ───
    {
      unitSerial: 2,
      unitName: "Finite Automata & Regular Expressions",
      totalMarks: 40,
      questions: [
        { qCode: "A2", marks: 2, text: "Define a Finite Automata." },
        { qCode: "A3", marks: 2, text: "Write applications of Mealy and Moore machines." },
        { qCode: "A5", marks: 2, text: "Define any one closure property of regular sets." },
        { qCode: "B6", marks: 4, text: "Discuss the equivalence of DFA and NDFA." },
        { qCode: "C1", marks: 10, text: "Elaborate pumping lemma for regular language. Show that the language L = {aⁿbⁿ | n > 0} is not regular by using pumping lemma." },
        { qCode: "C2", marks: 10, text: "Deduce Myhill-Nerode theorem and prove that following language is regular: L = {w ∈ {a, b}* | w having even number of a's}." },
        { qCode: "C3", marks: 10, text: "Explain conversion of Finite automata to regular expression and vice versa. Prove that the strings recognized by the following finite automata are: (a + a(b + aa)*b)*a(b + aa)*a). Where P is the initial state and R is the final state." },
      ],
    },
    // ─── Unit 3: Context Free Grammars (CFG) (8 marks) ───
    {
      unitSerial: 3,
      unitName: "Context Free Grammars (CFG)",
      totalMarks: 8,
      questions: [
        { qCode: "A6", marks: 2, text: "Show that the grammar S → aB | ab, A → aAB | a, B → Abb | b is ambiguous." },
        { qCode: "A9", marks: 2, text: "What is the use of Null Production and Unit Production?" },
        { qCode: "B4", marks: 4, text: "Distinguish CNF and GNF with examples. Also explain problem related to them." },
      ],
    },
    // ─── Unit 4: Pushdown Automata (PDA) & CFL (4 marks) ───
    {
      unitSerial: 4,
      unitName: "Pushdown Automata (PDA) & CFL",
      totalMarks: 4,
      questions: [
        { qCode: "B3", marks: 4, text: "What is the role of CFG for PDA? Construct the PDA for language L = {aⁿb²ⁿ | n>=1}." },
      ],
    },
    // ─── Unit 5: Turing Machines & Formal Languages (30 marks) ───
    {
      unitSerial: 5,
      unitName: "Turing Machines & Formal Languages",
      totalMarks: 30,
      questions: [
        { qCode: "A1", marks: 2, text: "What are acceptors and transducer in context of Turing machine?" },
        { qCode: "A4", marks: 2, text: "What are the computable functions?" },
        { qCode: "A7", marks: 2, text: "Describe the Context-sensitive grammar (CSG)." },
        { qCode: "A10", marks: 2, text: "What is recursively enumerable language?" },
        { qCode: "B2", marks: 4, text: "Discuss Turing machine as language acceptors and transducers. Construct Turing machine for language L = {aⁿbⁿcⁿ | n >= 1}." },
        { qCode: "B5", marks: 4, text: "Explain the Chomsky classification with the suitable example of each grammar." },
        { qCode: "B7", marks: 4, text: "Construct the CSG for the language L = {aⁿbⁿcⁿ | n >= 1}." },
        { qCode: "C5", marks: 10, text: "Explain the following terms with examples – (1) Universal Turing Machine (2) Multitrack Turing Machine." },
      ],
    },
    // ─── Unit 6: Tractable/Untractable & Undecidability (16 marks) ───
    {
      unitSerial: 6,
      unitName: "Tractable/Untractable & Undecidability",
      totalMarks: 16,
      questions: [
        { qCode: "A8", marks: 2, text: "What is NP complete and NP hard problem?" },
        { qCode: "B1", marks: 4, text: "Describe the terms tractable problem, intractable problem and undecidability problem in context of computation." },
        { qCode: "C4", marks: 10, text: "Discuss the solution of travelling salesman problem with a real-world example." },
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
      const yearExists = existing.years.some((y) => y.year === 2025);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2025);
      }
      existing.years.push(TOC_2025_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2025 data for Theory Of Computation");
    } else {
      await ExamAnalysis.create({
        subjectName: "Theory Of Computation",
        totalPaperMarks: 98,
        years: [TOC_2025_YEAR],
      });
      console.log("✅ Created new TOC subject with 2025 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Theory Of Computation",
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
