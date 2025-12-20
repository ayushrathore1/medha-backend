/**
 * Script to add YouTube playlist to Digital Electronics
 * Channel: Code Smashers
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const PLAYLIST = "https://youtube.com/playlist?list=PLxCzCOWd7aiGmXg4NoX6R31AsC5LeCPHe::Code Smashers";

async function addDEPlaylist() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subject = await ExamAnalysis.findOne({ subjectName: 'Digital Electronics' });
    
    if (!subject) {
      console.log('❌ Digital Electronics not found');
      return;
    }

    subject.years.forEach(yearData => {
      yearData.units.forEach(unit => {
        unit.youtubePlaylistUrl = PLAYLIST;
      });
      console.log(`✅ Digital Electronics ${yearData.year} - updated ${yearData.units.length} units`);
    });
    
    await subject.save();
    console.log('\n✅ Digital Electronics playlist added!');
    console.log(`   Channel: Code Smashers`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

addDEPlaylist();
