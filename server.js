require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const noteRoutes = require("./routes/noteRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");
const todoRoutes = require("./routes/todoRoutes");
const dashboardRoutes = require("./routes/dashboard");
const quizRoutes = require("./routes/quizRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const userRoutes = require("./routes/userRoutes");
const rtuRoutes = require("./routes/rtuRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { router: authExtraRoutes } = require("./routes/authExtraRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/chat", chatHistoryRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/rtu", rtuRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authExtraRoutes);

// Basic health check
app.get("/", (req, res) => {
  res.send("MEDHA Backend is running!");
});

// Test route to verify updates
app.get("/api/test-fix", (req, res) => {
  res.json({ message: "Server is updated with quiz routes!" });
});

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log("🔄 Server updated with Quiz Routes");
    app.listen(PORT, () => {
      console.log(`🚀 MEDHA backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
