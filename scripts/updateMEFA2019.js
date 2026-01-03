/**
 * Script to update Managerial Economics & Financial Accounting 2019 exam analysis data
 * Complete Analysis with Exact Questions
 * B.Tech. III-Sem. (Main/Back) Examination, December 2019
 * Total Available Marks: 115 (Part A: 10 + Part B: 60 + Part C: 45)
 * Maximum Attempt: 80 (Part A: 10 + Part B: 40 + Part C: 30)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const mefaData2019 = {
  year: 2019,
  examDate: "December 2019",
  totalPaperMarks: 115, // Total available marks
  maxAttemptMarks: 80, // Maximum marks that can be attempted
  units: [
    {
      unitSerial: 1,
      unitName: "Basic Economic Concepts",
      totalMarks: 27, // 2 (Part A) + 10 (Part B) + 15 (Part C)
      weightagePercent: 23.48, // 27/115 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.1 (Part A)", marks: 2, text: "Why do economic problems arise?" },
        
        // Part B (10 marks)
        { qCode: "Q.1 (Part B)", marks: 10, text: "Explain the deductive and inductive methods of constructing economic theory." },
        
        // Part C (15 marks)
        { qCode: "Q.1 (Part C)", marks: 15, text: "What are the three methods of measuring national income? Elaborate." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Demand & Supply Analysis",
      totalMarks: 12, // 2 (Part A) + 10 (Part B)
      weightagePercent: 10.43, // 12/115 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.2 (Part A)", marks: 2, text: "What is demand forecasting?" },
        
        // Part B (10 marks)
        { qCode: "Q.6 (Part B)", marks: 10, text: "Explain the concept of elasticity of demand." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Production & Cost Analysis",
      totalMarks: 27, // 2 (Part A) + 10 (Part B) + 15 (Part C)
      weightagePercent: 23.48, // 27/115 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.3 (Part A)", marks: 2, text: "What does opportunity cost mean?" },
        
        // Part B (10 marks)
        { qCode: "Q.2 (Part B)", marks: 10, text: "Explain with the help of curves the relationship between total cost, total variable cost and total fixed cost." },
        
        // Part C (15 marks)
        { qCode: "Q.2 (Part C)", marks: 15, text: "Using suitable diagrams explain the Law of variable proportions." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Market Structure & Pricing Theory",
      totalMarks: 12, // 2 (Part A) + 10 (Part B)
      weightagePercent: 10.43, // 12/115 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.4 (Part A)", marks: 2, text: "What do you mean by monopolistic competition?" },
        
        // Part B (10 marks)
        { qCode: "Q.3 (Part B)", marks: 10, text: "How does perfect competition differ from monopoly? Discuss." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Financial Statement Analysis",
      totalMarks: 37, // 2 (Part A) + 20 (Part B) + 15 (Part C)
      weightagePercent: 32.17, // 37/115 * 100
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.5 (Part A)", marks: 2, text: "What does a balance sheet depicts?" },
        
        // Part B (10 marks each)
        { qCode: "Q.4 (Part B)", marks: 10, text: "Discuss the concepts of assets and liabilities." },
        { qCode: "Q.5 (Part B)", marks: 10, text: "Write short notes on comparative financial statements." },
        
        // Part C (15 marks)
        { qCode: "Q.3 (Part C)", marks: 15, text: "Critically examine the Present Value Method and Internal Rate of Return Method for evaluating capital budgeting proposals." }
      ]
    }
  ]
};

async function updateMEFA2019() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Managerial Economics & Financial Accounting subject
    const subject = await ExamAnalysis.findOne({ 
      subjectName: 'Managerial Economics and Financial Accounting' 
    });
    
    if (!subject) {
      console.log('❌ MEFA subject not found. Creating new entry...');
      
      await ExamAnalysis.create({
        subjectName: 'Managerial Economics and Financial Accounting',
        subjectCode: '3CS1-03',
        totalPaperMarks: 115,
        years: [mefaData2019]
      });
      
      console.log('✅ Created MEFA with 2019 data');
    } else {
      // Update totalPaperMarks
      subject.totalPaperMarks = 115;
      
      // Find and update 2019 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2019);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = mefaData2019;
        console.log('✅ Updated existing 2019 data');
      } else {
        subject.years.push(mefaData2019);
        console.log('✅ Added new 2019 data');
      }
      
      await subject.save();
      console.log('✅ Saved MEFA 2019 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ 
      subjectName: 'Managerial Economics and Financial Accounting' 
    });
    const year2019 = updatedSubject.years.find(y => y.year === 2019);
    
    console.log('\n📊 MEFA 2019 - ANALYSIS REPORT');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3CS1-03'}`);
    console.log(`Paper Code: 3E1103`);
    console.log(`Exam Date: ${year2019.examDate || 'December 2019'}`);
    console.log(`Total Available Marks: ${year2019.totalPaperMarks}`);
    console.log(`Maximum Attempt Marks: ${year2019.maxAttemptMarks}`);
    console.log(`Exam Duration: 2 Hours`);
    
    console.log('\n📋 UNIT-WISE WEIGHTAGE (Based on 115 Total Marks):');
    console.log('─────────────────────────────────────────────────────────────');
    
    let totalQuestionsMarks = 0;
    let totalQuestions = 0;
    
    year2019.units.forEach(unit => {
      const unitTotal = unit.questions.reduce((sum, q) => sum + q.marks, 0);
      const weightage = unit.weightagePercent || ((unit.totalMarks / 115) * 100);
      console.log(`\n  Unit ${unit.unitSerial}: ${unit.unitName}`);
      console.log(`    ├─ Total Marks: ${unit.totalMarks} marks`);
      console.log(`    ├─ Weightage: ${weightage.toFixed(2)}% of 115 marks`);
      console.log(`    ├─ Questions: ${unit.questions.length}`);
      console.log(`    └─ Verification: ${unitTotal} marks ${unitTotal === unit.totalMarks ? '✅' : '❌'}`);
      totalQuestionsMarks += unitTotal;
      totalQuestions += unit.questions.length;
    });
    
    console.log('\n═════════════════════════════════════════════════════════════');
    console.log(`✅ Total questions: ${totalQuestions}`);
    console.log(`✅ Total marks (sum): ${totalQuestionsMarks}`);
    console.log(`✅ Expected total: 115 marks ${totalQuestionsMarks === 115 ? '✅' : '❌'}`);
    
    console.log('\n📝 PAPER STRUCTURE:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('  Part A: 5 questions × 2 marks = 10 marks (All compulsory)');
    console.log('  Part B: 6 questions × 10 marks = 60 marks (Attempt any 4)');
    console.log('  Part C: 3 questions × 15 marks = 45 marks (Attempt any 2)');
    console.log('  ─────────────────────────────────────────────────────────');
    console.log(`  Total Available: 10 + 60 + 45 = 115 marks`);
    console.log(`  Maximum Attempt: 10 + 40 + 30 = 80 marks`);
    console.log('═════════════════════════════════════════════════════════════\n');

    // Unit-wise summary table
    console.log('📊 UNIT WEIGHTAGE SUMMARY TABLE:');
    console.log('┌──────┬────────────────────────────────────────────┬───────┬────────────┐');
    console.log('│ Unit │ Unit Name                                  │ Marks │ Weightage  │');
    console.log('├──────┼────────────────────────────────────────────┼───────┼────────────┤');
    year2019.units.forEach(unit => {
      const weightage = unit.weightagePercent || ((unit.totalMarks / 115) * 100);
      const name = unit.unitName.padEnd(42);
      const marks = String(unit.totalMarks).padStart(5);
      const weight = `${weightage.toFixed(2)}%`.padStart(9);
      console.log(`│  ${unit.unitSerial}   │ ${name} │ ${marks} │ ${weight} │`);
    });
    console.log('└──────┴────────────────────────────────────────────┴───────┴────────────┘\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

updateMEFA2019();
