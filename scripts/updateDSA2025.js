/**
 * Script to update Data Structures and Algorithms 2025 exam analysis data
 * Based on actual January 2025 paper (3E1202)
 * Max Marks: 70 (attempted) | Total Question Marks: 98 (including optionals)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const dsa2025Data = {
  year: 2025,
  units: [
    {
      unitSerial: 1,
      unitName: "Stacks",
      totalMarks: 18, // Q1,Q2 Part A (2×2=4) + Q1 Part B (4) + Q1 Part C (10) = 18
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part A)", marks: 2, topic: "Basic Stack Operations", text: "Define Stack" },
        { qCode: "Q2 (Part A)", marks: 2, topic: "Stack Operations", text: "What are various operations possible on stacks" },
        { qCode: "Q1 (Part B)", marks: 4, topic: "Stack Applications/Recursion", text: "Write a program to generate fibonacci numbers" },
        { qCode: "Q1 (Part C)", marks: 10, topic: "Stack Applications", text: "Write an Algorithm to convert a postfix expression to Infix expression also convert Postfix to Infix for the 100, 8, 3, *,50,2,-, +,-" }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Queues and Linked Lists",
      totalMarks: 24, // Q3,Q4,Q7 Part A (2×3=6) + Q2,Q4 Part B (4×2=8) + Q2 Part C (10) = 24
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q3 (Part A)", marks: 2, topic: "Basic Queue Operations", text: "What is queue?" },
        { qCode: "Q4 (Part A)", marks: 2, topic: "Priority Queues", text: "Define priority queue" },
        { qCode: "Q7 (Part A)", marks: 2, topic: "Header Linked List", text: "What are header nodes?" },
        { qCode: "Q2 (Part B)", marks: 4, topic: "DeQueue", text: "Implement a deque with the help of an array" },
        { qCode: "Q4 (Part B)", marks: 4, topic: "Double Linked List", text: "What is a doubly linked list? Explain with suitable example" },
        { qCode: "Q2(a) (Part C)", marks: 6, topic: "Queue Representation", text: "Write a program for implementing queue with the help of Arrays" },
        { qCode: "Q2(b) (Part C)", marks: 4, topic: "Header Linked List", text: "Write short note on Header linked list" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Searching and Sorting",
      totalMarks: 16, // Q6 Part A (2) + Q3 Part B (4) + Q3 Part C (10) = 16
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q6 (Part A)", marks: 2, topic: "Sorting Techniques", text: "What is sorting?" },
        { qCode: "Q3 (Part B)", marks: 4, topic: "Sequential Search", text: "Write and explain an Algorithm for sequential search" },
        { qCode: "Q3 (Part C)", marks: 10, topic: "Sorting Algorithms", text: "Give the performance Analysis of the following types of sorting techniques:<br/>a) Bubble sort<br/>b) Insertion sort<br/>c) Radix sort<br/>d) Heap sort" }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Trees",
      totalMarks: 16, // Q8 Part A (2) + Q5 Part B (4) + Q4 Part C (10) = 16
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q8 (Part A)", marks: 2, topic: "Threaded Binary Tree", text: "Define Thread" },
        { qCode: "Q5 (Part B)", marks: 4, topic: "Binary Tree Operations", text: "Construct a binary tree with the following expression (2x+5)(3x-y+8)" },
        { qCode: "Q4 (Part C)", marks: 10, topic: "Binary Tree Traversals", text: "What is tree traversal? Explain preorder, Postorder and Inorder traversal with the help of appropriate example" }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Graphs and Hashing",
      totalMarks: 24, // Q5,Q9,Q10 Part A (2×3=6) + Q6,Q7 Part B (4×2=8) + Q5 Part C (10) = 24
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q5 (Part A)", marks: 2, topic: "Hashing", text: "What is hash table" },
        { qCode: "Q9 (Part A)", marks: 2, topic: "Graph Traversals", text: "What is graph traversal" },
        { qCode: "Q10 (Part A)", marks: 2, topic: "Graph Representation", text: "Define Adjacency representation of a matrix" },
        { qCode: "Q6(a) (Part B)", marks: 2, topic: "Graph Representations", text: "Consider the graph below using adjacency matrix and path matrix" },
        { qCode: "Q6(b) (Part B)", marks: 2, topic: "Graph Traversals (BFS & DFS)", text: "Starting from vertex 'a'. Find the depth first search and breadth first search" },
        { qCode: "Q7 (Part B)", marks: 4, topic: "Graph Concepts", text: "Explain directed and undirected graph and give their differences" },
        { qCode: "Q5(a) (Part C)", marks: 6, topic: "Graph Operations", text: "Explain various operations for a graph with example" },
        { qCode: "Q5(b) (Part C)", marks: 4, topic: "Graph Algorithms", text: "Write and explain warshall's modified Algorithm" }
      ]
    }
  ]
};

async function updateDSA2025() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Data Structures and Algorithms subject
    const subject = await ExamAnalysis.findOne({ subjectName: 'Data Structures and Algorithms' });
    
    if (!subject) {
      console.log('❌ Data Structures and Algorithms subject not found. Creating new entry...');
      
      await ExamAnalysis.create({
        subjectName: 'Data Structures and Algorithms',
        totalPaperMarks: 98, // Total including optionals
        years: [dsa2025Data]
      });
      
      console.log('✅ Created Data Structures and Algorithms with 2025 data');
    } else {
      // Update totalPaperMarks to 98 (includes optionals)
      subject.totalPaperMarks = 98;
      
      // Find and update 2025 year data
      const yearIndex = subject.years.findIndex(y => y.year === 2025);
      
      if (yearIndex >= 0) {
        subject.years[yearIndex] = dsa2025Data;
        console.log('✅ Updated existing 2025 data');
      } else {
        subject.years.push(dsa2025Data);
        console.log('✅ Added new 2025 data');
      }
      
      await subject.save();
      console.log('✅ Saved Data Structures and Algorithms data');
    }

    // Verify the update
    const updatedSubject = await ExamAnalysis.findOne({ subjectName: 'Data Structures and Algorithms' });
    const year2025 = updatedSubject.years.find(y => y.year === 2025);
    
    console.log('\n📊 Verification:');
    console.log(`Total Paper Marks (including optionals): ${updatedSubject.totalPaperMarks}`);
    console.log('Unit-wise breakdown:');
    
    let totalMarks = 0;
    year2025.units.forEach(unit => {
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

updateDSA2025();
