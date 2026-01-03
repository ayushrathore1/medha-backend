const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  publicId: { 
    type: String, 
    required: true 
  },
  themes: [{ 
    type: String 
  }],
  categories: [{ 
    type: String 
  }],
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
