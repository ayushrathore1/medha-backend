/**
 * Script to update Software Engineering 2024 exam analysis data
 * 
 * Paper Structure (Total 98 marks including optionals):
 * - Part A: 10 questions × 2 marks = 20 marks (Compulsory)
 * - Part B: 7 questions × 4 marks = 28 marks (Attempt any 5)
 * - Part C: 5 questions × 10 marks = 50 marks (Attempt any 3)
 * 
 * Unit-wise Weightage (out of 98):
 * - Unit 1: Introduction to SE, SDLC Models - 22 marks (22.45%)
 * - Unit 2: Project Management, Estimation - 18 marks (18.37%)
 * - Unit 3: System Analysis, DFD, CFD, FSM - 22 marks (22.45%)
 * - Unit 4: Software Design, Coupling, Cohesion - 18 marks (18.37%)
 * - Unit 5: Object-Oriented Concepts, UML - 18 marks (18.37%)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const softwareEngineering2024Data = {
  year: 2024,
  units: [
    {
      unitSerial: 1,
      unitName: "Introduction to Software Engineering and SDLC Models",
      totalMarks: 22,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.1", marks: 2, text: "Define software. Enlist the characteristics of good software." },
        { qCode: "Part A Q.3", marks: 2, text: "What is SRS?" },
        { qCode: "Part B Q.1", marks: 4, text: "What are the difference between verification and validation. Explain it with proper diagram and Example." },
        { qCode: "Part B Q.5", marks: 4, text: "Explain Software Development life cycle model with appropriate diagram." },
        { qCode: "Part C Q.1", marks: 10, text: "Explain spiral model of software Development with a labelled diagram, state advantages and disadvantages of spiral model." }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Project Management and Estimation",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.2", marks: 2, text: "Give the difference between FP and LOC." },
        { qCode: "Part A Q.9", marks: 2, text: "Explain the term Risk Analysis. Enlist Four major categories of Risk analysis." },
        { qCode: "Part B Q.7", marks: 4, text: "Suppose that a project was estimated to be 400 KLOC. Calculate effort and time for each of three modes of development." },
        { qCode: "Part C Q.5", marks: 10, text: "Compute the function point productivity, documentation, cost per function for the given data." }
      ]
    },
    {
      unitSerial: 3,
      unitName: "System Analysis, DFD, CFD, and FSM",
      totalMarks: 22,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.4", marks: 2, text: "Explain FSM model." },
        { qCode: "Part A Q.5", marks: 2, text: "Why accuracy is important attribute for a data dictionaries." },
        { qCode: "Part B Q.3", marks: 4, text: "Give the difference between DFD and CFD with proper example and diagram." },
        { qCode: "Part B Q.6", marks: 4, text: "What is prototyping? Give the sequence of events needed in prototyping." },
        { qCode: "Part C Q.2", marks: 10, text: "What do you mean by DFD. Explain its type with proper diagram. Draw 0' level and 1-level DFD for college Registration system." }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Software Design, Coupling, and Cohesion",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.6", marks: 2, text: "What is software Design. Write any Four Design principles." },
        { qCode: "Part A Q.7", marks: 2, text: "What is Input / Process / Output (IPO) approach in S/W Design." },
        { qCode: "Part B Q.4", marks: 4, text: "What is a good Software Design? Explain the Design Documentation with example." },
        { qCode: "Part C Q.3", marks: 10, text: "Explain Effective modular design in terms of cohesion and coupling with all its types and diagram." }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Object-Oriented Concepts and UML",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Part A Q.8", marks: 2, text: "What do you mean by OO concept. Write 3 OO principles." },
        { qCode: "Part A Q.10", marks: 2, text: "Differentiate between object oriented analysis (OOA) and Object Oriented Design (OOD)." },
        { qCode: "Part B Q.2", marks: 4, text: "Write a short note on Object Oriented Design concepts." },
        { qCode: "Part C Q.4", marks: 10, text: "Define the term UML. How it is useful in object oriented modeling. Explain the following in context of UML: (i) Use case diagram (ii) State chart diagram." }
      ]
    }
  ]
};

async function updateSoftwareEngineering2024() {
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
        years: [softwareEngineering2024Data]
      });
      
      console.log('✅ Created Software Engineering with 2024 data');
    } else {
      subject.totalPaperMarks = 98;
      
      const yearIndex = subject.years.findIndex(y => y.year === 2024);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = softwareEngineering2024Data;
        console.log('✅ Updated existing 2024 data');
      } else {
        subject.years.push(softwareEngineering2024Data);
        console.log('✅ Added new 2024 data');
      }
      
      await subject.save();
      console.log('✅ Saved Software Engineering data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Software Engineering' });
    const year2024 = updatedSubject.years.find(y => y.year === 2024);
    
    console.log('\n📊 Verification:');
    console.log(`Total Paper Marks: ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2024.units.forEach(unit => {
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

updateSoftwareEngineering2024();
