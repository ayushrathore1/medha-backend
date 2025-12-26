/**
 * Reddit-style Ranking Algorithms for Charcha
 * Based on actual Reddit algorithm research
 */

/**
 * Calculate "Hot" score (Reddit's main ranking algorithm)
 * Uses logarithmic vote scaling + time decay
 * 
 * @param {number} upvotes - Number of upvotes
 * @param {number} downvotes - Number of downvotes
 * @param {Date} createdAt - When the post was created
 * @returns {number} - Hot score (higher = more visible)
 */
const calculateHotScore = (upvotes, downvotes, createdAt) => {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  
  // Epoch: Dec 8, 2005 (Reddit's birthday, using similar epoch)
  const epochMs = 1134028003000;
  const secondsAge = (new Date(createdAt).getTime() - epochMs) / 1000;
  
  // 45000 seconds = 12.5 hours. Posts lose ~1 point of ranking every 12.5 hours
  return sign * order + secondsAge / 45000;
};

/**
 * Calculate Wilson score confidence interval (for "Best" comment sorting)
 * This gives a lower bound on the true probability of upvotes
 * 
 * @param {number} upvotes - Number of upvotes
 * @param {number} downvotes - Number of downvotes
 * @param {number} confidence - Confidence level (default 0.95)
 * @returns {number} - Wilson score (0-1, higher = better)
 */
const calculateWilsonScore = (upvotes, downvotes, confidence = 0.95) => {
  const n = upvotes + downvotes;
  if (n === 0) return 0;
  
  // z-score for 95% confidence
  const z = 1.96; // For 95% confidence
  
  const phat = upvotes / n;
  
  const numerator = phat + (z * z) / (2 * n) - 
    z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);
  const denominator = 1 + (z * z) / n;
  
  return numerator / denominator;
};

/**
 * Calculate "Controversial" score
 * High score = lots of votes but evenly split
 * 
 * @param {number} upvotes - Number of upvotes
 * @param {number} downvotes - Number of downvotes
 * @returns {number} - Controversy score (higher = more controversial)
 */
const calculateControversialScore = (upvotes, downvotes) => {
  const totalVotes = upvotes + downvotes;
  if (totalVotes < 5) return 0; // Need minimum votes for controversy
  
  // Balance is how close to 50/50 the votes are
  const balance = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes);
  
  // More votes + more balanced = more controversial
  return totalVotes * balance;
};

/**
 * Calculate "Rising" score
 * Posts gaining momentum quickly
 * 
 * @param {number} upvotes - Number of upvotes
 * @param {number} downvotes - Number of downvotes  
 * @param {Date} createdAt - When the post was created
 * @returns {number} - Rising score
 */
const calculateRisingScore = (upvotes, downvotes, createdAt) => {
  const score = upvotes - downvotes;
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  
  // Only consider posts from last 24 hours
  if (ageHours > 24) return 0;
  
  // Rate: votes per hour, weighted by recency
  const recencyMultiplier = Math.max(0, 1 - (ageHours / 24));
  return (score / Math.max(ageHours, 0.1)) * recencyMultiplier;
};

/**
 * Sort options for posts
 */
const SORT_OPTIONS = {
  HOT: 'hot',
  NEW: 'new',
  TOP: 'top',
  CONTROVERSIAL: 'controversial',
  RISING: 'rising',
};

/**
 * Sort options for comments
 */
const COMMENT_SORT_OPTIONS = {
  BEST: 'best',      // Wilson score
  TOP: 'top',        // Net upvotes
  NEW: 'new',        // Newest first
  OLD: 'old',        // Oldest first
  CONTROVERSIAL: 'controversial',
};

/**
 * Get MongoDB sort query based on sort option
 * @param {string} sortOption - Sort option from SORT_OPTIONS
 * @returns {object} - MongoDB sort object
 */
const getPostSortQuery = (sortOption) => {
  switch (sortOption) {
    case SORT_OPTIONS.HOT:
      return { hotScore: -1 };
    case SORT_OPTIONS.NEW:
      return { createdAt: -1 };
    case SORT_OPTIONS.TOP:
      // Requires aggregation for upvotes - downvotes
      return { upvotes: -1 };
    case SORT_OPTIONS.CONTROVERSIAL:
      // Requires calculation in aggregation
      return { createdAt: -1 };
    case SORT_OPTIONS.RISING:
      // Requires calculation in aggregation
      return { createdAt: -1 };
    default:
      return { hotScore: -1 };
  }
};

/**
 * Get MongoDB sort query for comments
 * @param {string} sortOption - Sort option
 * @returns {object} - MongoDB sort object
 */
const getCommentSortQuery = (sortOption) => {
  switch (sortOption) {
    case COMMENT_SORT_OPTIONS.BEST:
      return { wilsonScore: -1 };
    case COMMENT_SORT_OPTIONS.TOP:
      return { upvotes: -1 };
    case COMMENT_SORT_OPTIONS.NEW:
      return { createdAt: -1 };
    case COMMENT_SORT_OPTIONS.OLD:
      return { createdAt: 1 };
    case COMMENT_SORT_OPTIONS.CONTROVERSIAL:
      return { createdAt: -1 }; // Will need aggregation for real controversial
    default:
      return { wilsonScore: -1 };
  }
};

module.exports = {
  calculateHotScore,
  calculateWilsonScore,
  calculateControversialScore,
  calculateRisingScore,
  SORT_OPTIONS,
  COMMENT_SORT_OPTIONS,
  getPostSortQuery,
  getCommentSortQuery,
};
