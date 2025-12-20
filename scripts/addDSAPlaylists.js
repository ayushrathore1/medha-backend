/**
 * Script to add YouTube playlist URLs to DSA units for 2024 and 2025
 * Option 1: https://youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU
 * Option 2 (Complete Syllabus): https://youtube.com/playlist?list=PLeaeMkHv5-4OaoJuY-7-tvyrQYjnmdg0B
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

// Both playlist options - storing Option 1 as primary
const PLAYLIST_OPTION_1 = "https://youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU";
const PLAYLIST_OPTION_2 = "https://youtube.com/playlist?list=PLeaeMkHv5-4OaoJuY-7-tvyrQYjnmdg0B";

async function addPlaylistsToDSA() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subject = await ExamAnalysis.findOne({ subjectName: 'Data Structures and Algorithms' });
    
    if (!subject) {
      console.log('❌ DSA subject not found');
      return;
    }

    // Update playlist URLs for years 2024 and 2025
    subject.years.forEach(yearData => {
      if (yearData.year === 2024 || yearData.year === 2025) {
        yearData.units.forEach(unit => {
          // Store both options separated by " | "
          unit.youtubePlaylistUrl = `${PLAYLIST_OPTION_1} | ${PLAYLIST_OPTION_2}`;
        });
        console.log(`✅ Updated ${yearData.year} - all ${yearData.units.length} units with playlist URLs`);
      }
    });
    
    await subject.save();
    console.log('\n✅ DSA playlists added successfully!');
    console.log(`   Option 1: ${PLAYLIST_OPTION_1}`);
    console.log(`   Option 2: ${PLAYLIST_OPTION_2}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

addPlaylistsToDSA();
