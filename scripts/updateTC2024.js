/**
 * Script to update Technical Communication 2024 exam analysis data
 * Complete Analysis with Exact Questions
 * B.Tech. III-Sem. Examination, January/February 2024
 * Total Available Marks: 98
 * Paper Structure: Part A (10×2=20) + Part B (7×4=28) + Part C (5×10=50)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const tcData2024 = {
  year: 2024,
  examDate: "January/February 2024",
  totalPaperMarks: 98,
  maxAttemptMarks: 98,
  units: [
    {
      unitSerial: 1,
      unitName: "Introduction to Technical Communication",
      totalMarks: 18,
      weightagePercent: 18.37,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.1 (Part A)", marks: 2, text: "What are various aspects of technical communication?" },
        { qCode: "Q.2 (Part A)", marks: 2, text: "Write two importance of technical communication." },
        { qCode: "Q.3 (Part A)", marks: 2, text: "Define style in technical communication." },
        { qCode: "Q.10 (Part A)", marks: 2, text: "Write a short note on Linguistic Ability." },
        
        // Part C (10 marks)
        { qCode: "Q.2 (Part C)", marks: 10, text: "Describe various features of style in technical communication." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Comprehension of Technical Materials/Texts and Information Design & Development",
      totalMarks: 36,
      weightagePercent: 36.73,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.4 (Part A)", marks: 2, text: "What are various steps to read a technical text?" },
        { qCode: "Q.5 (Part A)", marks: 2, text: "List the benefits of note - making." },
        { qCode: "Q.6 (Part A)", marks: 2, text: "Name different technical texts." },
        
        // Part B (4 marks each)
        { qCode: "Q.1 (Part B)", marks: 4, text: "Explain ERRQ and SQ3R Reading Technique." },
        { qCode: "Q.2 (Part B)", marks: 4, text: "Reading makes a man complete francis Bacon. How can you develop effective reading skills?" },
        { qCode: "Q.3 (Part B)", marks: 4, text: "What is the process of reading a technical manual?" },
        { qCode: "Q.4 (Part B)", marks: 4, text: "Elaborate various ways to collect information." },
        { qCode: "Q.5 (Part B)", marks: 4, text: "Enlist various factors which affect designing of a document." },
        
        // Part C (10 marks)
        { qCode: "Q.1 (Part C)", marks: 10, text: "Explain various types of note-making." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Technical Writing, Grammar and Editing",
      totalMarks: 26,
      weightagePercent: 26.53,
      youtubePlaylistUrl: null,
      questions: [
        // Part A (2 marks each)
        { qCode: "Q.7 (Part A)", marks: 2, text: "Correct the following sentences. i) Both the sister were seen at the party. ii) She is one of the best student in our class." },
        { qCode: "Q.8 (Part A)", marks: 2, text: "Form two words by using the each prefix - in and - un." },
        { qCode: "Q.9 (Part A)", marks: 2, text: "Underline and rewrite the noun phrase in the following sentences. i) The cat with the stripes tried to trip me. ii) My green gym socks are in the hamper." },
        
        // Part C (10 marks each)
        { qCode: "Q.3 (Part C)", marks: 10, text: "Assume yourself as the cultural secretary, you are organizing an instrument playing programme in your Institute. Draft an e-mail informing all the teachers, students and staff members about the event and invite them to attend." },
        { qCode: "Q.4 (Part C)", marks: 10, text: "Assuming yourself a hostler, write minutes of the meeting, which you have attended with the hostel wardern and chief warden to improve the quality of food served in the hostel mess." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Advanced Technical Writing",
      totalMarks: 18,
      weightagePercent: 18.37,
      youtubePlaylistUrl: null,
      questions: [
        // Part B (4 marks each)
        { qCode: "Q.6 (Part B)", marks: 4, text: "What are various types of technical articles? Explain." },
        { qCode: "Q.7 (Part B)", marks: 4, text: "Enumerate the different characteristics of technical project proposal." },
        
        // Part C (10 marks)
        { qCode: "Q.5 (Part C)", marks: 10, text: "Prepare a report on the Campus placement Drive organized in your College on 12th Jan. 2023." }
      ]
    }
  ]
};

async function updateTC2024() {
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
        years: [tcData2024]
      });
      
      console.log('✅ Created TC with 2024 data');
    } else {
      // Update totalPaperMarks if needed
      if (!subject.totalPaperMarks || subject.totalPaperMarks !== 98) {
        subject.totalPaperMarks = 98;
      }
      
      // Find and update 2024 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2024);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = tcData2024;
        console.log('✅ Updated existing 2024 data');
      } else {
        subject.years.push(tcData2024);
        console.log('✅ Added new 2024 data');
      }
      
      await subject.save();
      console.log('✅ Saved TC 2024 data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ 
      subjectName: 'Technical Communication' 
    });
    const year2024 = updatedSubject.years.find(y => y.year === 2024);
    
    console.log('\n📊 TECHNICAL COMMUNICATION 2024 - ANALYSIS REPORT');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Subject Code: ${updatedSubject.subjectCode || '3CS1-07'}`);
    console.log(`Exam Date: ${year2024.examDate || 'January/February 2024'}`);
    console.log(`Total Paper Marks: ${year2024.totalPaperMarks}`);
    console.log(`Maximum Attempt Marks: ${year2024.maxAttemptMarks}`);
    
    console.log('\n📋 UNIT-WISE WEIGHTAGE (Based on 98 Total Marks):');
    console.log('─────────────────────────────────────────────────────────────');
    
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
    year2024.units.forEach(unit => {
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

updateTC2024();
