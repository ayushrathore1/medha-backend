const express = require('express');
const router = express.Router();
const Wallpaper = require('../models/Wallpaper');

// GET /api/wallpapers
// Retrieve all wallpapers
router.get('/', async (req, res) => {
  try {
    const wallpapers = await Wallpaper.find().sort({ createdAt: -1 });
    res.json(wallpapers);
  } catch (err) {
    console.error('Error fetching wallpapers:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
