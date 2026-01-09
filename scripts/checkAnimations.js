
const mongoose = require('mongoose');
const LearnContent = require('../models/LearnContent');
require('dotenv').config();

const checkTitles = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/medha";
    await mongoose.connect(uri);
    console.log('Connected to MongoDB via', uri.includes('localhost') ? 'Localhost' : 'Cloud');
    
    // Find all C++ animations
    const animations = await LearnContent.find({ subject: 'C++', type: 'animation' }).select('title subject _id');
    console.log('--- DB Animations (C++) ---');
    if (animations.length === 0) console.log('No C++ animations found in DB!');
    
    animations.forEach(a => console.log(`[${a.subject}] "${a.title}" (ID: ${a._id})`));
    
    // Check specific title
    const specific = await LearnContent.findOne({ title: 'Templates in C++' });
    console.log('--- Specific Check ---');
    console.log('Found "Templates in C++":', !!specific);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkTitles();
