/**
 * Script to update Technical Communication 2023 exam analysis data
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

const tcData2023 = {
  year: 2023,
  examDate: "February 2023",
  totalPaperMarks: 98,
  maxAttemptMarks: 98,
  units: [
    {
      unitSerial: 1,
      unitName: "Introduction to Technical Communication",
      totalMarks: 34,
      weightagePercent: 34.69,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.1 (Part A)", marks: 2, text: "What are the four main features of technical communication?" },
        { qCode: "Q.2 (Part A)", marks: 2, text: "What are linguistic abilities?" },
        { qCode: "Q.8 (Part A)", marks: 2, text: "How can you improve your Speaking Skills?" },
        { qCode: "Q.9 (Part A)", marks: 2, text: "What is the difference between Listening and Hearing?" },
        { qCode: "Q.10 (Part A)", marks: 2, text: "Why is reading important for improving Communication Skills?" },
        
        // Part B (4 marks)
        { qCode: "Q.1 (Part B)", marks: 4, text: "Discuss the aspects of Technical Communication in detail." },
        
        // Part C (10 marks each)
        { qCode: "Q.1 (Part C)", marks: 10, text: "What is Style in Technical communication? Explain the guidelines for writing a good technical document." },
        { qCode: "Q.2 (Part C)", marks: 10, text: "Define the term technical communication. Explain the process (cycle) of communication in detail." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Comprehension of Technical Materials/Texts and Information Design & Development",
      totalMarks: 16,
      weightagePercent: 16.33,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.3 (Part A)", marks: 2, text: "Name the different types of manuals?" },
        { qCode: "Q.4 (Part A)", marks: 2, text: "Which is more reliable- Print Media or Online Media? Why?" },
        { qCode: "Q.5 (Part A)", marks: 2, text: "What is the meaning of document design?" },
        
        // Part C (10 marks)
        { qCode: "Q.4 (Part C)", marks: 10, text: "Describe the factor which influence information and document design." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Technical Writing, Grammar and Editing",
      totalMarks: 26,
      weightagePercent: 26.53,
      youtubePlaylistUrl: null,
      questions: [
        // Part B (4 marks each)
        { qCode: "Q.4 (Part B)", marks: 4, text: "Discuss the difference between agenda and minutes of meeting. What are the objectives of agenda?" },
        { qCode: "Q.5 (Part B)", marks: 4, text: "Correct the following sentences: (1) She always felt inferior than her younger sister. (2) I have visited Niagara Falls last weekend. (3) The woman which works here is from Rajasthan (4) She's married with a dentist." },
        { qCode: "Q.6 (Part B)", marks: 4, text: "Explain the form/format/ structure/ style of writing Official Notes." },
        { qCode: "Q.7 (Part B)", marks: 4, text: "What are some strategies for an effective editing and proofreading?" },
        
        // Part C (10 marks)
        { qCode: "Q.5 (Part C)", marks: 10, text: "Evaluate your education, professional training, skills, accomplishments and achievement, interest/ activities and experience. Write a resume for the post of computer executive." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Advanced Technical Writing",
      totalMarks: 22,
      weightagePercent: 22.45,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.6 (Part A)", marks: 2, text: "What are the steps in Technical Proposal Writing?" },
        { qCode: "Q.7 (Part A)", marks: 2, text: "Mention the types of technical article." },
        
        // Part B (4 marks each)
        { qCode: "Q.2 (Part B)", marks: 4, text: "Draft a report on various curricular and co-curricular activities organized in your department/college to be published on RTU website." },
        { qCode: "Q.3 (Part B)", marks: 4, text: "There is no canteen in your company. Write a proposal to establish a canteen in your College/Institute." },
        
        // Part C (10 marks)
        { qCode: "Q.3 (Part C)", marks: 10, text: "What is a Technical Report? Explain in detail about the type, characteristic and objectives of Technical Report." }
      ]
    }
  ]
};

async function updateTC2023() {
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
        years: [tcData2023]
      });
      
      console.log('✅ Created TC with 2023 data');
    } else {
      // Update totalPaperMarks if needed
      if (!subject.totalPaperMarks || subject.totalPaperMarks !== 98) {
        subject.totalPaperMarks = 98;
      }
      
      // Find and update 2023 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2023);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = tcData2023;
        console.log('✅ Updated existing 2023 data');
      } else {
        subject.years.push(tcData2023);
        console.log('✅ Added new 2023 data');
      }
      
      await subject.save();
      console.log('✅ Saved TC 2023 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ 
      subjectName: 'Technical Communication' 
    });
    const year2023 = updatedSubject.years.find(y => y.year === 2023);
    
    console.log('\n📊 TECHNICAL COMMUNICATION 2023 - ANALYSIS REPORT');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3CS1-07'}`);
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
    console.log('┌──────┬────────────────────────────────────────────────────────────────┬───────┬────────────┐');
    console.log('│ Unit │ Unit Name                                                      │ Marks │ Weightage  │');
    console.log('├──────┼────────────────────────────────────────────────────────────────┼───────┼────────────┤');
    year2023.units.forEach(unit => {
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

updateTC2023();
