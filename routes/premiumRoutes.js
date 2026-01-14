const express = require('express');
const router = express.Router();
const PremiumInterest = require('../models/PremiumInterest');
const auth = require('../middleware/auth');

// @route   POST api/premium/notify
// @desc    Register user interest in premium
// @access  Private
router.post('/notify', auth, async (req, res) => {
  try {
    // Check if user already registered interest
    let interest = await PremiumInterest.findOne({ userId: req.user.userId });

    if (interest) {
      return res.status(200).json({ msg: 'Interest already registered' });
    }

    interest = new PremiumInterest({
      userId: req.user.userId
    });

    await interest.save();
    
    // Get updated total count
    const count = await PremiumInterest.countDocuments();

    res.json({ msg: 'Interest registered', count });
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
        return res.status(200).json({ msg: 'Interest already registered' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/premium/count
// @desc    Get total count of interested users
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const count = await PremiumInterest.countDocuments();
    // Check if current user has already registered (if logged in)
    let hasRegistered = false;
    
    // Only check if auth header is present
    // Note: We're not using auth middleware here to keep it public, 
    // but the frontend can pass the token if available to check status
    // For now, let's keep it simple and just return the count. 
    // The frontend can check status via a separate call or we rely on local storage/state for immediate feedback context.
    
    // Actually, let's make a separate endpoint or just keep this simple for the global counter.
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/premium/status
// @desc    Check if current user has registered interest
// @access  Private
router.get('/status', auth, async (req, res) => {
    try {
        const interest = await PremiumInterest.findOne({ userId: req.user.userId });
        res.json({ hasRegistered: !!interest });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
