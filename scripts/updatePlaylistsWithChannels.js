/**
 * Script to update all playlists with channel names
 * Format: "URL::ChannelName | URL::ChannelName"
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ExamAnalysis = require('../models/ExamAnalysis');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medha';

const playlistConfig = {
  'Data Structures and Algorithms': 
    "https://youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU::Jenny's Lectures | https://youtube.com/playlist?list=PLeaeMkHv5-4OaoJuY-7-tvyrQYjnmdg0B::CodeHelp",
  
  'Object Oriented Programming': 
    "https://youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL::CodeWithHarry | https://youtube.com/playlist?list=PLu71SKxNbfoCPfgKZS8UE0MDuwiKvL8zi::Chai Aur Code"
};

async function updateAllPlaylists() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const [subjectName, playlistStr] of Object.entries(playlistConfig)) {
      const subject = await ExamAnalysis.findOne({ subjectName });
      
      if (!subject) {
        console.log(`❌ ${subjectName} not found`);
        continue;
      }

      subject.years.forEach(yearData => {
        yearData.units.forEach(unit => {
          unit.youtubePlaylistUrl = playlistStr;
        });
        console.log(`✅ ${subjectName} ${yearData.year} - updated ${yearData.units.length} units`);
      });
      
      await subject.save();
    }

    console.log('\n✅ All playlists updated with channel names!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

updateAllPlaylists();
