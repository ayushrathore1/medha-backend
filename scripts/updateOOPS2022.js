/**
 * Seed script to update OOP 2022 Paper Analysis
 * Complete paper with Part A, B, C questions mapped to units
 * Note: This paper is perfectly balanced - each unit has 18 marks
 */
require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const oops2022Paper = {
  year: 2022,
  units: [
    // Unit 1: Introduction to OOP (18 marks total)
    {
      unitSerial: 1,
      unitName: "Introduction to OOP",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A1",
          marks: 2,
          text: "What is the difference between struct and class in C++?",
          topic: "struct vs class"
        },
        {
          qCode: "A2",
          marks: 2,
          text: "How do you declare a member function in C++?",
          topic: "Member Functions"
        },
        {
          qCode: "B5",
          marks: 4,
          text: "What is OOP? Explain its characteristics.",
          topic: "OOP Characteristics"
        },
        {
          qCode: "C1",
          marks: 10,
          text: "Define class? How can we define member function inside and outside the class in C++? Explain with suitable example.",
          topic: "Class & Member Functions"
        }
      ]
    },
    // Unit 2: Advanced Functions and Memory Management (18 marks total)
    {
      unitSerial: 2,
      unitName: "Advanced Functions and Memory Management",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A3",
          marks: 2,
          text: "Define constructor in C++?",
          topic: "Constructors"
        },
        {
          qCode: "A4",
          marks: 2,
          text: "Why inline function is used?",
          topic: "Inline Functions"
        },
        {
          qCode: "B2",
          marks: 4,
          text: "What do you mean by friend function in C++?",
          topic: "Friend Functions"
        },
        {
          qCode: "C2",
          marks: 10,
          text: "Explain: (a) new and delete operators. (b) inline function.",
          topic: "Dynamic Memory & Inline"
        }
      ]
    },
    // Unit 3: Inheritance (18 marks total)
    {
      unitSerial: 3,
      unitName: "Inheritance",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A5",
          marks: 2,
          text: "What is an abstract class?",
          topic: "Abstract Class"
        },
        {
          qCode: "A6",
          marks: 2,
          text: "Can we create object of virtual class in C++?",
          topic: "Virtual Class"
        },
        {
          qCode: "B3",
          marks: 4,
          text: "Explain function overriding in C++ with example?",
          topic: "Function Overriding"
        },
        {
          qCode: "C3",
          marks: 10,
          text: "What is inheritance? Explain the types of inheritance? Write a program to add two numbers using multiple inheritance in C++?",
          topic: "Types of Inheritance"
        }
      ]
    },
    // Unit 4: Polymorphism and Operator Overloading (18 marks total)
    {
      unitSerial: 4,
      unitName: "Polymorphism and Operator Overloading",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A7",
          marks: 2,
          text: "What are static data member in C++?",
          topic: "Static Members"
        },
        {
          qCode: "A8",
          marks: 2,
          text: "Define Polymorphism?",
          topic: "Polymorphism"
        },
        {
          qCode: "B4",
          marks: 4,
          text: "Explain Dynamic binding with example.",
          topic: "Dynamic Binding"
        },
        {
          qCode: "C4",
          marks: 10,
          text: "What is operator overloading? Explain unary and binary operator overloading in C++ with suitable example?",
          topic: "Operator Overloading"
        }
      ]
    },
    // Unit 5: Exception Handling, Templates, and File I/O (18 marks total)
    {
      unitSerial: 5,
      unitName: "Exception Handling, Templates, and File I/O",
      totalMarks: 18,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A9",
          marks: 2,
          text: "Define function templates?",
          topic: "Templates"
        },
        {
          qCode: "A10",
          marks: 2,
          text: "What are the three file stream classes?",
          topic: "File Handling"
        },
        {
          qCode: "B1",
          marks: 4,
          text: "What do you mean by exception handling? Explain the four steps of exception handling?",
          topic: "Exception Handling"
        },
        {
          qCode: "C5",
          marks: 10,
          text: "How exception are handled in C++ programming explain with program?",
          topic: "Exception Handling"
        }
      ]
    }
  ]
};

async function updateOOPS2022Paper() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find existing OOPS subject
    let subject = await ExamAnalysis.findOne({ 
      subjectName: "Object Oriented Programming" 
    });

    if (!subject) {
      subject = new ExamAnalysis({
        subjectName: "Object Oriented Programming",
        totalPaperMarks: 70,
        years: []
      });
      console.log("📝 Created new OOPS subject");
    }

    // Check if 2022 year already exists
    const existingYearIndex = subject.years.findIndex(y => y.year === 2022);
    
    if (existingYearIndex >= 0) {
      subject.years[existingYearIndex] = oops2022Paper;
      console.log("🔄 Updated existing 2022 paper");
    } else {
      subject.years.push(oops2022Paper);
      console.log("➕ Added new 2022 paper");
    }

    await subject.save();
    console.log("✅ OOPS 2022 Paper saved successfully!");

    console.log("\n📊 UNIT-WISE WEIGHTAGE (2022 - PERFECTLY BALANCED):");
    console.log("═══════════════════════════════════════════════════════");
    
    let totalMarks = 0;
    oops2022Paper.units.forEach(unit => {
      const paddedName = unit.unitName.padEnd(40);
      console.log(`Unit ${unit.unitSerial}: ${paddedName}${unit.totalMarks} marks`);
      totalMarks += unit.totalMarks;
    });
    
    console.log("───────────────────────────────────────────────────────");
    console.log(`TOTAL (all optional available)\t\t\t${totalMarks} marks`);
    console.log("═══════════════════════════════════════════════════════");

    mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB. Update complete!");
  } catch (error) {
    console.error("❌ Error updating OOPS 2022 paper:", error);
    process.exit(1);
  }
}

updateOOPS2022Paper();
