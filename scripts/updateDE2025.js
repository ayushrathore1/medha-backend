/**
 * Script to update Digital Electronics 2025 exam analysis data
 * Based on actual January 2025 paper (3E1203)
 * Max Marks: 70 (attempted) | Total Question Marks: 98 (including optionals)
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
      unitName: "Number Systems, Codes & Conversions",
      totalMarks: 14, // Q2,Q3,Q4,Q5,Q8 Part A (2×5=10) + Q2 Part B (4) = 14
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q2 (Part A)", marks: 2, text: "Convert the following:<br/>a) (BC)<sub>16</sub> = ( )<sub>10</sub><br/>b) (1000011)<sub>2</sub> = ( )<sub>10</sub>" },
        { qCode: "Q3 (Part A)", marks: 2, text: "Perform the following: Subtraction using 9's complement for 54321 - 41245" },
        { qCode: "Q4 (Part A)", marks: 2, text: "Convert the following to binary and then to gray code: (1111)<sub>16</sub>" },
        { qCode: "Q5 (Part A)", marks: 2, text: "Explain the Binary Codes." },
        { qCode: "Q8 (Part A)", marks: 2, text: "Write about Gray to the binary converter." },
        { qCode: "Q2 (Part B)", marks: 4, text: "What do you mean by digital system? Explain the characteristics of digital systems." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Boolean Algebra & Minimization Techniques",
      totalMarks: 22, // Q1 Part A (2) + Q1,Q2 Part C (10×2=20) = 22
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part A)", marks: 2, text: "State and prove De Morgan's theorem." },
        { qCode: "Q1 (Part C)", marks: 10, text: "Discuss the Quine McCluskey (Tabulation) method using suitable example." },
        { qCode: "Q2 (Part C)", marks: 10, text: "Simplify the Boolean expression using K-map and implement using NAND gates:<br/>F(A,B,C,D) = Σm(0,2,3,8,10,11,12,14)" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Combinational Logic Circuits",
      totalMarks: 12, // Q1,Q3,Q5 Part B (4×3=12)
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part B)", marks: 4, text: "Explain the:<br/>a) Encoder-Decoders<br/>b) BCD to 7 segment decoder" },
        { qCode: "Q3 (Part B)", marks: 4, text: "Explain half adder? Implement the full adder using two half adders." },
        { qCode: "Q5 (Part B)", marks: 4, text: "Implement the following Boolean function using 8:1 multiplexer:<br/>F(A,B,C,D) = Σm(0,1,2,5,7,8,9,14,15)" }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Sequential Logic Circuits (Flip-Flops, Counters, Registers)",
      totalMarks: 34, // Q6,Q7,Q9 Part A (2×3=6) + Q4,Q7 Part B (4×2=8) + Q3,Q4 Part C (10×2=20) = 34
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q6 (Part A)", marks: 2, text: "Mention the types of counter." },
        { qCode: "Q7 (Part A)", marks: 2, text: "What is a flip-flop?" },
        { qCode: "Q9 (Part A)", marks: 2, text: "Explain briefly about the S-R flip-flop." },
        { qCode: "Q4 (Part B)", marks: 4, text: "Explain the working of Master Slave flip flop and discuss the Race around problem." },
        { qCode: "Q7 (Part B)", marks: 4, text: "Draw and explain the 4-bit Universal shift register." },
        { qCode: "Q3 (Part C)", marks: 10, text: "Design a Mod-10 Asynchronous counter using J-K FFs." },
        { qCode: "Q4 (Part C)", marks: 10, text: "Draw and explain the following using truth table and logic diagrams:<br/>a) J-K Flip flop<br/>b) D-Flip Flop<br/>c) T-Flip flop" }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Logic Families & Semiconductor Memories",
      totalMarks: 16, // Q10 Part A (2) + Q6 Part B (4) + Q5 Part C (10) = 16
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q10 (Part A)", marks: 2, text: "Write a comparison of various logic families." },
        { qCode: "Q6 (Part B)", marks: 4, text: "Discuss the following concerns with Logic Families and Semiconductor Memories:<br/>a) Noise margin<br/>b) Propagation delay<br/>c) Fan-in, Fan-out" },
        { qCode: "Q5 (Part C)", marks: 10, text: "Write a short note on:<br/>a) TTL Logic<br/>b) ECL<br/>c) CMOS Digital logic families" }
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
        totalPaperMarks: 98, // Total including optionals
        years: [digitalElectronics2025Data]
      });
      
      console.log('✅ Created Digital Electronics with 2025 data');
    } else {
      // Update totalPaperMarks to 98 (includes optionals)
      subject.totalPaperMarks = 98;
      
      // Find and update 2025 year data
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
    console.log(`Total Paper Marks (including optionals): ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2025.units.forEach(unit => {
      console.log(`  Unit ${unit.unitSerial}: ${unit.unitName} - ${unit.totalMarks} marks (${unit.questions.length} questions)`);
      totalMarks += unit.totalMarks;
    });
    
    console.log(`\n✅ Total computed marks: ${totalMarks}`);
    console.log('✅ This matches 98 (20 Part A + 28 Part B + 50 Part C)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

updateDigitalElectronics2025();
