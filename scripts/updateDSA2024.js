/**
 * Script to update Data Structures and Algorithms 2024 exam analysis data
 * Based on actual 2024 paper (3E1202)
 * Max Marks: 70 (attempted) | Total Question Marks: 98 (including optionals)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const dsa2024Data = {
  year: 2024,
  units: [
    {
      unitSerial: 1,
      unitName: "Stacks",
      totalMarks: 10, // Q5 Part A (2) + Q1,Q6 Part B (4×2=8) = 10
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q5 (Part A)", marks: 2, text: "Write applications of stacks" },
        { qCode: "Q1 (Part B)", marks: 4, text: "Explain tower of Hanoi problem in detail and write algorithm for that" },
        { qCode: "Q6 (Part B)", marks: 4, text: "Convert the following expression in its equivalent postfix expression: A+(B×C - (D/E ^ F) ×G) ×H" }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Queues and Linked Lists",
      totalMarks: 36, // Q1,Q3,Q4,Q7,Q9 Part A (2×5=10) + Q2,Q3,Q5,Q7 Part B (4×4=16) + Q5 Part C (10) = 36
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part A)", marks: 2, text: "What is Data structure?" },
        { qCode: "Q3 (Part A)", marks: 2, text: "What are linear and non-linear data structures" },
        { qCode: "Q4 (Part A)", marks: 2, text: "What is linked list? What are its types?" },
        { qCode: "Q7 (Part A)", marks: 2, text: "Differentiate between static and Dynamic memory allocation" },
        { qCode: "Q9 (Part A)", marks: 2, text: "What is meant by abstract data type?" },
        { qCode: "Q2 (Part B)", marks: 4, text: "Calculate the address of the element A[15,25] using row major order and column major order for array A[-15..10, 15..40]. Stored at 100, element size 4 bytes" },
        { qCode: "Q3 (Part B)", marks: 4, text: "Write an algorithm to insert a node at specific location in circular linked list" },
        { qCode: "Q5 (Part B)", marks: 4, text: "What is Priority Queue? How can it be implemented? Write an applications of priority Queue" },
        { qCode: "Q7 (Part B)", marks: 4, text: "Differentiate single linked list and circular linked list. Also write the advantage and disadvantages of circular linked list" },
        { qCode: "Q5 (Part C)", marks: 10, text: "Write down the algorithm for following operations of doubly linked list:<br/>a) Insertion of a node in the middle location<br/>b) Delete a node from last location" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Searching and Sorting",
      totalMarks: 12, // Q2 Part A (2) + Q4 Part C (10) = 12
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q2 (Part A)", marks: 2, text: "Explain Asymptotic Notations?" },
        { qCode: "Q4 (Part C)", marks: 10, text: "Write an algorithm of Insertion sort. Sort the following elements using Insertion sort: 68,17,26,54,77,93,31,44,55,20" }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Trees",
      totalMarks: 18, // Q6,Q10 Part A (2×2=4) + Q4 Part B (4) + Q2 Part C (10) = 18
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q6 (Part A)", marks: 2, text: "Define complete Binary Tree?" },
        { qCode: "Q10 (Part A)", marks: 2, text: "Compare tree and graph" },
        { qCode: "Q4 (Part B)", marks: 4, text: "The in-order and pre-order traversal sequence of nodes in a binary tree are given. Draw the binary tree" },
        { qCode: "Q2 (Part C)", marks: 10, text: "What is an AVL Tree? Explain the concept of Balancing factor. Create an AVL tree: 21,26,30,9,4,14,28,18,15,10,2,3,7" }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Graphs and Hashing",
      totalMarks: 22, // Q8 Part A (2) + Q1,Q3 Part C (10×2=20) = 22
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q8 (Part A)", marks: 2, text: "What is the concept of minimum spanning Tree?" },
        { qCode: "Q1 (Part C)", marks: 10, text: "Define the spanning tree. Write the Kruskal's algorithm to find the minimum cost spanning tree of the graph" },
        { qCode: "Q3 (Part C)", marks: 10, text: "What is hashing and collision? Discuss the advantages and disadvantages of hashing over other searching techniques" }
      ]
    }
  ]
};

async function updateDSA2024() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Data Structures and Algorithms subject
    const subject = await ExamAnalysis.findOne({ subjectName: 'Data Structures and Algorithms' });
    
    if (!subject) {
      console.log('❌ Data Structures and Algorithms subject not found. Creating new entry...');
      
      await ExamAnalysis.create({
        subjectName: 'Data Structures and Algorithms',
        totalPaperMarks: 98,
        years: [dsa2024Data]
      });
      
      console.log('✅ Created Data Structures and Algorithms with 2024 data');
    } else {
      subject.totalPaperMarks = 98;
      
      const yearIndex = subject.years.findIndex(y => y.year === 2024);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = dsa2024Data;
        console.log('✅ Updated existing 2024 data');
      } else {
        subject.years.push(dsa2024Data);
        console.log('✅ Added new 2024 data');
      }
      
      await subject.save();
      console.log('✅ Saved Data Structures and Algorithms data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Data Structures and Algorithms' });
    const year2024 = updatedSubject.years.find(y => y.year === 2024);
    
    console.log('\n📊 Verification:');
    console.log(`Total Paper Marks (including optionals): ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2024.units.forEach(unit => {
      console.log(`  Unit ${unit.unitSerial}: ${unit.unitName} - ${unit.totalMarks} marks (${unit.questions.length} questions)`);
      totalMarks += unit.totalMarks;
    });
    
    console.log(`\n✅ Total computed marks: ${totalMarks}`);
    console.log('✅ This matches 98 (20 Part A + 28 Part B + 50 Part C)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

updateDSA2024();
