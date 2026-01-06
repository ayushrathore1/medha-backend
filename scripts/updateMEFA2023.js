/**
 * Script to update Managerial Economics & Financial Accounting 2023 exam analysis data
 * Complete Analysis with Exact Questions
 * B.Tech. III-Sem. Examination, February 2023
 * Total Available Marks: 98
 * Paper Structure: Part A (10×2=20) + Part B (7×4=28) + Part C (5×10=50)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const mefaData2023 = {
  year: 2023,
  examDate: "February 2023",
  totalPaperMarks: 98,
  maxAttemptMarks: 98, // All questions attempted
  units: [
    {
      unitSerial: 1,
      unitName: "Basic Economic Concepts",
      totalMarks: 22,
      weightagePercent: 22.45,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.1 (Part A)", marks: 2, text: "Define Managerial Economics." },
        { qCode: "Q.2 (Part A)", marks: 2, text: "Define National Income." },
        
        // Part B (4 marks each)
        { qCode: "Q.1 (Part B)", marks: 4, text: "Distinguish between deductive and inductive methods in Economics." },
        { qCode: "Q.2 (Part B)", marks: 4, text: "Discuss the various concepts of national income – Gross National Products, Net National Products, Personal Income and Disposable Income." },
        
        // Part C (10 marks)
        { qCode: "Q.2 (Part C)", marks: 10, text: "Discuss the nature and scope of Managerial Economics." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Demand and Supply Analysis",
      totalMarks: 12,
      weightagePercent: 12.24,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.3 (Part A)", marks: 2, text: "What do you mean by Law of Demand?" },
        { qCode: "Q.4 (Part A)", marks: 2, text: "Define price elasticity of demand." },
        
        // Part B (4 marks each)
        { qCode: "Q.3 (Part B)", marks: 4, text: "Explain the various methods of demand forecasting." },
        { qCode: "Q.5 (Part B)", marks: 4, text: "Explain the degrees of price elasticity of demand." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Production and Cost Analysis",
      totalMarks: 18,
      weightagePercent: 18.37,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.5 (Part A)", marks: 2, text: "Define Production Function." },
        { qCode: "Q.6 (Part A)", marks: 2, text: "What is opportunity cost?" },
        
        // Part B (4 marks)
        { qCode: "Q.6 (Part B)", marks: 4, text: "The following table gives the total cost schedule of the firm. It is also given that the Average Fixed Cost (AFC) at 4 units of output is 5. Find the Total Variable Cost (TVC) and Total Fixed Cost (TFC) schedules of the firm for the corresponding values of output." },
        
        // Part C (10 marks)
        { qCode: "Q.3 (Part C)", marks: 10, text: "Explain the Law of Variable Proportions. Explain various stages of this law with the help of diagram." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Market Structure and Pricing Theory",
      totalMarks: 16,
      weightagePercent: 16.33,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.7 (Part A)", marks: 2, text: "What do you mean by Monopoly?" },
        
        // Part B (4 marks)
        { qCode: "Q.4 (Part B)", marks: 4, text: "Distinguish between monopolistic competition and perfect competition." },
        
        // Part C (10 marks)
        { qCode: "Q.4 (Part C)", marks: 10, text: "How the price and output is determined under perfect competition during short period?" }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Financial Statement Analysis",
      totalMarks: 30,
      weightagePercent: 30.61,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.8 (Part A)", marks: 2, text: "Define Financial Statement Analysis." },
        { qCode: "Q.9 (Part A)", marks: 2, text: "What is Pay Back Period?" },
        { qCode: "Q.10 (Part A)", marks: 2, text: "Explain Debtors Turnover Ratio." },
        
        // Part B (4 marks)
        { qCode: "Q.7 (Part B)", marks: 4, text: "Define Balance Sheet. Give two characteristics of balance sheet." },
        
        // Part C (10 marks each)
        { qCode: "Q.1 (Part C)", marks: 10, text: "Calculate the following ratios from Balance Sheet of Riddhima Motors: (a) Current Ratio (b) Liquid Ratio/Quick Ratio (c) Debt Equity Ratio (d) Proprietary Ratio (e) Solvency Ratio" },
        { qCode: "Q.5 (Part C)", marks: 10, text: "A company has to select one of the two alternative projects. Compute Net Present Value (NPV) of each project and comment on the result." }
      ]
    }
  ]
};

async function updateMEFA2023() {
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
        totalPaperMarks: 98,
        years: [mefaData2023]
      });
      
      console.log('✅ Created MEFA with 2023 data');
    } else {
      // Update totalPaperMarks if needed
      if (!subject.totalPaperMarks || subject.totalPaperMarks !== 98) {
        subject.totalPaperMarks = 98;
      }
      
      // Find and update 2023 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2023);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = mefaData2023;
        console.log('✅ Updated existing 2023 data');
      } else {
        subject.years.push(mefaData2023);
        console.log('✅ Added new 2023 data');
      }
      
      await subject.save();
      console.log('✅ Saved MEFA 2023 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ 
      subjectName: 'Managerial Economics and Financial Accounting' 
    });
    const year2023 = updatedSubject.years.find(y => y.year === 2023);
    
    console.log('\n📊 MEFA 2023 - ANALYSIS REPORT');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3CS1-03'}`);
    console.log(`Exam Date: ${year2023.examDate || 'February 2023'}`);
    console.log(`Total Paper Marks: ${year2023.totalPaperMarks}`);
    console.log(`Maximum Attempt Marks: ${year2023.maxAttemptMarks}`);
    
    console.log('\n📋 UNIT-WISE WEIGHTAGE (Based on 98 Total Marks):');
    console.log('─────────────────────────────────────────────────────────────');
    
    let totalQuestionsMarks = 0;
    let totalQuestions = 0;
    
    year2023.units.forEach(unit => {
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
    
    console.log('\n═════════════════════════════════════════════════════════════');
    console.log(`✅ Total questions: ${totalQuestions}`);
    console.log(`✅ Total marks (sum): ${totalQuestionsMarks}`);
    console.log(`✅ Expected total: 98 marks ${totalQuestionsMarks === 98 ? '✅' : '❌'}`);
    
    console.log('\n📝 PAPER STRUCTURE:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('  Part A: 10 questions × 2 marks = 20 marks');
    console.log('  Part B: 7 questions × 4 marks = 28 marks');
    console.log('  Part C: 5 questions × 10 marks = 50 marks');
    console.log('  ─────────────────────────────────────────────────────────');
    console.log(`  Total: 20 + 28 + 50 = 98 marks`);
    console.log('═════════════════════════════════════════════════════════════\n');

    // Unit-wise summary table
    console.log('📊 UNIT WEIGHTAGE SUMMARY TABLE:');
    console.log('┌──────┬────────────────────────────────────────────┬───────┬────────────┐');
    console.log('│ Unit │ Unit Name                                  │ Marks │ Weightage  │');
    console.log('├──────┼────────────────────────────────────────────┼───────┼────────────┤');
    year2023.units.forEach(unit => {
      const weightage = unit.weightagePercent || ((unit.totalMarks / 98) * 100);
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

updateMEFA2023();
