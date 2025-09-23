const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Configure cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "medha_uploads";
    if (file.mimetype.startsWith("image/")) {
      folder += "/images";
    } else if (file.mimetype === "application/pdf") {
      folder += "/pdfs";
    }
    return {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
