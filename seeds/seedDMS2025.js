/**
 * Seed script: DMS 2025 PYQ Analysis
 * Run: node seeds/seedDMS2025.js
 * 
 * Inserts the Discrete Mathematics Structure 2025 exam paper analysis
 * into the ExamAnalysis collection.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DMS_2025_DATA = {
  subjectName: "Discrete Mathematics Structure",
  totalPaperMarks: 98,
  years: [
    {
      year: 2025,
      units: [
        // ─── Unit 2: Set Theory, Relations & Functions (22 marks) ───
        {
          unitSerial: 2,
          unitName: "Set Theory, Relations & Functions",
          totalMarks: 22,
          questions: [
            {
              qCode: "A1",
              marks: 2,
              text: "If A = {1, 2, 3} and B = {a, b, c}, how many total possible relations can be formed from A to B?",
            },
            {
              qCode: "A2",
              marks: 2,
              text: "If f, g : ℝ → ℝ are defined as f(x) = x² and g(x) = 5x + 1. Find the composition (f ∘ g)(x) at x = 2.",
            },
            {
              qCode: "B1",
              marks: 4,
              text: "Among 50 students in a class, 26 got an A in the first examination and 21 got an A in the second examination. If 17 students did not get an A in either examination, how many students got A in both the examinations?",
            },
            {
              qCode: "B2",
              marks: 4,
              text: "Use mathematical induction to prove that for all n ≥ 1, 10ⁿ − 1 is divisible by 9.",
            },
            {
              qCode: "C1",
              marks: 10,
              text: "Let R be a relation defined on the set N = {1,2,3,……} such that a, b ∈ N, aRb if and only if a = bᵏ, k ∈ (0, 1, 2, 3, …….). Then show that R is a partial ordering relation on N.",
            },
          ],
        },
        // ─── Unit 3: Propositional Logic & FSM (18 marks) ───
        {
          unitSerial: 3,
          unitName: "Propositional Logic & FSM",
          totalMarks: 18,
          questions: [
            {
              qCode: "A3",
              marks: 2,
              text: "When are two finite state automata said to be equivalent?",
            },
            {
              qCode: "A4",
              marks: 2,
              text: "Define universal and existential quantifiers.",
            },
            {
              qCode: "B3",
              marks: 4,
              text: "Prove by constructing truth table P → (Q ∨ R) ≅ (P → Q) ∨ (P → R).",
            },
            {
              qCode: "C2",
              marks: 10,
              text: "(a) Find the disjunctive normal form of P → ((P → Q) ∧ ¬(¬P∨¬P)). (b) Show that the following proposition is tautology: (P → Q) ↔ (¬P ∨ Q).",
            },
          ],
        },
        // ─── Unit 4: Posets, Combinatorics & Recurrence (22 marks) ───
        {
          unitSerial: 4,
          unitName: "Posets, Combinatorics & Recurrence",
          totalMarks: 22,
          questions: [
            {
              qCode: "A5",
              marks: 2,
              text: "What is a complemented lattice?",
            },
            {
              qCode: "A6",
              marks: 2,
              text: "Find the middle term in the expansion of (x² + 2/x⁴)¹⁴.",
            },
            {
              qCode: "B4",
              marks: 4,
              text: "Let B be the power set of S = {1, 2, 3} and (B, ≤) be a poset defined by X ≤ Y if X ⊆ Y for X, Y ∈ B. Draw the Hasse diagram of the poset (B, ≤).",
            },
            {
              qCode: "B5",
              marks: 4,
              text: "How many words can be formed from the letter of the word 'DAUGHTER' if the vowels always coming together?",
            },
            {
              qCode: "C3",
              marks: 10,
              text: "Find an explicit formula for the following linear homogeneous recurrence relation: aₙ = −4aₙ₋₁ − 3aₙ₋₂, if n ≥ 2, with the initial conditions a₀ = 4 and a₁ = 8.",
            },
          ],
        },
        // ─── Unit 5: Algebraic Structures (18 marks) ───
        {
          unitSerial: 5,
          unitName: "Algebraic Structures",
          totalMarks: 18,
          questions: [
            {
              qCode: "A7",
              marks: 2,
              text: "What is an Abelian Group? Give an example of an infinite Abelian group.",
            },
            {
              qCode: "A8",
              marks: 2,
              text: "Define the cyclic group.",
            },
            {
              qCode: "B6",
              marks: 4,
              text: "Prove that the intersection of any two normal subgroups of a group G is normal subgroup of G.",
            },
            {
              qCode: "C4",
              marks: 10,
              text: "Show that the set of all square matrix of order (m × m) under the binary operations addition and multiplication is a non-commutative ring.",
            },
          ],
        },
        // ─── Unit 6: Graph Theory (18 marks) ───
        {
          unitSerial: 6,
          unitName: "Graph Theory",
          totalMarks: 18,
          questions: [
            {
              qCode: "A9",
              marks: 2,
              text: "What do you mean by a regular graph?",
            },
            {
              qCode: "A10",
              marks: 2,
              text: "Draw graph which is (a) Eulerian but not Hamiltonian. (b) Hamiltonian but not Eulerian.",
            },
            {
              qCode: "B7",
              marks: 4,
              text: "Determine whether the graph given below by its adjacency matrix is connected or not. [4×4 adjacency matrix given]",
            },
            {
              qCode: "C5",
              marks: 10,
              text: "Using Dijkstra's algorithm, find the shortest path between the vertices A and H in the weighted graph shown in figure.",
            },
          ],
        },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if DMS already exists
    const existing = await ExamAnalysis.findOne({
      subjectName: DMS_2025_DATA.subjectName,
    });

    if (existing) {
      // Check if 2025 year already exists
      const yearExists = existing.years.some((y) => y.year === 2025);
      if (yearExists) {
        // Replace the existing 2025 data
        existing.years = existing.years.filter((y) => y.year !== 2025);
        existing.years.push(DMS_2025_DATA.years[0]);
        await existing.save();
        console.log("✅ Updated existing DMS subject with 2025 data");
      } else {
        // Add 2025 to existing years
        existing.years.push(DMS_2025_DATA.years[0]);
        await existing.save();
        console.log("✅ Added 2025 data to existing DMS subject");
      }
    } else {
      // Create new document
      await ExamAnalysis.create(DMS_2025_DATA);
      console.log("✅ Created new DMS subject with 2025 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Discrete Mathematics Structure",
    });
    const yearData = result.years.find((y) => y.year === 2025);
    console.log(`\n📊 Verification:`);
    console.log(`   Subject: ${result.subjectName}`);
    console.log(`   Total Paper Marks: ${result.totalPaperMarks}`);
    console.log(`   Year: 2025`);
    console.log(`   Units: ${yearData.units.length}`);
    yearData.units.forEach((u) => {
      console.log(
        `     Unit ${u.unitSerial}: ${u.unitName} — ${u.totalMarks} marks (${u.questions.length} questions)`
      );
    });
    const total = yearData.units.reduce((s, u) => s + u.totalMarks, 0);
    console.log(`   Total marks (all questions): ${total}`);

    await mongoose.disconnect();
    console.log("\n✅ Done. Disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
