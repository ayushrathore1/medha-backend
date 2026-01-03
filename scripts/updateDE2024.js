/**
 * Script to update Digital Electronics 2024 exam analysis data
 * Complete Analysis with Exact Questions
 * B.Tech. III-Sem. (Main/Back) Examination, January/February - 2024
 * Total Available Marks: 98 (Part A: 20 + Part B: 28 + Part C: 50)
 * Maximum Attempt: 70 (Part A: 20 + Part B: 20 + Part C: 30)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const digitalElectronics2024Data = {
  year: 2024,
  examDate: "January/February 2024",
  totalPaperMarks: 98, // Total available marks
  maxAttemptMarks: 70, // Maximum marks that can be attempted
  units: [
    {
      unitSerial: 1,
      unitName: "Fundamental Concepts & Boolean Algebra",
      totalMarks: 18, // 5 Part A (2×5=10) + 2 Part B (4×2=8) = 18 marks
      weightagePercent: 18.37, // 18/98 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each) - 10 marks
        { qCode: "Q2 (Part A)", marks: 2, text: "Define reflective codes." },
        { qCode: "Q3 (Part A)", marks: 2, text: "State De Morgan's theorem." },
        { qCode: "Q4 (Part A)", marks: 2, text: "Convert (10101101)₂→( )₁₆" },
        { qCode: "Q9 (Part A)", marks: 2, text: "Solve (0100 1000. 01111001)ₓₛ₋₃ = ( )₁₀" },
        { qCode: "Q10 (Part A)", marks: 2, text: "Calculate the value of x. (23)ₓ+(12)ₓ=(101)ₓ" },
        
        // Part B - Q5 and Q6 (4 marks each) - 8 marks
        { qCode: "Q5 (Part B)", marks: 4, text: "Show that: i) AB + A'C + BC = AB + A'C (2 marks) ii) AB+A'C = (A+C)(A'+B) (2 marks)" },
        { qCode: "Q6 (Part B)", marks: 4, text: "Consider two binary numbers X=1010100 and Y=1000011, perform the subtraction using 2's complement: i) X-Y (2 marks) ii) Y-X (2 marks)" }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Minimization Techniques",
      totalMarks: 16, // Available marks in this unit
      weightagePercent: 16.33, // 16/98 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each) - 2 marks
        { qCode: "Q7 (Part A)", marks: 2, text: "Explain don't care condition." },
        
        // Part B (4 marks each) - 4 marks
        { qCode: "Q2 (Part B)", marks: 4, text: "Interpret the function f=A+BC in canonical POS form (Product of Sum form)." },
        
        // Part C (10 marks) - 10 marks
        { qCode: "Q1 (Part C)", marks: 10, text: "Simplify the following boolean function using quine McCluskey method and verify the result using k-map also. F(A,B,C,D) = ∑ₘ (1,2,3,7,8,9,10,11,14,15)" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Digital Logic Gate Characteristics",
      totalMarks: 16, // Available marks in this unit
      weightagePercent: 16.33, // 16/98 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each) - 2 marks
        { qCode: "Q8 (Part A)", marks: 2, text: "Show the classification of digital logic families." },
        
        // Part B (4 marks each) - 4 marks
        { qCode: "Q4 (Part B)", marks: 4, text: "Construct CMOS NAND and CMOS NOR gate for two inputs." },
        
        // Part C (10 marks) - 10 marks
        { qCode: "Q3 (Part C)", marks: 10, text: "Explain the following terms: i) Noise Margin (2) ii) Propagation Delay (2) iii) Fan-In (2) iv) Fan-out (2) v) Power Dissipation (2)" }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Combinational Circuits",
      totalMarks: 22, // Available marks in this unit
      weightagePercent: 22.45, // 22/98 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part B (4 marks each) - 12 marks
        { qCode: "Q1 (Part B)", marks: 4, text: "What is multiplexer? Design 4:1 MUX using 2:1 MUX." },
        { qCode: "Q3 (Part B)", marks: 4, text: "Design full adder circuit using half adders." },
        { qCode: "Q7 (Part B)", marks: 4, text: "What are decoders? Implement the following boolean function using 3 to 8 decoder f(A,B,C) = Σₘ (2,4,5,7)" },
        
        // Part C (10 marks) - 10 marks
        { qCode: "Q4 (Part C)", marks: 10, text: "Design a 4-bit binary to gray code converter and realize it using logic gates." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Sequential Circuits",
      totalMarks: 26, // Available marks in this unit
      weightagePercent: 26.53, // 26/98 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each) - 6 marks
        { qCode: "Q1 (Part A)", marks: 2, text: "List the different types of flip flops." },
        { qCode: "Q5 (Part A)", marks: 2, text: "Explain race around condition in JK flip flop." },
        { qCode: "Q6 (Part A)", marks: 2, text: "Illustrate Excitation table of SR flip flop." },
        
        // Part C (10 marks each) - 20 marks
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
        subjectCode: '3AID3-04',
        totalPaperMarks: 98,
        years: [digitalElectronics2024Data]
      });
      
      console.log('✅ Created Digital Electronics with 2024 data');
    } else {
      // Update totalPaperMarks to 98
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
    
    console.log('\n📊 DIGITAL ELECTRONICS 2024 - ANALYSIS REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3AID3-04'}`);
    console.log(`Exam Date: ${year2024.examDate || 'January/February 2024'}`);
    console.log(`Total Available Marks: ${year2024.totalPaperMarks || 98}`);
    console.log(`Maximum Attempt Marks: ${year2024.maxAttemptMarks || 70}`);
    
    console.log('\n📋 UNIT-WISE WEIGHTAGE (Based on 98 Total Marks):');
    console.log('───────────────────────────────────────────────────────────');
    
    let totalQuestionsMarks = 0;
    let totalQuestions = 0;
    
    year2024.units.forEach(unit => {
      const unitTotal = unit.questions.reduce((sum, q) => sum + q.marks, 0);
      const weightage = unit.weightagePercent || ((unit.totalMarks / 98) * 100);
      console.log(`\n  Unit ${unit.unitSerial}: ${unit.unitName}`);
      console.log(`    ├─ Total Marks: ${unit.totalMarks} marks`);
      console.log(`    ├─ Weightage: ${weightage.toFixed(2)}% of 98 marks`);
      console.log(`    ├─ Questions: ${unit.questions.length}`);
      console.log(`    └─ Verification: ${unitTotal} marks ${unitTotal === unit.totalMarks ? '✅' : '❌'}`);
      totalQuestionsMarks += unitTotal;
      totalQuestions += unit.questions.length;
    });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ Total questions: ${totalQuestions}`);
    console.log(`✅ Total marks (sum): ${totalQuestionsMarks}`);
    console.log(`✅ Expected total: 98 marks ${totalQuestionsMarks === 98 ? '✅' : '❌'}`);
    
    console.log('\n📝 PAPER STRUCTURE:');
    console.log('───────────────────────────────────────────────────────────');
    console.log('  Part A: 10 questions × 2 marks = 20 marks (All compulsory)');
    console.log('  Part B: 7 questions × 4 marks = 28 marks (Attempt any 5)');
    console.log('  Part C: 5 questions × 10 marks = 50 marks (Attempt any 3)');
    console.log('  ───────────────────────────────────────────────────────');
    console.log(`  Total Available: 20 + 28 + 50 = 98 marks`);
    console.log(`  Maximum Attempt: 20 + 20 + 30 = 70 marks`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Unit-wise summary table
    console.log('📊 UNIT WEIGHTAGE SUMMARY TABLE:');
    console.log('┌──────┬───────────────────────────────────────┬───────┬────────────┐');
    console.log('│ Unit │ Unit Name                             │ Marks │ Weightage  │');
    console.log('├──────┼───────────────────────────────────────┼───────┼────────────┤');
    year2024.units.forEach(unit => {
      const weightage = unit.weightagePercent || ((unit.totalMarks / 98) * 100);
      const name = unit.unitName.padEnd(37);
      const marks = String(unit.totalMarks).padStart(5);
      const weight = `${weightage.toFixed(2)}%`.padStart(9);
      console.log(`│  ${unit.unitSerial}   │ ${name} │ ${marks} │ ${weight} │`);
    });
    console.log('└──────┴───────────────────────────────────────┴───────┴────────────┘\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

updateDigitalElectronics2024();
