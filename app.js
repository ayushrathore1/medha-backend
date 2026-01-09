require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
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
const voiceRoutes = require("./routes/voiceRoutes");
const {
  router: authExtraRoutes,
  sendWelcomeEmail,
} = require("./routes/authExtraRoutes");

// Replace these origins with your actual deployed frontend URLs!
const allowedOrigins = [
  "https://medha-revision.vercel.app",
  "https://medha-revision.pages.dev",
  "https://medha-revision.pages.dev/",
  "http://localhost:3000",
  "http://localhost:5000",
];
// add more if needed

// Import middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin like mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
app.use("/api/voice", voiceRoutes);
const notificationRoutes = require("./routes/notificationRoutes");

// ... (other route imports)

app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authExtraRoutes);
const wallpaperRoutes = require("./routes/wallpaperRoutes");
app.use("/api/wallpapers", wallpaperRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the MEDHA API! (v2)");
});

// Error Handler (last middleware)
app.use(errorHandler);

// MongoDB Connection & Server Startup (only when run directly)
if (require.main === module) {
  const PORT = process.env.PORT || 5000 || 3000;
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
