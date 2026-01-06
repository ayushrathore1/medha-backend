/**
 * Script to update Managerial Economics & Financial Accounting 2025 exam analysis data
 * Complete Analysis with Exact Questions
 * B.Tech. III-Sem. Examination, 2025
 * Total Available Marks: 98
 * Paper Structure: Part A (10×2=20) + Part B (7×4=28) + Part C (5×10=50)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const mefaData2025 = {
  year: 2025,
  examDate: "2025",
  totalPaperMarks: 98,
  maxAttemptMarks: 98,
  units: [
    {
      unitSerial: 1,
      unitName: "Basic Economic Concepts",
      totalMarks: 4,
      weightagePercent: 4.08,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.1 (Part A)", marks: 2, text: "Define Managerial Economics." },
        { qCode: "Q.5 (Part A)", marks: 2, text: "What is GDP?" }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Demand and Supply Analysis",
      totalMarks: 24,
      weightagePercent: 24.49,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.3 (Part A)", marks: 2, text: "Distinguish between demand curve and demand schedule." },
        { qCode: "Q.4 (Part A)", marks: 2, text: "What are Giffen goods?" },
        { qCode: "Q.8 (Part A)", marks: 2, text: "Define Elasticity." },
        
        // Part B (4 marks each)
        { qCode: "Q.2 (Part B)", marks: 4, text: "What are the determinants of demand?" },
        { qCode: "Q.4 (Part B)", marks: 4, text: "Explain the degrees of Price Elasticity of Demand." },
        
        // Part C (10 marks)
        { qCode: "Q.1 (Part C)", marks: 10, text: "What is Elasticity of Demand? And explain its types and measurement." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Production and Cost Analysis",
      totalMarks: 26,
      weightagePercent: 26.53,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.2 (Part A)", marks: 2, text: "What do you mean by Opportunity Cost?" },
        { qCode: "Q.7 (Part A)", marks: 2, text: "What is ISOQUANTS?" },
        
        // Part B (4 marks each)
        { qCode: "Q.1 (Part B)", marks: 4, text: "Explain 'Law of Returns to Scale'." },
        { qCode: "Q.6 (Part B)", marks: 4, text: "Distinguish between Explicit and Implicit costs?" },
        { qCode: "Q.7 (Part B)", marks: 4, text: "Given TFC as Rs. 40, find values of TVC, AC, AFC, and MC based on the given table." },
        
        // Part C (10 marks)
        { qCode: "Q.3 (Part C)", marks: 10, text: "Using suitable diagrams, explain the Law of Variable Proportions." }
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
        { qCode: "Q.6 (Part A)", marks: 2, text: "Define Monopoly." },
        
        // Part B (4 marks)
        { qCode: "Q.3 (Part B)", marks: 4, text: "What is Oligopoly? What are its features?" },
        
        // Part C (10 marks)
        { qCode: "Q.2 (Part C)", marks: 10, text: "Explain the price output determination under Perfect competition." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Financial Statement Analysis",
      totalMarks: 28,
      weightagePercent: 28.57,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.9 (Part A)", marks: 2, text: "What is Pay-back Period?" },
        { qCode: "Q.10 (Part A)", marks: 2, text: "What is Profitability Ratio?" },
        
        // Part B (4 marks)
        { qCode: "Q.5 (Part B)", marks: 4, text: "Write a short note on Cash Flow Analysis." },
        
        // Part C (10 marks each)
        { qCode: "Q.4 (Part C)", marks: 10, text: "Write a short note on - (i) Marginal Cost (ii) Net Present Value Method (iii) Proprietary Ratio (iv) Internal Rate of Return (v) Working Capital" },
        { qCode: "Q.5 (Part C)", marks: 10, text: "The Balance Sheet of Punjab Auto Limited as on 31-12-2002. From the above, compute (a) The Current Ratio, (b) Quick Ratio, (c) Debt-Equity Ratio, and (d) Proprietary Ratio." }
      ]
    }
  ]
};

async function updateMEFA2025() {
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
        years: [mefaData2025]
      });
      
      console.log('✅ Created MEFA with 2025 data');
    } else {
      // Update totalPaperMarks if needed
      if (!subject.totalPaperMarks || subject.totalPaperMarks !== 98) {
        subject.totalPaperMarks = 98;
      }
      
      // Find and update 2025 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2025);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = mefaData2025;
        console.log('✅ Updated existing 2025 data');
      } else {
        subject.years.push(mefaData2025);
        console.log('✅ Added new 2025 data');
      }
      
      await subject.save();
      console.log('✅ Saved MEFA 2025 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ 
      subjectName: 'Managerial Economics and Financial Accounting' 
    });
    const year2025 = updatedSubject.years.find(y => y.year === 2025);
    
    console.log('\n📊 MEFA 2025 - ANALYSIS REPORT');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3CS1-03'}`);
    console.log(`Exam Year: ${year2025.year}`);
    console.log(`Total Paper Marks: ${year2025.totalPaperMarks}`);
    console.log(`Maximum Attempt Marks: ${year2025.maxAttemptMarks}`);
    
    console.log('\n📋 UNIT-WISE WEIGHTAGE (Based on 98 Total Marks):');
    console.log('─────────────────────────────────────────────────────────────');
    
    let totalQuestionsMarks = 0;
    let totalQuestions = 0;
    
    year2025.units.forEach(unit => {
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
    year2025.units.forEach(unit => {
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

updateMEFA2025();
