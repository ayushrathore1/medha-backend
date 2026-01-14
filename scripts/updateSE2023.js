/**
 * Script to update Software Engineering 2023 exam analysis data
 * 
 * Paper Structure (Total 98 marks including optionals):
 * - Part A: 10 questions × 2 marks = 20 marks (Compulsory)
 * - Part B: 7 questions × 4 marks = 28 marks (Attempt any 5)
 * - Part C: 5 questions × 10 marks = 50 marks (Attempt any 3)
 * 
 * Unit-wise Weightage (out of 98):
 * - Unit 1: Introduction to SE, SDLC, V&V - 22 marks (22.45%)
 * - Unit 2: Project Management, Estimation - 22 marks (22.45%)
 * - Unit 3: Requirement Analysis, DFD, CFD, FSM - 18 marks (18.37%)
 * - Unit 4: Software Design - 14 marks (14.29%)
 * - Unit 5: Object-Oriented Analysis & UML - 22 marks (22.45%)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const softwareEngineering2023Data = {
  year: 2023,
  units: [
    {
      unitSerial: 1,
      unitName: "Introduction to Software Engineering and SDLC",
      totalMarks: 22,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.1", marks: 2, text: "What are the characteristics of good software?" },
        { qCode: "Part A Q.3", marks: 2, text: "What is SRS?" },
        { qCode: "Part A Q.5", marks: 2, text: "What is difference between verification and validation?" },
        { qCode: "Part A Q.9", marks: 2, text: "Differentiate application software with system software." },
        { qCode: "Part B Q.2", marks: 4, text: "Explain feasibility analysis in detail." },
        { qCode: "Part C Q.1", marks: 10, text: "Explain various software development life cycle models in detail." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Project Management and Estimation",
      totalMarks: 22,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.6", marks: 2, text: "What do you mean by effort estimation?" },
        { qCode: "Part A Q.7", marks: 2, text: "What do you mean by space complexity?" },
        { qCode: "Part B Q.3", marks: 4, text: "Explain COCOMO estimation model in detail." },
        { qCode: "Part B Q.6", marks: 4, text: "Explain LOC and FP estimation in detail." },
        { qCode: "Part C Q.4", marks: 10, text: "What do you mean by software project Management? What are issues that we consider in software project management? Explain in detail." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Requirement Analysis, DFD, CFD, and FSM",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part B Q.1", marks: 4, text: "What are the differences between data flow diagrams and control flow diagram? Explain." },
        { qCode: "Part B Q.5", marks: 4, text: "Explain finite state machine (FSM) models in detail." },
        { qCode: "Part C Q.3", marks: 10, text: "What is role of software requirement analysis phase? How it is done? Explain in detail." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Software Design",
      totalMarks: 14,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.8", marks: 2, text: "Explain Input-Process-Output cycle." },
        { qCode: "Part A Q.10", marks: 2, text: "Explain software design documentation." },
        { qCode: "Part C Q.2", marks: 10, text: "Explain various types of diagrams used in software design phase in detail." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Object-Oriented Analysis and UML",
      totalMarks: 22,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.2", marks: 2, text: "Write down the name of any four object oriented programming languages." },
        { qCode: "Part A Q.4", marks: 2, text: "What do you mean by Actor?" },
        { qCode: "Part B Q.4", marks: 4, text: "Explain unified modeling language in brief." },
        { qCode: "Part B Q.7", marks: 4, text: "Explain class and object relationships in detail." },
        { qCode: "Part C Q.5", marks: 10, text: "How can object oriented analysis be done during software development process? Explain in detail." }
      ]
    }
  ]
};

async function updateSoftwareEngineering2023() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Software Engineering subject
    const subject = await ExamAnalysis.findOne({ subjectName: 'Software Engineering' });
    
    if (!subject) {
      console.log('❌ Software Engineering subject not found. Creating new entry...');
      
      await ExamAnalysis.create({
        subjectName: 'Software Engineering',
        totalPaperMarks: 98,
        years: [softwareEngineering2023Data]
      });
      
      console.log('✅ Created Software Engineering with 2023 data');
    } else {
      subject.totalPaperMarks = 98;
      
      const yearIndex = subject.years.findIndex(y => y.year === 2023);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = softwareEngineering2023Data;
        console.log('✅ Updated existing 2023 data');
      } else {
        subject.years.push(softwareEngineering2023Data);
        console.log('✅ Added new 2023 data');
      }
      
      await subject.save();
      console.log('✅ Saved Software Engineering data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Software Engineering' });
    const year2023 = updatedSubject.years.find(y => y.year === 2023);
    
    console.log('\n📊 Verification:');
    console.log(`Total Paper Marks: ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2023.units.forEach(unit => {
      const questionsTotal = unit.questions.reduce((sum, q) => sum + q.marks, 0);
      console.log(`  Unit ${unit.unitSerial}: ${unit.unitName}`);
      console.log(`    - Total Marks: ${unit.totalMarks}`);
      console.log(`    - Questions: ${unit.questions.length}`);
      console.log(`    - Weightage: ${((unit.totalMarks / 98) * 100).toFixed(2)}%`);
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

updateSoftwareEngineering2023();
