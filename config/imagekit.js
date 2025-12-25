/**
 * ImageKit Configuration
 * Used for uploading and managing question images
 */

const ImageKit = require("imagekit");

// Check if credentials are configured
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  console.warn("⚠️  IMAGEKIT_PRIVATE_KEY is not set in environment variables");
}
if (!process.env.IMAGEKIT_PUBLIC_KEY) {
  console.warn("⚠️  IMAGEKIT_PUBLIC_KEY is not set in environment variables");
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ayushrathore1"
});

// Helper to check if ImageKit is configured
imagekit.isConfigured = () => {
  return !!(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY);
};

module.exports = imagekit;
