require("dotenv").config();
const mongoose = require("mongoose");
const Syllabus = require("../models/Syllabus");

const syllabusData = [
  // 1. Advanced Engineering Mathematics (AEM)
  {
    subjectCode: "3CS2-01",
    subjectName: "Advanced Engineering Mathematics",
    semester: 3,
    credits: 3,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "3 Hours",
    totalHours: 40,
    units: [
      {
        unitNumber: 1,
        title: "Random Variables",
        topics: [
          "Discrete and Continuous random variables",
          "Joint distribution",
          "Probability distribution function",
          "Conditional distribution",
          "Mathematical Expectations: Moments",
          "Moment Generating Functions",
          "Variance and correlation coefficients",
          "Chebyshev's Inequality",
          "Skewness and Kurtosis",
        ],
        hours: 7,
      },
      {
        unitNumber: 2,
        title: "Probability Distributions",
        topics: [
          "Binomial distribution",
          "Normal Distribution",
          "Poisson Distribution and their relations",
          "Uniform Distribution",
          "Exponential Distribution",
          "Correlation: Karl Pearson's coefficient",
          "Rank correlation",
          "Curve fitting",
          "Line of Regression",
        ],
        hours: 5,
      },
      {
        unitNumber: 3,
        title: "Optimization Fundamentals",
        topics: [
          "Historical development",
          "Engineering Applications of Optimization",
          "Formulation of Design Problems as a Mathematical Programming Problems",
          "Classification of Optimization Problems",
        ],
        hours: 8,
      },
      {
        unitNumber: 4,
        title: "Classical Optimization",
        topics: [
          "Classical Optimization using Differential Calculus",
          "Single Variable Optimization",
          "Multivariable Optimization with & without Constraints",
          "Langrangian theory",
          "Kuhn Tucker conditions",
        ],
        hours: 6,
      },
      {
        unitNumber: 5,
        title: "Linear Programming",
        topics: [
          "Simplex method",
          "Two Phase Method",
          "Duality in Linear Programming",
          "Application of Linear Programming",
          "Transportation Problems",
          "Assignment Problems",
        ],
        hours: 14,
      },
    ],
  },

  // 2. Technical Communication
  {
    subjectCode: "3CS1-02",
    subjectName: "Technical Communication",
    semester: 3,
    credits: 2,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "2 Hours",
    totalHours: 26,
    units: [
      {
        unitNumber: 1,
        title: "Introduction to Technical Communication",
        topics: [
          "Definition of technical communication",
          "Aspects of technical communication",
          "Forms of technical communication",
          "Importance of technical communication",
          "Technical communication skills (Listening, speaking, writing, reading writing)",
          "Linguistic ability",
          "Style in technical communication",
        ],
        hours: 4,
      },
      {
        unitNumber: 2,
        title: "Comprehension and Information Design",
        topics: [
          "Reading of technical texts",
          "Reading and comprehending instructions and technical manuals",
          "Interpreting and summarizing technical texts",
          "Note-making",
          "Introduction of different kinds of technical documents",
          "Information collection",
          "Factors affecting information and document design",
          "Strategies for organization",
          "Information design and writing for print and online media",
        ],
        hours: 6,
      },
      {
        unitNumber: 3,
        title: "Technical Writing, Grammar and Editing",
        topics: [
          "Technical writing process",
          "Forms of technical discourse",
          "Writing, drafts and revising",
          "Basics of grammar",
          "Common error in writing and speaking",
          "Study of advanced grammar",
          "Editing strategies to achieve appropriate technical style",
          "Introduction to advanced technical communication",
          "Planning, drafting and writing Official Notes",
          "Letters, E-mail, Resume, Job Application",
          "Minutes of Meetings",
        ],
        hours: 8,
      },
      {
        unitNumber: 4,
        title: "Advanced Technical Writing",
        topics: [
          "Technical Reports: types of technical reports",
          "Characteristics and formats and structure of technical reports",
          "Technical Project Proposals: types of technical proposals",
          "Characteristics and formats and structure of technical proposals",
          "Technical Articles: types of technical articles",
          "Writing strategies, structure and formats of technical articles",
        ],
        hours: 8,
      },
    ],
  },

  // 3. Managerial Economics and Financial Accounting (MEFA)
  {
    subjectCode: "3CS1-03",
    subjectName: "Managerial Economics and Financial Accounting",
    semester: 3,
    credits: 2,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "2 Hours",
    totalHours: 26,
    units: [
      {
        unitNumber: 1,
        title: "Basic Economic Concepts",
        topics: [
          "Meaning, nature and scope of economics",
          "Deductive vs inductive methods",
          "Static and dynamics",
          "Economic problems: scarcity and choice",
          "Circular flow of economic activity",
          "National income-concepts and measurement",
        ],
        hours: 4,
      },
      {
        unitNumber: 2,
        title: "Demand and Supply Analysis",
        topics: [
          "Demand-types of demand",
          "Determinants of demand",
          "Demand function",
          "Elasticity of demand",
          "Demand forecasting - purpose, determinants and methods",
          "Supply-determinants of supply",
          "Supply function",
          "Elasticity of supply",
        ],
        hours: 5,
      },
      {
        unitNumber: 3,
        title: "Production and Cost Analysis",
        topics: [
          "Theory of production",
          "Production function",
          "Law of variable proportions",
          "Laws of returns to scale",
          "Production optimization",
          "Least cost combination of inputs",
          "Isoquants",
          "Cost concepts - explicit and implicit cost",
          "Fixed and variable cost",
          "Opportunity cost",
          "Sunk costs",
          "Cost function",
          "Cost curves",
          "Cost and output decisions",
          "Cost estimation",
        ],
        hours: 5,
      },
      {
        unitNumber: 4,
        title: "Market Structure and Pricing Theory",
        topics: [
          "Perfect competition",
          "Monopoly",
          "Monopolistic competition",
          "Oligopoly",
        ],
        hours: 4,
      },
      {
        unitNumber: 5,
        title: "Financial Statement Analysis",
        topics: [
          "Balance sheet and related concepts",
          "Profit and loss statement and related concepts",
          "Financial ratio analysis",
          "Cash-flow analysis",
          "Funds-flow analysis",
          "Comparative financial statement",
          "Analysis and interpretation of financial statements",
          "Capital budgeting techniques",
        ],
        hours: 8,
      },
    ],
  },

  // 4. Digital Electronics (DE)
  {
    subjectCode: "3CS3-04",
    subjectName: "Digital Electronics",
    semester: 3,
    credits: 3,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "3 Hours",
    totalHours: 40,
    units: [
      {
        unitNumber: 1,
        title: "Fundamental Concepts",
        topics: [
          "Number systems and codes",
          "Basic logic Gates and Boolean algebra",
          "Sign & magnitude representation",
          "Fixed point representation",
          "Complement notation",
          "Various codes & arithmetic in different codes & their inter conversion",
          "Features of logic algebra",
          "Postulates of Boolean algebra",
          "Theorems of Boolean algebra",
        ],
        hours: 8,
      },
      {
        unitNumber: 2,
        title: "Minimization Techniques and Logic Gates",
        topics: [
          "Principle of Duality",
          "Boolean expression",
          "Minimization of Boolean expressions",
          "Minterm – Maxterm",
          "Sum of Products (SOP)",
          "Product of Sums (POS)",
          "Karnaugh map Minimization",
          "Don't care conditions",
          "Quine - McCluskey method of minimization",
        ],
        hours: 8,
      },
      {
        unitNumber: 3,
        title: "Digital Logic Gate Characteristics",
        topics: [
          "TTL logic gate characteristics",
          "Theory & operation of TTL NAND gate circuitry",
          "Open collector TTL",
          "Three state output logic",
          "TTL subfamilies",
          "MOS & CMOS logic families",
          "Realization of logic gates in RTL, DTL, ECL, C-MOS & MOSFET",
        ],
        hours: 8,
      },
      {
        unitNumber: 4,
        title: "Combinational Circuits",
        topics: [
          "Combinational logic circuit design",
          "Adder",
          "Subtractor",
          "BCD adder",
          "Encoder",
          "Decoder",
          "BCD to 7-segment decoder",
          "Multiplexer",
          "Demultiplexer",
        ],
        hours: 8,
      },
      {
        unitNumber: 5,
        title: "Sequential Circuits",
        topics: [
          "Latches",
          "Flip-flops - SR, JK, D, T, and Master-Slave",
          "Characteristic table and equation",
          "Counters and their design",
          "Synchronous counters",
          "Synchronous Up/Down counters",
          "Programmable counters",
          "State table and state transition diagram",
          "Sequential circuits design methodology",
          "Registers – shift registers",
        ],
        hours: 8,
      },
    ],
  },

  // 5. Data Structures and Algorithms (DSA)
  {
    subjectCode: "3CS4-05",
    subjectName: "Data Structures and Algorithms",
    semester: 3,
    credits: 3,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "3 Hours",
    totalHours: 40,
    units: [
      {
        unitNumber: 1,
        title: "Stacks",
        topics: [
          "Basic Stack Operations",
          "Representation of a Stack using Static Array and Dynamic Array",
          "Multiple stack implementation using single array",
          "Stack Applications: Reversing list",
          "Factorial Calculation",
          "Infix to postfix Transformation",
          "Evaluating Arithmetic Expressions",
          "Towers of Hanoi",
        ],
        hours: 8,
      },
      {
        unitNumber: 2,
        title: "Queues and Linked Lists",
        topics: [
          "Basic Queue Operations",
          "Representation of a Queue using array",
          "Implementation of Queue Operations using Stack",
          "Applications of Queues - Round Robin Algorithm",
          "Circular Queues",
          "DeQueue",
          "Priority Queues",
          "Linked Lists: Introduction",
          "Single linked list",
          "Representation of a linked list in memory",
          "Different Operations on a Single linked list",
          "Reversing a single linked list",
          "Advantages and disadvantages of single linked list",
          "Circular linked list",
          "Double linked list",
          "Header linked list",
        ],
        hours: 10,
      },
      {
        unitNumber: 3,
        title: "Searching and Sorting",
        topics: [
          "Searching Techniques: Sequential and binary search",
          "Sorting Techniques: Basic concepts",
          "Bubble sort",
          "Insertion sort",
          "Selection sort",
          "Quick sort",
          "Heap sort",
          "Merge sort",
          "Radix sort",
          "Counting sorting algorithms",
        ],
        hours: 7,
      },
      {
        unitNumber: 4,
        title: "Trees",
        topics: [
          "Definition of tree",
          "Properties of tree",
          "Binary Tree",
          "Representation of Binary trees using arrays and linked lists",
          "Operations on a Binary Tree",
          "Binary Tree Traversals (recursive)",
          "Binary search tree",
          "B-tree",
          "B+ tree",
          "AVL tree",
          "Threaded binary tree",
        ],
        hours: 7,
      },
      {
        unitNumber: 5,
        title: "Graphs and Hashing",
        topics: [
          "Basic concepts of Graphs",
          "Different representations of Graphs",
          "Graph Traversals (BFS & DFS)",
          "Minimum Spanning Tree (Prims & Kruskal)",
          "Dijkstra's shortest path algorithms",
          "Hashing: Hash function",
          "Address calculation techniques",
          "Common hashing functions",
          "Collision resolution: Linear and Quadratic probing",
          "Double hashing",
        ],
        hours: 8,
      },
    ],
  },

  // 6. Object Oriented Programming (OOPS)
  {
    subjectCode: "3CS4-06",
    subjectName: "Object Oriented Programming",
    semester: 3,
    credits: 3,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "3 Hours",
    totalHours: 40,
    units: [
      {
        unitNumber: 1,
        title: "Introduction to OOP",
        topics: [
          "Introduction to different programming paradigm",
          "Characteristics of OOP",
          "Class, Object, data member, member function",
          "Structures in C++",
          "Different access specifiers",
          "Defining member function inside and outside class",
          "Array of objects",
        ],
        hours: 8,
      },
      {
        unitNumber: 2,
        title: "Advanced Functions and Memory Management",
        topics: [
          "Concept of reference",
          "Dynamic memory allocation using new and delete operators",
          "Inline functions",
          "Function overloading",
          "Function with default arguments",
          "Constructors and destructors",
          "Friend function and classes",
          "Using this pointer",
        ],
        hours: 8,
      },
      {
        unitNumber: 3,
        title: "Inheritance",
        topics: [
          "Types of inheritance",
          "Multiple inheritance",
          "Virtual base class",
          "Function overriding",
          "Abstract class and pure virtual function",
        ],
        hours: 9,
      },
      {
        unitNumber: 4,
        title: "Polymorphism and Operator Overloading",
        topics: [
          "Constant data member and member function",
          "Static data member and member function",
          "Polymorphism",
          "Operator overloading",
          "Dynamic binding and virtual function",
        ],
        hours: 9,
      },
      {
        unitNumber: 5,
        title: "Exception Handling, Templates, and File I/O",
        topics: [
          "Exception handling",
          "Template",
          "Stream class",
          "File handling",
        ],
        hours: 6,
      },
    ],
  },

  // 7. Software Engineering (SE)
  {
    subjectCode: "3CS4-07",
    subjectName: "Software Engineering",
    semester: 3,
    credits: 3,
    maxMarks: 100,
    iaMarks: 30,
    eteMarks: 70,
    examDuration: "3 Hours",
    totalHours: 40,
    units: [
      {
        unitNumber: 1,
        title: "Introduction to Software Engineering",
        topics: [
          "Software life-cycle models",
          "Software requirements specification",
          "Formal requirements specification",
          "Verification and validation",
        ],
        hours: 8,
      },
      {
        unitNumber: 2,
        title: "Software Project Management",
        topics: [
          "Objectives, Resources and their estimation",
          "LOC and FP estimation",
          "Effort estimation",
          "COCOMO estimation model",
          "Risk analysis",
          "Software project scheduling",
        ],
        hours: 8,
      },
      {
        unitNumber: 3,
        title: "Requirement Analysis",
        topics: [
          "Requirement analysis tasks",
          "Analysis principles",
          "Software prototyping and specification data dictionary",
          "Finite State Machine (FSM) models",
          "Structured Analysis: Data and control flow diagrams",
          "Control and process specification behavioral modeling",
        ],
        hours: 8,
      },
      {
        unitNumber: 4,
        title: "Software Design",
        topics: [
          "Design fundamentals",
          "Effective modular design",
          "Data architectural and procedural design",
          "Design documentation",
        ],
        hours: 8,
      },
      {
        unitNumber: 5,
        title: "Object Oriented Analysis and Design",
        topics: [
          "Object oriented Analysis Modeling",
          "Data modeling",
          "Object Oriented Design: OOD concepts",
          "Class and object relationships",
          "Object modularization",
          "Introduction to Unified Modeling Language",
        ],
        hours: 8,
      },
    ],
  },
];

async function seedSyllabus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing syllabus data
    await Syllabus.deleteMany({});
    console.log("🗑️  Cleared existing syllabus data");

    // Insert new syllabus data
    const result = await Syllabus.insertMany(syllabusData);
    console.log(`✅ Successfully inserted ${result.length} syllabi`);

    result.forEach((s) => {
      console.log(`   - ${s.subjectCode}: ${s.subjectName}`);
    });

    mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB. Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding syllabus:", error);
    process.exit(1);
  }
}

seedSyllabus();
