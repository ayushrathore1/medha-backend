/**
 * Manual Cloudinary Upload Utility
 * Uploads a local file to Cloudinary programmatically.
 * Used instead of multer-storage-cloudinary to allow pre-processing.
 */
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

// Cloudinary free tier limit for raw files
const CLOUDINARY_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary
 *
 * @param {string} localFilePath - Absolute path to the local file
 * @param {string} originalName - Original filename from the user
 * @returns {Promise<{url: string, publicId: string, resourceType: string}>}
 */
async function uploadToCloudinary(localFilePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const isPDF = ext === ".pdf";

  // Sanitize filename for Cloudinary public_id
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .trim();

  const safePublicId = `${Date.now()}-${baseName || "file"}`;

  const uploadOptions = {
    folder: "uploads",
    resource_type: isPDF ? "raw" : "auto",
    public_id: safePublicId,
    access_mode: "public",
    type: "upload",
    overwrite: true,
  };

  console.log(
    `[Cloudinary] Uploading ${(fs.statSync(localFilePath).size / 1024 / 1024).toFixed(1)}MB as ${isPDF ? "raw" : "auto"}...`
  );

  const result = await cloudinary.uploader.upload(localFilePath, uploadOptions);

  console.log(`[Cloudinary] Upload complete: ${result.secure_url}`);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
  };
}

module.exports = { uploadToCloudinary, CLOUDINARY_MAX_BYTES };
