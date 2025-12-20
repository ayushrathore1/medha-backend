/**
 * Script to add YouTube playlist URLs to OOPS units
 * Option 1: https://youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL (CodeWithHarry)
 * Option 2: https://youtube.com/playlist?list=PLu71SKxNbfoCPfgKZS8UE0MDuwiKvL8zi (Apna College)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const PLAYLIST_OPTION_1 = "https://youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL";
const PLAYLIST_OPTION_2 = "https://youtube.com/playlist?list=PLu71SKxNbfoCPfgKZS8UE0MDuwiKvL8zi";

async function addPlaylistsToOOPS() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const subject = await ExamAnalysis.findOne({ subjectName: 'Object Oriented Programming' });
    
    if (!subject) {
      console.log('❌ OOPS subject not found in ExamAnalysis');
      console.log('   Creating entry with playlists...');
      
      // Create a new entry with just the playlists for now
      await ExamAnalysis.create({
        subjectName: 'Object Oriented Programming',
        totalPaperMarks: 98,
        years: []
      });
      
      const newSubject = await ExamAnalysis.findOne({ subjectName: 'Object Oriented Programming' });
      console.log('✅ Created OOPS subject entry');
    } else {
      // Update playlist URLs for all years
      subject.years.forEach(yearData => {
        yearData.units.forEach(unit => {
          unit.youtubePlaylistUrl = `${PLAYLIST_OPTION_1} | ${PLAYLIST_OPTION_2}`;
        });
        console.log(`✅ Updated ${yearData.year} - all ${yearData.units.length} units with playlist URLs`);
      });
      
      await subject.save();
    }
    
    console.log('\n✅ OOPS playlists configuration saved!');
    console.log(`   Option 1: ${PLAYLIST_OPTION_1}`);
    console.log(`   Option 2: ${PLAYLIST_OPTION_2}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

addPlaylistsToOOPS();
