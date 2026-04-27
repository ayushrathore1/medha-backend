// Multer integration for local disk uploads
// Files are saved locally first, then uploaded to Cloudinary or served from disk
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "notes");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File filter: allow images (jpeg, jpg, png, gif) and PDFs
function fileFilter(req, file, cb) {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const extname = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedImageTypes.test(file.mimetype);

  // Accept images
  if (mimetype && extname) return cb(null, true);

  // Accept PDFs
  if (
    file.mimetype === "application/pdf" ||
    path.extname(file.originalname).toLowerCase() === ".pdf"
  ) {
    return cb(null, true);
  }

  // Otherwise, reject
  cb(
    new Error("Only image or PDF files are allowed (jpeg, jpg, png, gif, pdf)")
  );
}

// Local disk storage — saves to ./uploads/notes/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const baseName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .trim();

    const ext = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${Date.now()}-${baseName || "file"}${ext}`;
    cb(null, safeFilename);
  },
});

// No file size limit — large files are stored on disk, small ones go to Cloudinary
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
