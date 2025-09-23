// Centralized error handler middleware for Express

const errorHandler = (err, req, res, next) => {
  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong.";

  // Mongoose validation/duplicate errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  if (err.code && err.code === 11000) {
    statusCode = 409; // Conflict
    const duplicateField = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${duplicateField}`;
  }

  // JWT Feedback (optional: match your auth.js if you want to customize)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    // Uncomment below for debugging (disable in production!)
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
