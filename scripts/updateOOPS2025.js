/**
 * Seed script to update OOP 2025 Paper Analysis
 * Complete paper with Part A, B, C questions mapped to units
 */
require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const oops2025Paper = {
  year: 2025,
  units: [
    // Unit 1: Introduction to OOP (20 marks total)
    {
      unitSerial: 1,
      unitName: "Introduction to OOP",
      totalMarks: 20,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A1",
          marks: 2,
          text: "Compare C and C++.",
          topic: "Programming Paradigm"
        },
        {
          qCode: "A2",
          marks: 2,
          text: "Explain class and struct with their differences.",
          topic: "Class & Structures"
        },
        {
          qCode: "A7",
          marks: 2,
          text: "Distinguish Data abstraction and data encapsulation?",
          topic: "Characteristics of OOP"
        },
        {
          qCode: "A8",
          marks: 2,
          text: "How does a main() function in C++ differ from main in C?",
          topic: "C++ Basics"
        },
        {
          qCode: "B1",
          marks: 4,
          text: "What is object oriented programming? How it is different from procedure oriented programming?",
          topic: "OOP vs POP"
        },
        {
          qCode: "B2",
          marks: 4,
          text: "Find error, if any, in the following C++ statement:<br/>(a) Cout << \"x = \";<br/>(b) Cin >> x; >> y;<br/>(c) Cout << \"Enter value:\"; cin >> x;<br/>(d) m=5; || n=10; || s=m+n;",
          topic: "C++ Syntax"
        },
        {
          qCode: "B7",
          marks: 4,
          text: "What are nested classes? What is the difference between private and protected access specifiers?",
          topic: "Access Specifiers"
        }
      ]
    },
    // Unit 2: Advanced Functions and Memory Management (36 marks total)
    {
      unitSerial: 2,
      unitName: "Advanced Functions and Memory Management",
      totalMarks: 36,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A9",
          marks: 2,
          text: "When will you make a function inline? Why?",
          topic: "Inline Functions"
        },
        {
          qCode: "A10",
          marks: 2,
          text: "Distinguish between the following two statements:<br/><code>time T2(T1);</code><br/><code>time T2 = T1;</code><br/>T1 and T2 are objects of time class.",
          topic: "Copy Constructor"
        },
        {
          qCode: "B3",
          marks: 4,
          text: "What are the advantages of function prototypes in C++? Write a function to read a matrix of size m×n from the keyboard.",
          topic: "Functions"
        },
        {
          qCode: "B4",
          marks: 4,
          text: "What is a friend function? What are the merits and demerits of using friend function?",
          topic: "Friend Functions"
        },
        {
          qCode: "B5",
          marks: 4,
          text: "What is a constructor? Is it mandatory to use constructors in a class? List some of the special properties of the constructor functions.",
          topic: "Constructors"
        },
        {
          qCode: "C3",
          marks: 10,
          text: "What is this pointer? Write a program to enter name and age of two persons. Find the elder person use this pointer.",
          topic: "this Pointer"
        },
        {
          qCode: "C5",
          marks: 10,
          text: "What is copy constructor? Write a program to demonstrate the use of copy constructor.",
          topic: "Copy Constructor"
        }
      ]
    },
    // Unit 3: Inheritance (12 marks total)
    {
      unitSerial: 3,
      unitName: "Inheritance",
      totalMarks: 12,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A4",
          marks: 2,
          text: "What do you mean by base class and derived class?",
          topic: "Inheritance Basics"
        },
        {
          qCode: "C1",
          marks: 10,
          text: "What do you mean by inheritance? Describe the various types of inheritance with examples. Write the difference between single and multilevel inheritance.",
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
          qCode: "A3",
          marks: 2,
          text: "Find the bugs in the following program: (operator overloading program)",
          topic: "Operator Overloading"
        },
        {
          qCode: "A5",
          marks: 2,
          text: "What is the use of the keyword virtual?",
          topic: "Virtual Functions"
        },
        {
          qCode: "B6",
          marks: 4,
          text: "What is operator overloading? Why is it necessary to overload an operator?",
          topic: "Operator Overloading"
        },
        {
          qCode: "C4",
          marks: 10,
          text: "What is the difference between operator overloading and function overloading? Write a program to overload < operator and display the smallest number out of two objects.",
          topic: "Operator Overloading"
        }
      ]
    },
    // Unit 5: Exception Handling, Templates, and File I/O (12 marks total)
    {
      unitSerial: 5,
      unitName: "Exception Handling, Templates, and File I/O",
      totalMarks: 12,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A6",
          marks: 2,
          text: "What are the steps involved in using a file in a C++ program?",
          topic: "File Handling"
        },
        {
          qCode: "C2",
          marks: 10,
          text: "What is a file? Write steps of file operations. Write a program to write and read text in a file. Use of stream and ifstream classes.",
          topic: "File I/O"
        }
      ]
    }
  ]
};

async function updateOOPS2025Paper() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find existing OOPS subject
    let subject = await ExamAnalysis.findOne({ 
      subjectName: "Object Oriented Programming" 
    });

    if (!subject) {
      // Create new subject if doesn't exist
      subject = new ExamAnalysis({
        subjectName: "Object Oriented Programming",
        totalPaperMarks: 70,
        years: []
      });
      console.log("📝 Created new OOPS subject");
    }

    // Check if 2025 year already exists
    const existingYearIndex = subject.years.findIndex(y => y.year === 2025);
    
    if (existingYearIndex >= 0) {
      // Update existing year
      subject.years[existingYearIndex] = oops2025Paper;
      console.log("🔄 Updated existing 2025 paper");
    } else {
      // Add new year
      subject.years.push(oops2025Paper);
      console.log("➕ Added new 2025 paper");
    }

    await subject.save();
    console.log("✅ OOPS 2025 Paper saved successfully!");

    // Print summary
    console.log("\n📊 UNIT-WISE WEIGHTAGE:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Unit\t\t\t\t\tMarks");
    console.log("───────────────────────────────────────────────────────");
    
    let totalMarks = 0;
    oops2025Paper.units.forEach(unit => {
      const paddedName = unit.unitName.padEnd(40);
      console.log(`Unit ${unit.unitSerial}: ${paddedName}${unit.totalMarks} marks`);
      totalMarks += unit.totalMarks;
    });
    
    console.log("───────────────────────────────────────────────────────");
    console.log(`TOTAL (considering optionals)\t\t\t${totalMarks} marks`);
    console.log("═══════════════════════════════════════════════════════");
    
    console.log("\n📝 QUESTION BREAKDOWN:");
    console.log("Part A: 10 × 2 = 20 marks (all compulsory)");
    console.log("Part B: 5 × 4 = 20 marks (attempt any 5 out of 7)");
    console.log("Part C: 3 × 10 = 30 marks (attempt any 3 out of 5)");
    console.log("Total: 70 marks");

    mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB. Update complete!");
  } catch (error) {
    console.error("❌ Error updating OOPS 2025 paper:", error);
    process.exit(1);
  }
}

updateOOPS2025Paper();
