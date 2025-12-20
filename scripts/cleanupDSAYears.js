/**
 * Script to remove DSA years 2022 and 2023, keeping only 2024 and 2025
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

async function cleanupDSAYears() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subject = await ExamAnalysis.findOne({ subjectName: 'Data Structures and Algorithms' });
    
    if (!subject) {
      console.log('❌ DSA subject not found');
      return;
    }

    console.log(`📊 Current years: ${subject.years.map(y => y.year).join(', ')}`);
    
    // Keep only 2024 and 2025
    subject.years = subject.years.filter(y => y.year === 2024 || y.year === 2025);
    
    await subject.save();
    
    console.log(`✅ Cleaned up! Remaining years: ${subject.years.map(y => y.year).join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

cleanupDSAYears();
