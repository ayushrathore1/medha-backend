require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");

// Security middleware imports
const { generalLimiter, authLimiter, aiLimiter } = require("./middleware/rateLimit");
const {
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  requestTimeout,
  securityLogger,
  suspiciousActivityDetector
} = require("./middleware/security");

// Route imports
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
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { router: authExtraRoutes } = require("./routes/authExtraRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

// Trust proxy for accurate rate limiting behind reverse proxies (Vercel, Render, etc.)
app.set('trust proxy', 1);

// ============================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================

// 1. Security headers (Helmet)
app.use(helmetMiddleware);

// 2. Compression for better performance
app.use(compression());

// 3. CORS configuration
const allowedOrigins = [
  'https://medha-revision.vercel.app',
  'https://medha-revision.pages.dev',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3002'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  maxAge: 86400 // Cache preflight for 24 hours
}));

// 4. Body parsing with size limits
app.use(express.json({ limit: '50mb' })); // Increased to 50MB for large payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 5. Security middleware stack
app.use(mongoSanitizeMiddleware); // Prevent NoSQL injection
app.use(hppMiddleware); // Prevent HTTP Parameter Pollution
app.use(securityLogger); // Log requests with security context
app.use(suspiciousActivityDetector); // Detect malicious patterns
app.use(requestTimeout(30000)); // 30 second timeout

// 6. General rate limiting for all routes
app.use(generalLimiter);

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Detailed health check with DB status
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
    },
    database: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      name: mongoose.connection.name || "N/A"
    }
  };
  
  const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Basic health check
app.get("/", (req, res) => {
  res.send("MEDHA Backend is running!");
});

// Test route for verification
app.get("/api/test-fix", (req, res) => {
  res.json({ 
    message: "Server is updated with security enhancements!",
    version: "2.0.0",
    security: {
      rateLimiting: true,
      helmet: true,
      mongoSanitization: true,
      compression: true
    }
  });
});

// ============================================
// API ROUTES WITH APPROPRIATE RATE LIMITING
// ============================================

// Auth routes with strict rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", authLimiter, authExtraRoutes);

// User routes
app.use("/api/users", userRoutes);

// Core feature routes
app.use("/api/subjects", subjectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/rtu", rtuRoutes);

// AI/Resource-intensive routes with AI rate limiting
app.use("/api/chatbot", aiLimiter, chatbotRoutes);
app.use("/api/chat", chatHistoryRoutes);
app.use("/api/ocr", aiLimiter, ocrRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  
  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? 'An error occurred' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// ============================================
// DATABASE & SERVER STARTUP
// ============================================

// MongoDB connection options optimized for 300+ concurrent users
const mongoOptions = {
  maxPoolSize: 50, // Connection pool for high concurrency
  minPoolSize: 10, // Maintain minimum connections
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
  family: 4 // Use IPv4
};

// Graceful shutdown handling
let server;

const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);
  
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
  }
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  gracefulShutdown('UNCAUGHT EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI, mongoOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Connection pool: ${mongoOptions.maxPoolSize} max connections`);
    console.log("🔒 Security middleware: Enabled");
    console.log("⚡ Rate limiting: Enabled");
    console.log("🗜️  Compression: Enabled");
    
    server = app.listen(PORT, () => {
      console.log(`🚀 MEDHA backend running at http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
    
    // Set server timeout
    server.timeout = 30000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
