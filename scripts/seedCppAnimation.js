
const mongoose = require('mongoose');
const LearnContent = require('../models/LearnContent');
require('dotenv').config();

const seedAnimation = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/medha";
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Check if it already exists
    const existing = await LearnContent.findOne({ 
      title: 'Templates in C++', 
      subject: 'C++',
      type: 'animation'
    });

    if (existing) {
      console.log('Animation already exists:', existing._id);
      process.exit(0);
    }

    // Create new content
    const newContent = new LearnContent({
      title: 'Templates in C++',
      subject: 'C++',
      description: 'Master generic programming with zero-cost abstractions.',
      type: 'animation',
      animationId: 'cpp-templates',
      animationSteps: 18,
      animationCategory: 'cpp-templates',
      isActive: true,
      order: 1,
      likes: [],
      views: 0
    });

    await newContent.save();
    console.log('Success! Created animation:', newContent._id);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
};

seedAnimation();
