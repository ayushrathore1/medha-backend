# RTU Exam Paper Analysis Workflow

This guide explains how to analyze an RTU exam paper PDF, map questions to syllabus units, and add the data to the MEDHA database.

---

## 📋 Prerequisites

1. **Exam Paper PDF** - The question paper to analyze
2. **Subject Syllabus** - Official RTU syllabus with unit-wise topics
3. **Access to MongoDB** - Either via script or MongoDB Compass

---

## 🔢 Step 1: Understand Paper Structure

RTU papers typically follow this structure:

| Part | Questions | Marks Each | Total | Instructions |
|------|-----------|------------|-------|--------------|
| **Part A** | 10 | 2 | 20 | All compulsory (25 words) |
| **Part B** | 7 | 4 | 28 | Attempt any 5 |
| **Part C** | 5 | 10 | 50 | Attempt any 3 |
| **TOTAL** | 22 | - | **98** | Max attempted: **70** |

> ⚠️ **Important**: Total marks shown = 98 (all questions), but students attempt only 70 marks worth.

---

## 📖 Step 2: Get the Syllabus

For each subject, identify the 5 units. Example for **Digital Electronics**:

| Unit | Topic |
|------|-------|
| 1 | Number Systems, Codes & Conversions |
| 2 | Boolean Algebra & Minimization Techniques (K-map, QM) |
| 3 | Combinational Logic (Encoders, Decoders, MUX, Adders) |
| 4 | Sequential Logic (Flip-Flops, Counters, Registers) |
| 5 | Logic Families & Semiconductor Memories |

---

## 📝 Step 3: Extract Questions from Paper

Go through each question and note:
- **Question Code** (e.g., Q1 Part A, Q3 Part B)
- **Marks**
- **Question Text** (can be abbreviated)
- **Keywords** to help identify the unit

### Example Extraction:

```
PART A (2 marks each):
Q1: De Morgan's theorem → Keywords: Boolean, theorem
Q2: Convert (BC)₁₆ to decimal → Keywords: conversion, number system
Q3: 9's complement subtraction → Keywords: complement, subtraction
...

PART B (4 marks each):
Q1: Encoder-Decoders, BCD to 7-segment → Keywords: encoder, decoder
Q2: Digital system characteristics → Keywords: digital, analog
...

PART C (10 marks each):
Q1: Quine McCluskey method → Keywords: minimization, tabulation
Q2: K-map with NAND gates → Keywords: K-map, NAND
...
```

---

## 🗂️ Step 4: Map Questions to Units

Using the syllabus and keywords, assign each question to a unit:

| Question | Marks | Keywords | Unit |
|----------|-------|----------|------|
| Q1 Part A | 2 | De Morgan, theorem | **2** (Boolean Algebra) |
| Q2 Part A | 2 | conversion, hex | **1** (Number Systems) |
| Q3 Part A | 2 | complement | **1** (Number Systems) |
| Q4 Part A | 2 | binary, gray code | **1** (Number Systems) |
| Q5 Part A | 2 | binary codes | **1** (Number Systems) |
| Q6 Part A | 2 | counter types | **4** (Sequential) |
| Q7 Part A | 2 | flip-flop | **4** (Sequential) |
| Q8 Part A | 2 | gray to binary | **1** (Number Systems) |
| Q9 Part A | 2 | S-R flip-flop | **4** (Sequential) |
| Q10 Part A | 2 | logic families | **5** (Logic Families) |
| Q1 Part B | 4 | encoder, decoder | **3** (Combinational) |
| Q2 Part B | 4 | digital system | **1** (Number Systems) |
| Q3 Part B | 4 | half adder, full adder | **3** (Combinational) |
| Q4 Part B | 4 | master-slave, race around | **4** (Sequential) |
| Q5 Part B | 4 | multiplexer, MUX | **3** (Combinational) |
| Q6 Part B | 4 | noise margin, fan-out | **5** (Logic Families) |
| Q7 Part B | 4 | shift register | **4** (Sequential) |
| Q1 Part C | 10 | Quine McCluskey | **2** (Boolean Algebra) |
| Q2 Part C | 10 | K-map, NAND | **2** (Boolean Algebra) |
| Q3 Part C | 10 | Mod-10 counter | **4** (Sequential) |
| Q4 Part C | 10 | J-K, D, T flip-flop | **4** (Sequential) |
| Q5 Part C | 10 | TTL, ECL, CMOS | **5** (Logic Families) |

---

## 🧮 Step 5: Calculate Unit-wise Marks

Sum up marks for each unit:

| Unit | Questions | Marks Calculation | Total |
|------|-----------|-------------------|-------|
| **1** | Q2,Q3,Q4,Q5,Q8 (Part A) + Q2 (Part B) | 2+2+2+2+2+4 | **14** |
| **2** | Q1 (Part A) + Q1,Q2 (Part C) | 2+10+10 | **22** |
| **3** | Q1,Q3,Q5 (Part B) | 4+4+4 | **12** |
| **4** | Q6,Q7,Q9 (Part A) + Q4,Q7 (Part B) + Q3,Q4 (Part C) | 6+8+20 | **34** |
| **5** | Q10 (Part A) + Q6 (Part B) + Q5 (Part C) | 2+4+10 | **16** |
| **TOTAL** | | | **98** ✓ |

---

## 💾 Step 6: Create the Database Update Script

Create a script in `medha-backend/scripts/`:

```javascript
// scripts/update[Subject][Year].js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI;

const subjectData = {
  year: 2025,
  units: [
    {
      unitSerial: 1,
      unitName: "Number Systems, Codes & Conversions",
      totalMarks: 14,
      youtubePlaylistUrl: null, // Optional: Add YouTube playlist
      questions: [
        { qCode: "Q2 (Part A)", marks: 2, text: "Convert (BC)<sub>16</sub> to decimal" },
        { qCode: "Q3 (Part A)", marks: 2, text: "9's complement subtraction: 54321 - 41245" },
        // ... more questions
      ]
    },
    // ... more units
  ]
};

async function updateData() {
  await mongoose.connect(MONGO_URI);
  
  const subject = await ExamAnalysis.findOne({ subjectName: 'Digital Electronics' });
  subject.totalPaperMarks = 98; // Always 98 for standard papers
  
  const yearIndex = subject.years.findIndex(y => y.year === 2025);
  if (yearIndex >= 0) {
    subject.years[yearIndex] = subjectData;
  } else {
    subject.years.push(subjectData);
  }
  
  await subject.save();
  await mongoose.disconnect();
}

updateData();
```

---

## ▶️ Step 7: Run the Script

```bash
cd medha-backend
node scripts/update[Subject][Year].js
```

---

## ✅ Step 8: Verify in Frontend

1. Go to **RTU Exams** → Select Subject → Select Year
2. Check that:
   - Total marks shows correctly (98)
   - Unit-wise marks are accurate
   - All questions appear under correct units
   - The "Note" about optional questions is visible

---

## 📌 Quick Reference: Common Mappings

### Digital Electronics
| Topic Keywords | Unit |
|----------------|------|
| Number system, binary, hex, octal, conversion, complement, codes | 1 |
| Boolean, K-map, SOP, POS, minimization, Quine McCluskey, De Morgan | 2 |
| Encoder, decoder, MUX, DEMUX, adder, subtractor, comparator | 3 |
| Flip-flop, counter, register, shift register, race around, timing | 4 |
| TTL, ECL, CMOS, logic families, fan-in, fan-out, noise margin | 5 |

### Data Structures
| Topic Keywords | Unit |
|----------------|------|
| Array, linked list, stack, queue, circular queue | 1 |
| Tree, binary tree, BST, AVL, traversal | 2 |
| Graph, BFS, DFS, spanning tree, shortest path | 3 |
| Sorting, searching, hashing, complexity | 4 |
| File organization, B-tree, B+ tree | 5 |

---

## 🔄 Updating Existing Data

If data already exists for a subject-year combination:
1. The script will automatically **update** (not duplicate)
2. Old questions will be replaced with new ones
3. Unit marks will be recalculated

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `models/ExamAnalysis.js` | MongoDB schema for exam data |
| `controllers/rtuWeightageController.js` | API to fetch weightage data |
| `scripts/update*.js` | Data update scripts |
| `pages/RTUExams.jsx` | Frontend display |
| `components/RTUExams/UnitWeightageBar.jsx` | Unit card component |

---

## ⚠️ Common Mistakes to Avoid

1. **Wrong total marks**: Always verify unit marks sum to 98
2. **Missing questions**: Cross-check question count with paper
3. **Wrong unit mapping**: Double-check syllabus for edge cases
4. **HTML in question text**: Use `<br/>`, `<sub>`, `<sup>` for formatting
5. **Forgetting to update totalPaperMarks**: Must be 98 for standard papers

---

*Last updated: December 2024*
