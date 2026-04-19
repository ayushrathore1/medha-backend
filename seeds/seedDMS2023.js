/**
 * Seed script: DMS 2023 PYQ Analysis
 * Run: node seeds/seedDMS2023.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

const DMS_2023_YEAR = {
  year: 2023,
  units: [
    // ─── Unit 2: Set Theory, Relations & Functions (22 marks) ───
    {
      unitSerial: 2,
      unitName: "Set Theory, Relations & Functions",
      totalMarks: 22,
      questions: [
        { qCode: "A1", marks: 2, text: "Prove that A − B = B' ∩ A'." },
        { qCode: "A2", marks: 2, text: "Define partial ordering relation with an example." },
        { qCode: "B1", marks: 4, text: "In a class of 60 students, 25 study Hindi, 26 study English and 26 study Sanskrit. Also 9 study both Hindi and Sanskrit, 11 study Hindi and English and 8 study English and Sanskrit. If 8 study none of the three subjects, Find number of students who study exactly one subject." },
        { qCode: "B2", marks: 4, text: "Using principle of mathematical induction, prove that 1 + 2 + 2² + …….. + 2ⁿ⁻¹ = 2ⁿ − 1." },
        { qCode: "C1", marks: 10, text: "In the set Z of integers, a relation R is defined by aRb ⟺ a ≡ b(mod 4). Show that R is an equivalence relation." },
      ],
    },
    // ─── Unit 3: Propositional Logic & FSM (18 marks) ───
    {
      unitSerial: 3,
      unitName: "Propositional Logic & FSM",
      totalMarks: 18,
      questions: [
        { qCode: "A3", marks: 2, text: "Draw the truth table for p ∧ q → p ∨ q." },
        { qCode: "A4", marks: 2, text: "Explain conjunctive normal form." },
        { qCode: "B3", marks: 4, text: "Draw the transition diagram of finite state machine represented by following state table. Also find output word corresponding to input word w = 11011011." },
        { qCode: "C2", marks: 10, text: "Define universal and existential quantifiers. Prove that p → (q ∧ r) ≡ (p → q) ∧ (p → r)." },
      ],
    },
    // ─── Unit 4: Posets, Combinatorics & Recurrence (18 marks) ───
    {
      unitSerial: 4,
      unitName: "Posets, Combinatorics & Recurrence",
      totalMarks: 18,
      questions: [
        { qCode: "A5", marks: 2, text: "Draw the Hasse diagram of the poset (A,≤) where A = {1,2,3,4,12} and the partial order of divisibility on A is a≤b (i.e. if a divides b)." },
        { qCode: "A6", marks: 2, text: "8 boys and 5 girls constitute a group. In how many ways seven of them can be selected if the selections always have atleast 3 boys and 2 girls." },
        { qCode: "B4", marks: 4, text: "Solve the recurrence relation aₙ − 4aₙ₋₁ + 4aₙ₋₂ = 0; a₀ = 1, a₁ = 3." },
        { qCode: "C3", marks: 10, text: "Prove that the dual of a lattice is also a lattice." },
      ],
    },
    // ─── Unit 5: Algebraic Structures (22 marks) ───
    {
      unitSerial: 5,
      unitName: "Algebraic Structures",
      totalMarks: 22,
      questions: [
        { qCode: "A7", marks: 2, text: "If a,b are any elements of a group G, then prove that (ab)⁻¹ = b⁻¹a⁻¹." },
        { qCode: "A8", marks: 2, text: "If a is a generator of a cyclic group, then prove that a⁻¹ is also its generator." },
        { qCode: "B5", marks: 4, text: "Define isomorphism of groups. Prove that every subgroup of an abelian group is normal." },
        { qCode: "B7", marks: 4, text: "Prove that set of real numbers of the form a + b√2 (where a and b are integers) with ordinary addition and multiplication forms a ring." },
        { qCode: "C4", marks: 10, text: "Prove that the necessary and sufficient conditions for a non-void subset H of a group G to be a subgroup is that a∈H, b∈H ⇒ ab⁻¹ ∈ H." },
      ],
    },
    // ─── Unit 6: Graph Theory (18 marks) ───
    {
      unitSerial: 6,
      unitName: "Graph Theory",
      totalMarks: 18,
      questions: [
        { qCode: "A9", marks: 2, text: "Draw graph which is (a) Eulerian but not Hamiltonian. (b) Hamiltonian but not Eulerian." },
        { qCode: "A10", marks: 2, text: "Define chromatic number." },
        { qCode: "B6", marks: 4, text: "Prove that the sum of degrees of all the vertices in a graph is equal to twice the number of edges in the graph." },
        { qCode: "C5", marks: 10, text: "Find the shortest path between the vertices vₐ and v₅ in the following weighed graph." },
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
      const yearExists = existing.years.some((y) => y.year === 2023);
      if (yearExists) {
        existing.years = existing.years.filter((y) => y.year !== 2023);
      }
      existing.years.push(DMS_2023_YEAR);
      await existing.save();
      console.log("✅ Added/updated 2023 data for DMS");
    } else {
      await ExamAnalysis.create({
        subjectName: "Discrete Mathematics Structure",
        totalPaperMarks: 98,
        years: [DMS_2023_YEAR],
      });
      console.log("✅ Created new DMS subject with 2023 data");
    }

    // Verify
    const result = await ExamAnalysis.findOne({
      subjectName: "Discrete Mathematics Structure",
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
