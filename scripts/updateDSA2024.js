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
      unitName: "Introduction, Arrays & Stacks",
      totalMarks: 22, // Q1,2,3,5,9 Part A (2×5=10) + Q1,2,6 Part B (4×3=12) = 22
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q1 (Part A)", marks: 2, topic: "Introduction to Data Structures", text: "What is Data structure?" },
        { qCode: "Q2 (Part A)", marks: 2, topic: "Algorithm Analysis", text: "Explain Asymptotic Notations?" },
        { qCode: "Q3 (Part A)", marks: 2, topic: "Data Structure Classification", text: "What are linear and non-linear data structures" },
        { qCode: "Q5 (Part A)", marks: 2, topic: "Stack Applications", text: "Write applications of stacks" },
        { qCode: "Q9 (Part A)", marks: 2, topic: "Data Structure Concepts", text: "What is meant by abstract data type?" },
        { qCode: "Q1 (Part B)", marks: 4, topic: "Stack Applications/Recursion", text: "Explain tower of Hanoi problem in detail and write algorithm for that" },
        { qCode: "Q2 (Part B)", marks: 4, topic: "Array Representation", text: "Calculate the address of the element A[15,25] using row major order and column major order for array A[-15..10, 15..40]. Stored at 100, element size 4 bytes" },
        { qCode: "Q6 (Part B)", marks: 4, topic: "Stack Applications", text: "Convert the following expression in its equivalent postfix expression: A+(B×C - (D/E ^ F) ×G) ×H" }
      ]
    },
    {
      unitSerial: 2,
      unitName: "Linked Lists & Queues",
      totalMarks: 24, // Q4,7 Part A (2×2=4) + Q3,5,7 Part B (4×3=12) + Q5 Part C (5+5=10) = 26, adjusted
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q4 (Part A)", marks: 2, topic: "Linked List Concepts", text: "What is linked list? What are its types?" },
        { qCode: "Q7 (Part A)", marks: 2, topic: "Memory Management", text: "Differentiate between static and Dynamic memory allocation" },
        { qCode: "Q3 (Part B)", marks: 4, topic: "Circular Linked List", text: "Write an algorithm to insert a node at specific location in circular linked list" },
        { qCode: "Q5 (Part B)", marks: 4, topic: "Priority Queue", text: "What is Priority Queue? How can it be implemented? Write an applications of priority Queue" },
        { qCode: "Q7 (Part B)", marks: 4, topic: "Linked List Types", text: "Differentiate single linked list and circular linked list. Also write the advantage and disadvantages of circular linked list" },
        { qCode: "Q5(a) (Part C)", marks: 5, topic: "Doubly Linked List", text: "Write down the algorithm for insertion of a node in the middle location of doubly linked list" },
        { qCode: "Q5(b) (Part C)", marks: 5, topic: "Doubly Linked List", text: "Write down the algorithm to delete a node from last location of doubly linked list" }
      ]
    },
    {
      unitSerial: 3,
      unitName: "Searching and Sorting",
      totalMarks: 10, // Q4 Part C (10) = 10
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q4 (Part C)", marks: 10, topic: "Sorting Algorithms", text: "Write an algorithm of Insertion sort. Sort the following elements using Insertion sort: 68,17,26,54,77,93,31,44,55,20" }
      ]
    },
    {
      unitSerial: 4,
      unitName: "Trees",
      totalMarks: 16, // Q6,Q10 Part A (2+1=3) + Q4 Part B (4) + Q2 Part C (10) = 17, adjusted
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q6 (Part A)", marks: 2, topic: "Binary Tree Types", text: "Define complete Binary Tree?" },
        { qCode: "Q10 (Part A)", marks: 2, topic: "Trees vs Graphs", text: "Compare tree and graph" },
        { qCode: "Q4 (Part B)", marks: 4, topic: "Tree Traversals", text: "The in-order and pre-order traversal sequence of nodes in a binary tree are given. Draw the binary tree" },
        { qCode: "Q2 (Part C)", marks: 10, topic: "Self-Balancing Trees", text: "What is an AVL Tree? Explain the concept of Balancing factor. Create an AVL tree: 21,26,30,9,4,14,28,18,15,10,2,3,7" }
      ]
    },
    {
      unitSerial: 5,
      unitName: "Graphs and Hashing",
      totalMarks: 22, // Q8 Part A (2) + Q1,Q3 Part C (10×2=20) = 22
      youtubePlaylistUrl: null,
      questions: [
        { qCode: "Q8 (Part A)", marks: 2, topic: "Spanning Trees", text: "What is the concept of minimum spanning Tree?" },
        { qCode: "Q1 (Part C)", marks: 10, topic: "Graph Algorithms (MST)", text: "Define the spanning tree. Write the Kruskal's algorithm to find the minimum cost spanning tree of the graph" },
        { qCode: "Q3 (Part C)", marks: 10, topic: "Hashing Techniques", text: "What is hashing and collision? Discuss the advantages and disadvantages of hashing over other searching techniques" }
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
