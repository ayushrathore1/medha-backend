/**
 * Script to update Digital Electronics 2024 exam analysis data
 * Based on actual January/February 2024 paper (3E1203)
 * Total Marks: 98 (including optionals) | Max Attempted: 70
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const digitalElectronics2024Data = {
  year: 2024,
  units: [
    {
      unitSerial: 1,
      unitName: "Fundamental Concepts - Number Systems, Codes & Boolean Algebra",
      totalMarks: 22, // Q2,Q4,Q9,Q10 Part A (2×4=8) + Q6 Part B (4) + Q4 Part C (10) = 22
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q2 (Part A)", marks: 2, text: "Define reflective codes." },
        { qCode: "Q4 (Part A)", marks: 2, text: "Convert (10101101)<sub>2</sub> → ( )<sub>16</sub>" },
        { qCode: "Q9 (Part A)", marks: 2, text: "Solve (0100 1000.01111001)<sub>XS-3</sub> = ( )<sub>10</sub>" },
        { qCode: "Q10 (Part A)", marks: 2, text: "Calculate the value of x: (23)<sub>x</sub> + (12)<sub>x</sub> = (101)<sub>x</sub>" },
        { qCode: "Q6 (Part B)", marks: 4, text: "Consider two binary numbers X=1010100 and Y=1000011, perform the subtraction using 2's complement:<br/>i) X - Y<br/>ii) Y - X" },
        { qCode: "Q4 (Part C)", marks: 10, text: "Design a 4-bit binary to gray code converter and realize it using logic gates." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Minimization Techniques and Logic Gates",
      totalMarks: 22, // Q3,Q7 Part A (2×2=4) + Q2,Q5 Part B (4×2=8) + Q1 Part C (10) = 22
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q3 (Part A)", marks: 2, text: "State De Morgan's theorem." },
        { qCode: "Q7 (Part A)", marks: 2, text: "Explain don't care condition." },
        { qCode: "Q2 (Part B)", marks: 4, text: "Interpret the function f = A + BC in canonical POS form (Product of Sum form)." },
        { qCode: "Q5 (Part B)", marks: 4, text: "Show that:<br/>i) AB + A'C + BC = AB + A'C<br/>ii) AB + A'C = (A + C)(A' + B)" },
        { qCode: "Q1 (Part C)", marks: 10, text: "Simplify the following boolean function using Quine McCluskey method and verify the result using K-map also:<br/>F(A,B,C,D) = Σm(1,2,3,7,8,9,10,11,14,15)" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Digital Logic Gate Characteristics",
      totalMarks: 16, // Q8 Part A (2) + Q4 Part B (4) + Q3 Part C (10) = 16
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q8 (Part A)", marks: 2, text: "Show the classification of digital logic families." },
        { qCode: "Q4 (Part B)", marks: 4, text: "Construct CMOS NAND and CMOS NOR gate for two inputs." },
        { qCode: "Q3 (Part C)", marks: 10, text: "Explain the following terms:<br/>i) Noise Margin<br/>ii) Propagation Delay<br/>iii) Fan-In<br/>iv) Fan-out<br/>v) Power Dissipation" }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Combinational Circuits",
      totalMarks: 12, // Q1,Q3,Q7 Part B (4×3=12)
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part B)", marks: 4, text: "What is multiplexer? Design 4:1 MUX using 2:1 MUX." },
        { qCode: "Q3 (Part B)", marks: 4, text: "Design full adder circuit using half adders." },
        { qCode: "Q7 (Part B)", marks: 4, text: "What are decoders? Implement the following boolean function using 3 to 8 decoder:<br/>f(A,B,C) = Σm(2,4,5,7)" }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Sequential Circuits",
      totalMarks: 26, // Q1,Q5,Q6 Part A (2×3=6) + Q2,Q5 Part C (10×2=20) = 26
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part A)", marks: 2, text: "List the different types of flip flops." },
        { qCode: "Q5 (Part A)", marks: 2, text: "Explain race around condition in JK flip flop." },
        { qCode: "Q6 (Part A)", marks: 2, text: "Illustrate Excitation table of SR flip flop." },
        { qCode: "Q2 (Part C)", marks: 10, text: "Design a 3-bit synchronous counter using JK flip flops." },
        { qCode: "Q5 (Part C)", marks: 10, text: "Explain the working of 4-bit serial in parallel-out shift register along with the waveform." }
      ]
    }
  ]
};

async function updateDigitalElectronics2024() {
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
        years: [digitalElectronics2024Data]
      });
      
      console.log('✅ Created Digital Electronics with 2024 data');
    } else {
      // Ensure totalPaperMarks is 98
      subject.totalPaperMarks = 98;
      
      // Find and update 2024 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2024);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = digitalElectronics2024Data;
        console.log('✅ Updated existing 2024 data');
      } else {
        subject.years.push(digitalElectronics2024Data);
        console.log('✅ Added new 2024 data');
      }
      
      await subject.save();
      console.log('✅ Saved Digital Electronics 2024 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Digital Electronics' });
    const year2024 = updatedSubject.years.find(y => y.year === 2024);
    
    console.log('\n📊 Verification - Digital Electronics 2024:');
    console.log(`Total Paper Marks (including optionals): ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2024.units.forEach(unit => {
      const percentage = ((unit.totalMarks / 98) * 100).toFixed(1);
      console.log(`  Unit ${unit.unitSerial}: ${unit.unitName}`);
      console.log(`    → ${unit.totalMarks} marks (${percentage}%) | ${unit.questions.length} questions`);
      totalMarks += unit.totalMarks;
    });
    
    console.log(`\n✅ Total computed marks: ${totalMarks}`);
    
    if (totalMarks === 98) {
      console.log('✅ Marks verify correctly! (98 = 20 Part A + 28 Part B + 50 Part C)');
    } else {
      console.log(`⚠️ Warning: Expected 98, got ${totalMarks}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

updateDigitalElectronics2024();
