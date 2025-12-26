/**
 * Username Generator for Charcha
 * Generates fun, unique usernames like "CleverPanda42" or "BrightSparrow99"
 */

const User = require("../models/User");

// Adjectives - fun, positive, memorable
const adjectives = [
  "Clever", "Bright", "Swift", "Bold", "Wise", "Happy", "Lucky", "Cosmic",
  "Mighty", "Brave", "Calm", "Daring", "Epic", "Funky", "Gentle", "Jolly",
  "Keen", "Lively", "Noble", "Quirky", "Radiant", "Snappy", "Trendy", "Witty",
  "Zesty", "Chill", "Cool", "Groovy", "Hyper", "Jazzy", "Nifty", "Peppy",
  "Savvy", "Spicy", "Stellar", "Super", "Turbo", "Ultra", "Vivid", "Zippy",
  "Dreamy", "Fancy", "Glowing", "Magical", "Mystic", "Shiny", "Sparkly", "Starry"
];

// Nouns - animals, objects, nature themes
const nouns = [
  "Panda", "Tiger", "Eagle", "Phoenix", "Dragon", "Wolf", "Fox", "Owl",
  "Hawk", "Lion", "Bear", "Dolphin", "Falcon", "Raven", "Sparrow", "Koala",
  "Penguin", "Otter", "Rabbit", "Deer", "Ninja", "Wizard", "Knight", "Pirate",
  "Rocket", "Comet", "Star", "Moon", "Thunder", "Storm", "Cloud", "Wave",
  "Mountain", "River", "Forest", "Ocean", "Galaxy", "Nebula", "Aurora", "Blaze",
  "Crystal", "Diamond", "Ember", "Flame", "Frost", "Shadow", "Spirit", "Cipher"
];

/**
 * Generate a random username
 * @returns {string} - Username like "CleverPanda42"
 */
const generateUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
};

/**
 * Generate a unique username that doesn't exist in the database
 * @param {number} maxAttempts - Maximum attempts to find unique username
 * @returns {Promise<string>} - Unique username
 */
const generateUniqueUsername = async (maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const username = generateUsername();
    const existing = await User.findOne({ charchaUsername: username });
    if (!existing) {
      return username;
    }
  }
  // Fallback: add timestamp for guaranteed uniqueness
  const username = generateUsername();
  return `${username}${Date.now().toString(36).slice(-4)}`;
};

/**
 * Check if a username is available
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - True if available
 */
const isUsernameAvailable = async (username) => {
  if (!username || username.length < 3 || username.length > 30) {
    return false;
  }
  // Only alphanumeric and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return false;
  }
  // Reserved names
  const reserved = ["admin", "moderator", "system", "charcha", "medha", "anonymous"];
  if (reserved.includes(username.toLowerCase())) {
    return false;
  }
  const existing = await User.findOne({ 
    charchaUsername: { $regex: new RegExp(`^${username}$`, 'i') }
  });
  return !existing;
};

/**
 * Get user's rank based on karma
 * @param {number} karma - User's karma points
 * @returns {string} - Rank name
 */
const getRankFromKarma = (karma) => {
  if (karma >= 10000) return "Legend";
  if (karma >= 5000) return "Guru";
  if (karma >= 1000) return "Expert";
  if (karma >= 100) return "Scholar";
  return "Noob";
};

/**
 * Search users by username prefix (for @mention autocomplete)
 * @param {string} prefix - Username prefix to search
 * @param {number} limit - Max results
 * @returns {Promise<Array>} - Matching users
 */
const searchUsersByUsername = async (prefix, limit = 10) => {
  if (!prefix || prefix.length < 1) {
    return [];
  }
  return User.find({
    charchaUsername: { $regex: new RegExp(`^${prefix}`, 'i') }
  })
  .select('charchaUsername name avatarIndex karma rank')
  .limit(limit)
  .lean();
};

module.exports = {
  generateUsername,
  generateUniqueUsername,
  isUsernameAvailable,
  getRankFromKarma,
  searchUsersByUsername,
  adjectives,
  nouns,
};
