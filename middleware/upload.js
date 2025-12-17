// Cloudinary + Multer integration for uploads
require("dotenv").config();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Multer Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === "application/pdf";
    return {
      folder: "uploads",
      resource_type: isPDF ? "raw" : "auto",
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      // Make PDFs publicly accessible
      access_mode: "public",
      // For PDFs, use delivery type that allows direct access
      type: "upload",
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
