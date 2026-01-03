require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');
const Wallpaper = require('../models/Wallpaper');
const path = require('path');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medha";

// Arguments: node uploadFolder.js <folderPath> <themeId> <category1,category2>
const folderPath = process.argv[2];
const themeId = process.argv[3];
const categoriesRaw = process.argv[4] || '';

if (!folderPath || !themeId) {
  console.error("❌ Usage: node uploadFolder.js <folderPath> <themeId> <categories>");
  process.exit(1);
}

const categories = categoriesRaw.split(',').filter(Boolean);
// Auto-add the themeId to categories if not present
if (!categories.includes(themeId)) categories.push(themeId);
if (!categories.includes('premium-dark')) categories.push('premium-dark');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 MongoDB Data Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const uploadFolder = async () => {
  await connectDB();

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath).filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
  console.log(`📂 Found ${files.length} images in ${folderPath}`);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const name = path.parse(file).name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); // "my-image" -> "My Image"
    // Sanitize public_id to be safe for Cloudinary (alphanumeric, underscores)
    const safeName = path.parse(file).name.replace(/[^a-zA-Z0-9]/g, '_');
    const publicId = `wp_${themeId}_${safeName}`;

    try {
      console.log(`📤 Uploading ${file} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'medha_wallpapers',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`✅ Uploaded: ${result.secure_url}`);

      // Update or Insert into DB
      await Wallpaper.findOneAndUpdate(
        { publicId: result.public_id },
        {
          name: name,
          url: result.secure_url,
          publicId: result.public_id,
          themes: [themeId],
          categories: categories,
          isPremium: true
        },
        { upsert: true, new: true }
      );
      console.log(`💾 Saved to DB: ${name}`);

    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error);
    }
  }

  console.log('🎉 Bulk Upload Complete!');
  process.exit();
};

uploadFolder();
