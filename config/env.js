require("dotenv").config();

const REQUIRED_ENV = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "OCRSPACE_API_KEY",
];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ ERROR: Missing required ENV variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  OCRSPACE_API_KEY: process.env.OCRSPACE_API_KEY,
};
