/**
 * Script to update Technical Communication 2025 exam analysis data
 * Complete Analysis with Exact Questions
 * B.Tech. III-Sem. Examination, January 2025
 * Total Available Marks: 98
 * Paper Structure: Part A (10×2=20) + Part B (7×4=28) + Part C (5×10=50)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const tcData2025 = {
  year: 2025,
  examDate: "January 2025",
  totalPaperMarks: 98,
  maxAttemptMarks: 98,
  units: [
    {
      unitSerial: 1,
      unitName: "Introduction to Technical Communication",
      totalMarks: 20,
      weightagePercent: 20.41,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.3 (Part A)", marks: 2, text: "What are linguistic abilities?" },
        { qCode: "Q.6 (Part A)", marks: 2, text: "How to avoid the problem of style in technical writing?" },
        { qCode: "Q.8 (Part A)", marks: 2, text: "Do you think listening is important in communication? Why?" },
        
        // Part B (4 marks)
        { qCode: "Q.2 (Part B)", marks: 4, text: "Write a note on the importance of LSRW skills in technical communication" },
        
        // Part C (10 marks)
        { qCode: "Q.5 (Part C)", marks: 10, text: "Do you think style in technical communication is important? Give valid reasons for your answer with proper examples." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Comprehension of Technical Materials/Texts and Information Design & Development",
      totalMarks: 10,
      weightagePercent: 10.20,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.4 (Part A)", marks: 2, text: "What is bubble-mapping?" },
        { qCode: "Q.7 (Part A)", marks: 2, text: "Elucidate few differences in writing style for print and online media." },
        { qCode: "Q.9 (Part A)", marks: 2, text: "Which factors affect document design?" },
        
        // Part B (4 marks)
        { qCode: "Q.3 (Part B)", marks: 4, text: "Explain the different methods of note making in detail." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Technical Writing, Grammar and Editing",
      totalMarks: 52,
      weightagePercent: 53.06,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.1 (Part A)", marks: 2, text: "Why is editing important in Technical communication?" },
        { qCode: "Q.2 (Part A)", marks: 2, text: "What are the three stages of writing?" },
        { qCode: "Q.10 (Part A)", marks: 2, text: "What is the difference between CV and linkedin profile?" },
        
        // Part B (4 marks each)
        { qCode: "Q.1 (Part B)", marks: 4, text: "The principle of ABCS in technical writing enhances the effectiveness of a technical document. Elaborate." },
        { qCode: "Q.4 (Part B)", marks: 4, text: "Correct the following sentences: i) Their going to the store should of been done yesterday. ii) My brother's all the books are been stolen. iii) She doesn't listen me. iv) Make sure that it is a high pay job" },
        { qCode: "Q.6 (Part B)", marks: 4, text: "Define memorandum and write the format of a memo." },
        { qCode: "Q.7 (Part B)", marks: 4, text: "What are the three stages for writing minutes of a meeting?" },
        
        // Part C (10 marks each)
        { qCode: "Q.1 (Part C)", marks: 10, text: "You are interested in working in the UAE. Write a job application with CV for the advertised post of an engineer at Emaar Properties, Dubai." },
        { qCode: "Q.2 (Part C)", marks: 10, text: "RTU, kota is planning to take a group of 120 students to shimla on an educational excursion. Write a letter to Tours and Travels, kota asking them to organize the tour with details of preference." },
        { qCode: "Q.4 (Part C)", marks: 10, text: "Describe the various forms of Technical discourse in detail." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Advanced Technical Writing",
      totalMarks: 16,
      weightagePercent: 16.33,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks)
        { qCode: "Q.5 (Part A)", marks: 2, text: "Name few characteristics of Technical Reports." },
        
        // Part B (4 marks)
        { qCode: "Q.5 (Part B)", marks: 4, text: "What are the different types of proposals? Discuss in detail." },
        
        // Part C (10 marks)
        { qCode: "Q.3 (Part C)", marks: 10, text: "Write short notes on the following: a) Formal and Non-formal proposals. b) Routine and special reports. c) 40-20-40 writing process structure. d) Characteristics of Technical Reports." }
      ]
    }
  ]
};

async function updateTC2025() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Technical Communication subject
    const subject = await ExamAnalysis.findOne({ 
      subjectName: 'Technical Communication' 
    });
    
    if (!subject) {
      console.log('❌ TC subject not found. Creating new entry...');
      
      await ExamAnalysis.create({
        subjectName: 'Technical Communication',
        subjectCode: '3CS1-07',
        totalPaperMarks: 98,
        years: [tcData2025]
      });
      
      console.log('✅ Created TC with 2025 data');
    } else {
      // Update totalPaperMarks if needed
      if (!subject.totalPaperMarks || subject.totalPaperMarks !== 98) {
        subject.totalPaperMarks = 98;
      }
      
      // Find and update 2025 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2025);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = tcData2025;
        console.log('✅ Updated existing 2025 data');
      } else {
        subject.years.push(tcData2025);
        console.log('✅ Added new 2025 data');
      }
      
      await subject.save();
      console.log('✅ Saved TC 2025 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ 
      subjectName: 'Technical Communication' 
    });
    const year2025 = updatedSubject.years.find(y => y.year === 2025);
    
    console.log('\n📊 TECHNICAL COMMUNICATION 2025 - ANALYSIS REPORT');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3CS1-07'}`);
    console.log(`Exam Date: ${year2025.examDate || 'January 2025'}`);
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
    console.log('┌──────┬────────────────────────────────────────────────────────────────┬───────┬────────────┐');
    console.log('│ Unit │ Unit Name                                                      │ Marks │ Weightage  │');
    console.log('├──────┼────────────────────────────────────────────────────────────────┼───────┼────────────┤');
    year2025.units.forEach(unit => {
      const weightage = unit.weightagePercent || ((unit.totalMarks / 98) * 100);
      const name = unit.unitName.padEnd(62);
      const marks = String(unit.totalMarks).padStart(5);
      const weight = `${weightage.toFixed(2)}%`.padStart(9);
      console.log(`│  ${unit.unitSerial}   │ ${name} │ ${marks} │ ${weight} │`);
    });
    console.log('└──────┴────────────────────────────────────────────────────────────────┴───────┴────────────┘\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

updateTC2025();
