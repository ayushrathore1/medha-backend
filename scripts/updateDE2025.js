/**
 * Script to update Digital Electronics January 2025 exam analysis data
 * Based on actual January 2025 paper (3E1203)
 * 
 * Paper Structure (Total 98 marks including optionals):
 * - Part A: 10 questions × 2 marks = 20 marks (Compulsory)
 * - Part B: 7 questions × 4 marks = 28 marks (Attempt any 5)
 * - Part C: 5 questions × 10 marks = 50 marks (Attempt any 3)
 * 
 * Unit-wise Weightage (out of 98):
 * - Unit 1: Fundamental concepts - 16 marks (16.33%)
 * - Unit 2: Minimization techniques and logic gates - 20 marks (20.41%)
 * - Unit 3: Digital logic gate characteristics - 16 marks (16.33%)
 * - Unit 4: Combinational circuits - 12 marks (12.24%)
 * - Unit 5: Sequential circuits - 34 marks (34.69%)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const digitalElectronics2025Data = {
  year: 2025,
  units: [
    {
      unitSerial: 1,
      unitName: "Fundamental concepts",
      totalMarks: 16,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.1", marks: 2, text: "State and prove De Morgan's theorem." },
        { qCode: "Part A Q.2", marks: 2, text: "Convert: (BC)<sub>16</sub> → ( )<sub>10</sub>; (1000011)<sub>2</sub> → ( )<sub>10</sub>." },
        { qCode: "Part A Q.3", marks: 2, text: "Subtraction using 9's complement: 54321 − 41245." },
        { qCode: "Part A Q.4", marks: 2, text: "Convert (1111)<sub>16</sub> to binary and then to gray code." },
        { qCode: "Part A Q.5", marks: 2, text: "Explain the Binary Codes." },
        { qCode: "Part A Q.8", marks: 2, text: "Write about Gray to the binary convertor." },
        { qCode: "Part B Q.2", marks: 4, text: "What do you mean by digital system? Explain characteristics of digital systems." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Minimization techniques and logic gates",
      totalMarks: 20,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part C Q.1", marks: 10, text: "Discuss Quine McCluskey (Tabulation) method using suitable example." },
        { qCode: "Part C Q.2", marks: 10, text: "Simplify using K-map and implement using NAND gates: F(A,B,C,D) = Σm(0,2,3,8,10,11,12,14)." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Digital logic gate characteristics",
      totalMarks: 16,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.10", marks: 2, text: "Write a comparison of various logic families." },
        { qCode: "Part B Q.6", marks: 4, text: "Discuss concerns with Logic Families and Semiconductor Memories: noise margin, propagation delay, fan-in/fan-out." },
        { qCode: "Part C Q.5", marks: 10, text: "Short note on: TTL Logic, ECL, CMOS digital logic families." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Combinational circuits",
      totalMarks: 12,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part B Q.1", marks: 4, text: "Explain: (a) Encoder-Decoders (b) BCD to 7 segment decoder." },
        { qCode: "Part B Q.3", marks: 4, text: "Explain half adder; implement full adder using two half adders." },
        { qCode: "Part B Q.5", marks: 4, text: "Implement Boolean function using 8:1 MUX: F(A,B,C,D) = Σm(0,1,2,5,7,8,9,14,15)." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Sequential circuits",
      totalMarks: 34,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.6", marks: 2, text: "Mention the types of counter." },
        { qCode: "Part A Q.7", marks: 2, text: "What is a flip-flop?" },
        { qCode: "Part A Q.9", marks: 2, text: "Explain briefly about the S-R flip-flop." },
        { qCode: "Part B Q.4", marks: 4, text: "Explain master-slave flip flop and discuss race-around problem." },
        { qCode: "Part B Q.7", marks: 4, text: "Draw and explain the 4-bit universal shift register." },
        { qCode: "Part C Q.3", marks: 10, text: "Design a Mod-10 asynchronous counter using J-K FFs." },
        { qCode: "Part C Q.4", marks: 10, text: "Draw & explain JK, D, T flip-flops using truth table and logic diagrams." }
      ]
    }
  ]
};

async function updateDigitalElectronics2025() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Digital Electronics subject
    const subject = await ExamAnalysis.findOne({ subjectName: 'Digital Electronics' });
    
    if (!subject) {
      console.log('❌ Digital Electronics subject not found. Creating new entry...');
      
      await ExamAnalysis.create({
        subjectName: 'Digital Electronics',
        totalPaperMarks: 98,
        years: [digitalElectronics2025Data]
      });
      
      console.log('✅ Created Digital Electronics with 2025 data');
    } else {
      subject.totalPaperMarks = 98;
      
      const yearIndex = subject.years.findIndex(y => y.year === 2025);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = digitalElectronics2025Data;
        console.log('✅ Updated existing 2025 data');
      } else {
        subject.years.push(digitalElectronics2025Data);
        console.log('✅ Added new 2025 data');
      }
      
      await subject.save();
      console.log('✅ Saved Digital Electronics data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Digital Electronics' });
    const year2025 = updatedSubject.years.find(y => y.year === 2025);
    
    console.log('\n📊 Verification:');
    console.log(`Total Paper Marks: ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2025.units.forEach(unit => {
      const questionsTotal = unit.questions.reduce((sum, q) => sum + q.marks, 0);
      console.log(`  Unit ${unit.unitSerial}: ${unit.unitName}`);
      console.log(`    - Total Marks: ${unit.totalMarks}`);
      console.log(`    - Questions: ${unit.questions.length}`);
      totalMarks += unit.totalMarks;
    });
    
    console.log(`\n✅ Total computed marks across all units: ${totalMarks}`);
    console.log('📌 Paper Structure: Part A (20) + Part B (28, 7/7) + Part C (50, 5/5) = 98 marks');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

updateDigitalElectronics2025();
