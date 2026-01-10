/**
 * Security Middleware for MEDHA
 * Provides comprehensive security headers and protections
 */

const helmet = require("helmet");
const hpp = require("hpp");

/**
 * Helmet configuration for security headers
 * Protects against XSS, clickjacking, MIME sniffing, etc.
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://api.cloudinary.com",
        "https://*.vercel.app",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled for Cloudinary images
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
});

/**
 * Escape HTML entities to prevent XSS
 */
const escapeHtml = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Custom MongoDB injection and XSS prevention (Express 5 compatible)
 * Sanitizes user input to prevent NoSQL injection and XSS attacks
 */
const sanitizeObject = (obj, parentKey = "") => {
  if (obj === null || typeof obj !== "object") {
    // Sanitize string values for XSS
    if (typeof obj === "string") {
      // Allow certain fields that contain URLs or special content
      const allowedFields = [
        "htmlBody",
        "html",
        "content",
        "imageUrl",
        "imageFileId",
        "url",
        "fileId",
        // Learn content fields
        "pdfUrl",
        "pdfFileId",
        "pdfThumbnailUrl",
        "videoUrl",
        "videoFileId",
        "videoId",
        "thumbnailUrl",
        "thumbnailFileId",
        "audioHindiUrl",
        "audioHindiFileId",
        "audioEnglishUrl",
        "audioEnglishFileId",
        "avatar", // Allow avatar base64 strings
        // AI assistant conversation links
        "chatgptLink",
        "claudeLink",
      ];
      if (allowedFields.includes(parentKey)) {
        return obj;
      }
      return escapeHtml(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      sanitizeObject(item, `${parentKey}[${index}]`)
    );
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Block keys starting with $ (MongoDB operators)
    if (key.startsWith("$")) {
      console.warn(`[SECURITY] Blocked NoSQL injection attempt: ${key}`);
      sanitized["_" + key.substring(1)] = sanitizeObject(obj[key], key);
    } else {
      sanitized[key] = sanitizeObject(obj[key], key);
    }
  }
  return sanitized;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (err) {
    console.error("[SECURITY] Sanitization error:", err.message);
    next();
  }
};

/**
 * HTTP Parameter Pollution prevention
 * Prevents parameter pollution attacks
 */
const hppMiddleware = hpp({
  whitelist: [
    "subject",
    "topic",
    "difficulty",
    "page",
    "limit",
    "sort",
    "search",
  ],
});

/**
 * Request timeout middleware
 * Prevents long-running requests from blocking the server
 * Allows longer timeout for file uploads (multipart/form-data)
 */
const requestTimeout =
  (timeoutMs = 30000) =>
  (req, res, next) => {
    // Allow 2 minutes for file uploads
    const contentType = req.get("content-type") || "";
    const isFileUpload = contentType.includes("multipart/form-data");
    const actualTimeout = isFileUpload ? 120000 : timeoutMs;

    req.setTimeout(actualTimeout, () => {
      console.error(
        `[TIMEOUT] Request timeout on ${req.method} ${req.path} from IP: ${req.ip} (timeout: ${actualTimeout}ms)`
      );
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: "Request timeout. Please try again.",
        });
      }
    });
    next();
  };

/**
 * Request logging middleware with security context
 */
const securityLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    if (res.statusCode >= 400) {
      console.warn(
        `[${logLevel.toUpperCase()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`
      );
    }
  });

  next();
};

/**
 * Suspicious activity detector
 * Logs and optionally blocks suspicious patterns
 */
const suspiciousActivityDetector = (req, res, next) => {
  // Whitelist paths that legitimately need HTML content or have special characters
  const whitelistedPaths = [
    "/api/admin/send-email",
    "/api/admin/generate-email",
    "/api/chatbot",
    "/api/chat",
    "/api/rtu/subjects", // RTU routes may have question codes with parentheses like Q3 (Part A)
    "/api/rtu/imagekit-auth",
    "/api/learn/admin", // Learn admin routes for ImageKit uploads
    "/api/learn/", // Learn routes - slide updates contain ObjectIds and note content
    // Auth routes - passwords may contain SQL-like characters (', #, --)
    // This is safe because passwords are bcrypt-compared, never used in queries
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/change-password",
    "/api/auth/reset-password",
    "/api/auth-extra/reset-password",
    "/api/auth-extra/reset-password",
    "/api/auth-extra/forgot-password",
    "/api/users/me", // Allow profile updates with large base64 payloads
  ];

  // Skip check for whitelisted paths
  if (whitelistedPaths.some((path) => req.path.includes(path))) {
    return next();
  }

  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection patterns
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi, // Script injection
    /\$where|\.exec\(|eval\(/gi, // MongoDB/JS injection
    /\/etc\/passwd|\/etc\/shadow/gi, // Path traversal
  ];

  const bodyStr = JSON.stringify(req.body || {});
  const queryStr = JSON.stringify(req.query || {});
  const paramsStr = JSON.stringify(req.params || {});
  const combinedInput = bodyStr + queryStr + paramsStr;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combinedInput)) {
      console.error(
        `[SECURITY ALERT] Suspicious activity detected from IP: ${req.ip}, Path: ${req.path}`
      );
      return res.status(403).json({
        success: false,
        message: "Request blocked due to suspicious activity.",
      });
    }
  }

  next();
};

/**
 * Body size validation for different content types
 */
const bodySizeValidator = (req, res, next) => {
  const contentLength = parseInt(req.get("content-length") || "0", 10);
  const contentType = req.get("content-type") || "";

  // 70MB limit for everything (JSON or file uploads) to allow base64 images and large PDFs
  const maxSize = 70 * 1024 * 1024;

  if (contentLength > maxSize) {
    console.warn(
      `[SECURITY] Request body too large: ${contentLength} bytes from IP: ${req.ip}`
    );
    return res.status(413).json({
      success: false,
      message: "Request body too large.",
    });
  }

  next();
};

module.exports = {
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  requestTimeout,
  securityLogger,
  suspiciousActivityDetector,
  bodySizeValidator,
};
