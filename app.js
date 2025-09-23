require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const noteRoutes = require("./routes/noteRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files for uploads (image access)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/flashcards", flashcardRoutes); // <-- Flashcards route for manual + AI
app.use("/api/quizzes", quizRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the MEDHA API!");
});

// Error Handler (last middleware)
app.use(errorHandler);

// MongoDB Connection & Server Startup (only when run directly)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medha";

  mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 MEDHA backend running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = app;
