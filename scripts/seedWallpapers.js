require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');
const Wallpaper = require('../models/Wallpaper');
const path = require('path');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medha";
const WALLPAPERS_DIR = path.join(__dirname, '../../medha-frontend/src/assets/wallpapers');

const WALLPAPER_MAPPING = [
  { filename: 'gradient-waves.png', id: 'waves', name: 'Gradient Waves', categories: ['light', 'theme-cognitive-clarity'] },
  { filename: 'geometric-shapes.png', id: 'geo', name: 'Geometric', categories: ['light', 'theme-cognitive-clarity'] },
  { filename: 'nature-leaves.png', id: 'nature', name: 'Nature', categories: ['light', 'nature'] },
  { filename: 'abstract-dark.png', id: 'abstract_dark', name: 'Abstract Dark', categories: ['premium-dark', 'theme-deep-cosmos'] },
  { filename: 'sunset-minimal.png', id: 'sunset_minimal', name: 'Sunset (Minimal)', categories: ['light', 'theme-cognitive-clarity'] },
  { filename: 'cyberpunk-city.png', id: 'cyberpunk_city', name: 'Cyberpunk City', categories: ['theme-netrunner', 'premium-dark'] },
  { filename: 'pastel-gradient.png', id: 'pastel_gradient', name: 'Pastel Gradient', categories: ['light', 'theme-cognitive-clarity'] },
  { filename: 'tech-circuit.png', id: 'tech_circuit', name: 'Tech Circuit', categories: ['theme-netrunner', 'premium-dark'] },
  { filename: 'misty-forest.png', id: 'misty_forest', name: 'Misty Forest', categories: ['premium-dark', 'nature'] },
  { filename: 'space-galaxy.png', id: 'space_galaxy', name: 'Space Galaxy', categories: ['theme-deep-cosmos', 'premium-dark'] },
  { filename: 'fluid-colorful.png', id: 'fluid_colorful', name: 'Fluid Colorful', categories: ['light', 'theme-cognitive-clarity'] },
  { filename: 'minimal-arch.png', id: 'minimal_arch', name: 'Minimal Arch', categories: ['light', 'theme-cognitive-clarity'] },
  { filename: 'dark-material.png', id: 'dark_material', name: 'Dark Material', categories: ['premium-dark', 'theme-deep-cosmos'] },
];

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 MongoDB Data Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const seedWallpapers = async () => {
  await connectDB();

  for (const wp of WALLPAPER_MAPPING) {
    const filePath = path.join(WALLPAPERS_DIR, wp.filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${wp.filename}`);
      continue;
    }

    try {
      console.log(`📤 Uploading ${wp.filename} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'medha_wallpapers',
        public_id: wp.id, // Use ID as public_id to prefer overwrites and consistent URLs
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`✅ Uploaded: ${result.secure_url}`);

      // Update or Insert into DB
      await Wallpaper.findOneAndUpdate(
        { publicId: result.public_id },
        {
          name: wp.name,
          url: result.secure_url,
          publicId: result.public_id,
          themes: wp.categories.filter(c => c.startsWith('theme-') || c === 'premium-dark' || c === 'light'), // rough heuristic
          categories: wp.categories
        },
        { upsert: true, new: true }
      );
      console.log(`💾 Saved to DB: ${wp.name}`);

    } catch (error) {
      console.error(`❌ Failed to process ${wp.filename}:`, error);
    }
  }

  console.log('🎉 Wallpaper Migration Complete!');
  process.exit();
};

seedWallpapers();
