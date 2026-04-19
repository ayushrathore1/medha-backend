/**
 * Seed script: DMS 2022 PYQ Analysis
 * Run: node seeds/seedDMS2022.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DMS_2022_YEAR = {
  year: 2022,
  units: [
    // ─── Unit 2: Set Theory, Relations & Functions (26 marks) ───
    {
      unitSerial: 2,
      unitName: "Set Theory, Relations & Functions",
      totalMarks: 26,
      questions: [
        { qCode: "A1", marks: 2, text: "If A = {4, 1, 8}, then find the power set of A." },
        { qCode: "A2", marks: 2, text: "For a relation R on a set A = {1, 2, 3, 4} given by R = {(1, 3), (1, 2), (2, 2), (3, 4)}, then find reflexive and transitive closure of R on the given set." },
        { qCode: "A3", marks: 2, text: "What is the domain of the function f(x) = x/(x² + 3x + 2)?" },
        { qCode: "A4", marks: 2, text: "If f(x) = eˣ and g(x) = x³, then find the composition f ∘ g." },
        { qCode: "B1", marks: 4, text: "If in a city 60% of the residents can speak German and 50% can speak French. What percentage of residents can speak both the language. If 20% residents cannot speak any of these two languages?" },
        { qCode: "B2", marks: 4, text: "Let Q be the set of rational numbers. Show that the function f:Q→Q defined by f(x) = 2x+7, x∈Q is a bijective function. Also find f⁻¹(0) and f⁻¹(2)." },
        { qCode: "C1", marks: 10, text: "Let U be the set of positive integer not exceeding 1000, that is |U|=1000. Then using the pigeonhole principle find |S|, where S is the set of such integer which is not divisible by 3, 5 or 7?" },
      ],
    },
    // ─── Unit 3: Propositional Logic & FSM (22 marks) ───
    {
      unitSerial: 3,
      unitName: "Propositional Logic & FSM",
      totalMarks: 22,
      questions: [
        { qCode: "A5", marks: 2, text: "Find the negation of the following statement – ¬('He is rich and unhappy.')" },
        { qCode: "A6", marks: 2, text: "What is a finite state machine?" },
        { qCode: "B3", marks: 4, text: "Prove the following logical implication with constructing truth table – (¬P∨Q)∧(P∨R)∧(¬Q∨R) ⇒ R" },
        { qCode: "B4", marks: 4, text: "Design a deterministic FSA that accepts strings of 0s and 1s as input for which the number of 1s is divisible by 3." },
        { qCode: "C2", marks: 10, text: "Find the disjunctive normal form of P → ((P → Q) ∧ ¬(¬P∨¬P))." },
      ],
    },
    // ─── Unit 4: Posets, Combinatorics & Recurrence (16 marks) ───
    {
      unitSerial: 4,
      unitName: "Posets, Combinatorics & Recurrence",
      totalMarks: 16,
      questions: [
        { qCode: "A7", marks: 2, text: "Define generating function." },
        { qCode: "B5", marks: 4, text: "How many words can be formed from the letter of the word 'DAUGHTER' if the vowels always coming together?" },
        { qCode: "C3", marks: 10, text: "Solve the recurrence relation sₙ − 7sₙ₋₁ + 10sₙ₋₂ = 0, s₀ = 0 and s₁ = 3 by using generating function where, n ≥ 2." },
      ],
    },
    // ─── Unit 5: Algebraic Structures (16 marks) ───
    {
      unitSerial: 5,
      unitName: "Algebraic Structures",
      totalMarks: 16,
      questions: [
        { qCode: "A8", marks: 2, text: "Define homomorphism and isomorphism of groups." },
        { qCode: "B6", marks: 4, text: "Show that the set G = {2ⁿ | n∈Z} is a group for multiplication." },
        { qCode: "C4", marks: 10, text: "Show that the set of all square matrix of order (m×m) under the binary operations addition and multiplication is a non-commutative ring." },
      ],
    },
    // ─── Unit 6: Graph Theory (18 marks) ───
    {
      unitSerial: 6,
      unitName: "Graph Theory",
      totalMarks: 18,
      questions: [
        { qCode: "A9", marks: 2, text: "What do you mean by a regular graph?" },
        { qCode: "A10", marks: 2, text: "Define Hamiltonian graph with example." },
        { qCode: "B7", marks: 4, text: "Determine whether the graph given below by its adjacency matrix is connected or not – [4×4 adjacency matrix given]" },
        { qCode: "C5", marks: 10, text: "Using Dijkstra's algorithm, find the shortest distance of all vertices from the vertex A for the graph shown in figure." },
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
      const yearExists = existing.years.some((y) => y.year === 2022);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2022);
      }
      existing.years.push(DMS_2022_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2022 data for DMS");
    } else {
      await ExamAnalysis.create({
        subjectName: "Discrete Mathematics Structure",
        totalPaperMarks: 98,
        years: [DMS_2022_YEAR],
      });
      console.log("✅ Created new DMS subject with 2022 data");
    }

    const result = await ExamAnalysis.findOne({ subjectName: "Discrete Mathematics Structure" });
    console.log(`\n📊 Verification:`);
    console.log(`   Available years: ${result.years.map((y) => y.year).sort().join(", ")}`);
    const yearData = result.years.find((y) => y.year === 2022);
    yearData.units.forEach((u) => {
      console.log(`     Unit ${u.unitSerial}: ${u.unitName} — ${u.totalMarks} marks (${u.questions.length} questions)`);
    });
    console.log(`   Total marks (2022): ${yearData.units.reduce((s, u) => s + u.totalMarks, 0)}`);

    await mongoose.disconnect();
    console.log("\n✅ Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
