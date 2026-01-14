/**
 * Script to update Software Engineering January 2025 exam analysis data
 * 
 * Paper Structure (Total 98 marks including optionals):
 * - Part A: 10 questions × 2 marks = 20 marks (Compulsory)
 * - Part B: 7 questions × 4 marks = 28 marks (Attempt any 5)
 * - Part C: 5 questions × 10 marks = 50 marks (Attempt any 3)
 * 
 * Unit-wise Weightage (out of 98):
 * - Unit 1: Introduction to SE, SDLC Models - 40 marks (40.82%)
 * - Unit 2: Project Management, Risk Analysis - 6 marks (6.12%)
 * - Unit 3: System Analysis, DFD, CFD - 16 marks (16.33%)
 * - Unit 4: Software Design, Coupling, Cohesion - 20 marks (20.41%)
 * - Unit 5: Object-Oriented Concepts, UML - 16 marks (16.33%)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const softwareEngineering2025Data = {
  year: 2025,
  units: [
    {
      unitSerial: 1,
      unitName: "Introduction to Software Engineering and SDLC Models",
      totalMarks: 40,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.1", marks: 2, text: "State any four attributes of good software." },
        { qCode: "Part A Q.2", marks: 2, text: "Define software quality assurance." },
        { qCode: "Part A Q.3", marks: 2, text: "Define the term software security." },
        { qCode: "Part A Q.4", marks: 2, text: "What is prime objective of software engineering." },
        { qCode: "Part A Q.8", marks: 2, text: "Distinguish process and Method." },
        { qCode: "Part A Q.9", marks: 2, text: "Define SRS." },
        { qCode: "Part A Q.10", marks: 2, text: "Define software Engineering paradigm." },
        { qCode: "Part B Q.1", marks: 4, text: "What is SDLC. Explain MIS Oriented SDLC MODEL." },
        { qCode: "Part B Q.3", marks: 4, text: "Explain water fall model and spiral model with real time example." },
        { qCode: "Part B Q.4", marks: 4, text: "List and explain the Technique to Enhance software quality and software Reliability." },
        { qCode: "Part B Q.7", marks: 4, text: "What are the approaches of Debugging." },
        { qCode: "Part C Q.5", marks: 10, text: "Write short notes on: (a) System specification (b) Software prototyping (c) Incremental model (d) V-model" }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Project Management and Risk Analysis",
      totalMarks: 6,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.6", marks: 2, text: "Explain the term \"Risk analysis\"." },
        { qCode: "Part B Q.5", marks: 4, text: "COCOMO numerical (200 KLOC…)" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "System Analysis, DFD, and CFD",
      totalMarks: 16,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.5", marks: 2, text: "Why accuracy is Important attributes for data dictionaries." },
        { qCode: "Part B Q.6", marks: 4, text: "Explain Finite state machine (FSM)." },
        { qCode: "Part C Q.3", marks: 10, text: "Explain control flow diagram (CFD) & data flow diagram (DFD) in Detail." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Software Design, Coupling, and Cohesion",
      totalMarks: 20,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part C Q.1", marks: 10, text: "What are the characteristics of a good design? Describe different type of coupling and Cohesion. How is designed performed?" },
        { qCode: "Part C Q.4", marks: 10, text: "Explain following concept with example modularity and step wise refinement and information hiding." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Object-Oriented Concepts and UML",
      totalMarks: 16,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.7", marks: 2, text: "Differentiate object-oriented Analysis (OOA) & Object oriented design (OOD)." },
        { qCode: "Part B Q.2", marks: 4, text: "What is UML. How it is Beneficial in object oriented Model." },
        { qCode: "Part C Q.2", marks: 10, text: "Explain the following: (a) Use case diagram (b) State chart diagram" }
      ]
    }
  ]
};

async function updateSoftwareEngineering2025() {
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
        years: [softwareEngineering2025Data]
      });
      
      console.log('✅ Created Software Engineering with 2025 data');
    } else {
      subject.totalPaperMarks = 98;
      
      const yearIndex = subject.years.findIndex(y => y.year === 2025);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = softwareEngineering2025Data;
        console.log('✅ Updated existing 2025 data');
      } else {
        subject.years.push(softwareEngineering2025Data);
        console.log('✅ Added new 2025 data');
      }
      
      await subject.save();
      console.log('✅ Saved Software Engineering data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Software Engineering' });
    const year2025 = updatedSubject.years.find(y => y.year === 2025);
    
    console.log('\n📊 Verification:');
    console.log(`Total Paper Marks: ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2025.units.forEach(unit => {
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

updateSoftwareEngineering2025();
