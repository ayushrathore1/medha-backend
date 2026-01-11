/**
 * Seed script to update OOP 2024 Paper Analysis
 * Complete paper with Part A, B, C questions mapped to units
 */
require("dotenv").config();
const mongoose = require("mongoose");
const ExamAnalysis = require("../models/ExamAnalysis");

const oops2024Paper = {
  year: 2024,
  units: [
    // Unit 1: Introduction to OOP (30 marks total)
    {
      unitSerial: 1,
      unitName: "Introduction to OOP",
      totalMarks: 30,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A1",
          marks: 2,
          text: "Why do we need the pre-processor directive #include &lt;iostream&gt;?",
          topic: "C++ Basics"
        },
        {
          qCode: "A2",
          marks: 2,
          text: "What are the applications of void data type in C++?",
          topic: "Data Types"
        },
        {
          qCode: "A3",
          marks: 2,
          text: "What are objects? How are they created?",
          topic: "Objects"
        },
        {
          qCode: "B1",
          marks: 4,
          text: "How does a constant defined by const differ from the constant defined by the pre-processor directive statement #define?",
          topic: "const vs #define"
        },
        {
          qCode: "C3",
          marks: 10,
          text: "Write a program to print a table of values of the function y = e^x.",
          topic: "C++ Programs"
        },
        {
          qCode: "C4",
          marks: 10,
          text: "Create a class MAT of size m*n. Define all possible matrix operations for MAT type objects?",
          topic: "Class & Objects"
        }
      ]
    },
    // Unit 2: Advanced Functions and Memory Management (12 marks total)
    {
      unitSerial: 2,
      unitName: "Advanced Functions and Memory Management",
      totalMarks: 12,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A4",
          marks: 2,
          text: "What is parameterized constructor?",
          topic: "Constructors"
        },
        {
          qCode: "A7",
          marks: 2,
          text: "What is the application of this pointer?",
          topic: "this Pointer"
        },
        {
          qCode: "B2",
          marks: 4,
          text: "What is a friend function? What are the merits and demerits of using friend function?",
          topic: "Friend Functions"
        },
        {
          qCode: "B3",
          marks: 4,
          text: "What do you mean by Dynamic initialization of objects?",
          topic: "Dynamic Initialization"
        }
      ]
    },
    // Unit 3: Inheritance (10 marks total)
    {
      unitSerial: 3,
      unitName: "Inheritance",
      totalMarks: 10,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A6",
          marks: 2,
          text: "What is a virtual base class?",
          topic: "Virtual Base Class"
        },
        {
          qCode: "B5",
          marks: 4,
          text: "Class D is derived from Class B. The class D does not contain any data members of its own? Does the class D require constructors? If yes, why?",
          topic: "Derived Class Constructors"
        },
        {
          qCode: "B6",
          marks: 4,
          text: "When do we make a virtual function \"pure\"? What are the implications of making a function a pure virtual function?",
          topic: "Pure Virtual Functions"
        }
      ]
    },
    // Unit 4: Polymorphism and Operator Overloading (16 marks total)
    {
      unitSerial: 4,
      unitName: "Polymorphism and Operator Overloading",
      totalMarks: 16,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A5",
          marks: 2,
          text: "Describe the syntax of Operator function.",
          topic: "Operator Overloading"
        },
        {
          qCode: "B4",
          marks: 4,
          text: "A friend function cannot be used to overload the assignment operator =. Explain why?",
          topic: "Assignment Operator"
        },
        {
          qCode: "C5",
          marks: 10,
          text: "Write a program that reads the Name \"Rajasthan Technical University\" from the keyboard in to three separate string objects and then concatenate them into a new string object using + operator?",
          topic: "Operator Overloading"
        }
      ]
    },
    // Unit 5: Exception Handling, Templates, and File I/O (30 marks total)
    {
      unitSerial: 5,
      unitName: "Exception Handling, Templates, and File I/O",
      totalMarks: 30,
      youtubePlaylistUrl: null,
      questions: [
        {
          qCode: "A8",
          marks: 2,
          text: "What role does the iomanip file play?",
          topic: "Stream Manipulation"
        },
        {
          qCode: "A9",
          marks: 2,
          text: "What are input and output stream?",
          topic: "Stream Classes"
        },
        {
          qCode: "A10",
          marks: 2,
          text: "What is generic programming?",
          topic: "Templates"
        },
        {
          qCode: "B7",
          marks: 4,
          text: "A template can be considered as a kind of MACRO. Then, what is the difference between them?",
          topic: "Templates vs Macros"
        },
        {
          qCode: "C1",
          marks: 10,
          text: "Write a class template to represent generic vector. Include member functions to perform the following tasks: (a) To create the vector (b) To modify the value of a given element (c) To multiply by a scalar value (d) To display the vector in the form (10, 20, 30……)",
          topic: "Class Templates"
        },
        {
          qCode: "C2",
          marks: 10,
          text: "Write a main program that calls a deeply nested function containing an exception incorporate necessary exception handling mechanism?",
          topic: "Exception Handling"
        }
      ]
    }
  ]
};

async function updateOOPS2024Paper() {
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

    // Check if 2024 year already exists
    const existingYearIndex = subject.years.findIndex(y => y.year === 2024);
    
    if (existingYearIndex >= 0) {
      // Update existing year
      subject.years[existingYearIndex] = oops2024Paper;
      console.log("🔄 Updated existing 2024 paper");
    } else {
      // Add new year
      subject.years.push(oops2024Paper);
      console.log("➕ Added new 2024 paper");
    }

    await subject.save();
    console.log("✅ OOPS 2024 Paper saved successfully!");

    // Print summary
    console.log("\n📊 UNIT-WISE WEIGHTAGE (2024):");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Unit\t\t\t\t\tMarks");
    console.log("───────────────────────────────────────────────────────");
    
    let totalMarks = 0;
    oops2024Paper.units.forEach(unit => {
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
    console.error("❌ Error updating OOPS 2024 paper:", error);
    process.exit(1);
  }
}

updateOOPS2024Paper();
