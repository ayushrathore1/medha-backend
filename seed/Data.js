require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Subject = require("../models/Subject");
const Note = require("../models/Note");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");

// MongoDB URI from .env or provide directly
const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medha_seed";

async function seed() {
  try {
    await mongoose.connect(mongoURI);

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Note.deleteMany({}),
      Flashcard.deleteMany({}),
      Quiz.deleteMany({}),
    ]);

    // Create Users
    const password = await bcrypt.hash("password123", 10);
    const users = await User.insertMany([
      { name: "Ayush Rathore", email: "ayush@example.com", password },
      { name: "Demo User", email: "demo@example.com", password },
    ]);

    // Create Subjects
    const subjects = await Subject.insertMany([
      {
        name: "Mathematics",
        description: "All math notes",
        user: users[0]._id,
      },
      {
        name: "Physics",
        description: "All physics notes",
        user: users[0]._id,
      },
      {
        name: "English",
        description: "All English notes",
        user: users[1]._id,
      },
    ]);

    // Create Notes
    const notes = await Note.insertMany([
      {
        title: "Integration Formulas",
        content: "∫xdx = x^2/2 + C; ∫e^x dx = e^x + C",
        subject: subjects[0].name,
        owner: users[0]._id,
        imageUrl: null,
      },
      {
        title: "Newton’s Laws",
        content: "1st Law: Inertia, 2nd Law: F=ma, 3rd Law: Action-Reaction",
        subject: subjects[1].name,
        owner: users[0]._id,
        imageUrl: null,
      },
    ]);

    // Create Flashcards
    const flashcards = await Flashcard.insertMany([
      {
        note: notes[0]._id,
        question: "What is the integral of x?",
        answer: "x^2/2 + C",
        owner: users[0]._id,
        subject: subjects[0].name,
      },
      {
        note: notes[1]._id,
        question: "What is Newton’s Second Law?",
        answer: "F = ma",
        owner: users[0]._id,
        subject: subjects[1].name,
      },
    ]);

    // Create MCQs
    await Quiz.insertMany([
      {
        note: notes[0]._id,
        question: "Integral of e^x is?",
        options: ["e^x + C", "x^e + C", "e^(x+1) + C", "x*e + C"],
        correctAnswer: "e^x + C",
        user: users[0]._id,
        subject: subjects[0].name,
      },
      {
        note: notes[1]._id,
        question: "Newton’s Third Law states:",
        options: [
          "F = ma",
          "Energy is conserved",
          "Every action has an equal and opposite reaction",
          "Acceleration is constant",
        ],
        correctAnswer: "Every action has an equal and opposite reaction",
        user: users[0]._id,
        subject: subjects[1].name,
      },
    ]);

    console.log("✅ Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    mongoose.connection.close();
    process.exit(1);
  }
}

seed();
