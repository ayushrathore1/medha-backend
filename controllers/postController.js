const Post = require("../models/Post");
const CharchaComment = require("../models/CharchaComment");
const Vote = require("../models/Vote");
const Mention = require("../models/Mention");
const User = require("../models/User");
const { calculateHotScore, calculateWilsonScore, SORT_OPTIONS, getPostSortQuery } = require("../utils/rankingAlgorithms");
const { generateUniqueUsername, getRankFromKarma, searchUsersByUsername } = require("../utils/usernameGenerator");

// Constants
const MAX_ANONYMOUS_POSTS_PER_DAY = 3;
const MIN_ACCOUNT_AGE_FOR_ANONYMOUS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Parse @mentions from text
 * Returns array of mentioned usernames
 */
const parseMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)]; // Remove duplicates
};

/**
 * Create mentions in database and notify users
 */
const createMentions = async (text, authorId, sourceType, sourceId, sourceModel) => {
  const mentionedUsernames = parseMentions(text);
  const hasAdminMention = mentionedUsernames.some(u => u.toLowerCase() === 'admin');
  
  // Find users by username
  const mentionedUsers = await User.find({
    charchaUsername: { $in: mentionedUsernames.filter(u => u.toLowerCase() !== 'admin') }
  }).select('_id');
  
  // Get admin user if @admin was mentioned
  let adminUser = null;
  if (hasAdminMention) {
    adminUser = await User.findOne({ isAdmin: true }).select('_id');
  }
  
  const mentionDocs = [];
  
  // Create mention records for regular users
  for (const user of mentionedUsers) {
    if (user._id.toString() !== authorId.toString()) {
      mentionDocs.push({
        mentioner: authorId,
        mentionedUser: user._id,
        sourceType,
        sourceId,
        sourceModel,
        isAdminMention: false,
      });
    }
  }
  
  // Create mention record for admin
  if (adminUser && adminUser._id.toString() !== authorId.toString()) {
    mentionDocs.push({
      mentioner: authorId,
      mentionedUser: adminUser._id,
      sourceType,
      sourceId,
      sourceModel,
      isAdminMention: true,
    });
  }
  
  if (mentionDocs.length > 0) {
    await Mention.insertMany(mentionDocs);
  }
  
  return {
    mentionedUserIds: mentionedUsers.map(u => u._id),
    hasAdminMention,
  };
};

/**
 * Check if user can post anonymously
 */
const canPostAnonymously = async (user) => {
  // Must have positive karma
  if (user.karma < 0) {
    return { allowed: false, reason: "Negative karma users cannot post anonymously" };
  }
  
  // Account must be at least 24 hours old
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  if (accountAge < MIN_ACCOUNT_AGE_FOR_ANONYMOUS) {
    return { allowed: false, reason: "Account must be at least 24 hours old" };
  }
  
  // Check daily limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (user.lastAnonymousReset && user.lastAnonymousReset < today) {
    // Reset counter
    await User.updateOne({ _id: user._id }, {
      anonymousPostsToday: 0,
      lastAnonymousReset: new Date(),
    });
    return { allowed: true };
  }
  
  if (user.anonymousPostsToday >= MAX_ANONYMOUS_POSTS_PER_DAY) {
    return { allowed: false, reason: `Maximum ${MAX_ANONYMOUS_POSTS_PER_DAY} anonymous posts per day` };
  }
  
  return { allowed: true };
};

// ==================== POST CONTROLLERS ====================

/**
 * Create a new post
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, tag, isAnonymous, mediaUrls } = req.body;
    const userId = req.user._id;
    
    // Validate
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    
    // Check anonymous posting
    if (isAnonymous) {
      const user = await User.findById(userId);
      const canAnon = await canPostAnonymously(user);
      if (!canAnon.allowed) {
        return res.status(403).json({ message: canAnon.reason });
      }
    }
    
    // Ensure user has Charcha username
    let user = await User.findById(userId);
    if (!user.charchaUsername) {
      const username = await generateUniqueUsername();
      user.charchaUsername = username;
      user.charchaJoinedAt = new Date();
      await user.save();
    }
    
    // Parse mentions
    const fullText = `${title} ${content}`;
    const mentionedUsernames = parseMentions(fullText);
    const hasAdminMention = mentionedUsernames.some(u => u.toLowerCase() === 'admin');
    
    // Find mentioned users
    const mentionedUsers = await User.find({
      charchaUsername: { $in: mentionedUsernames.filter(u => u.toLowerCase() !== 'admin') }
    }).select('_id');
    
    // Create post
    const post = new Post({
      title,
      content,
      author: userId,
      isAnonymous: isAnonymous || false,
      tag: tag || 'off-topic',
      mediaUrls: mediaUrls || [],
      mentions: mentionedUsers.map(u => u._id),
      hasAdminMention,
      hotScore: calculateHotScore(0, 0, new Date()),
    });
    
    await post.save();
    
    // Create mention notifications
    await createMentions(fullText, userId, 'post', post._id, 'Post');
    
    // Update anonymous post count
    if (isAnonymous) {
      await User.updateOne({ _id: userId }, {
        $inc: { anonymousPostsToday: 1 },
        lastAnonymousReset: new Date(),
      });
    }
    
    // Populate and return
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'charchaUsername avatarIndex karma rank customFlair');
    
    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

/**
 * Get posts with sorting
 */
exports.getPosts = async (req, res) => {
  try {
    const { sort = 'hot', tag, page = 1, limit = 20, timeframe } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { isDeleted: false };
    if (tag && tag !== 'all') {
      query.tag = tag;
    }
    
    // Apply timeframe for 'top' sort
    if (sort === 'top' && timeframe) {
      const now = new Date();
      const timeframes = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
      };
      if (timeframes[timeframe]) {
        query.createdAt = { $gte: new Date(now - timeframes[timeframe]) };
      }
    }
    
    // Get posts
    let posts = await Post.find(query)
      .sort(getPostSortQuery(sort))
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'charchaUsername avatarIndex karma rank customFlair isAdmin')
      .lean();
    
    // Get user's votes if authenticated
    let userVotes = {};
    if (req.user) {
      const votes = await Vote.find({
        user: req.user._id,
        targetType: 'post',
        targetId: { $in: posts.map(p => p._id) },
      }).lean();
      votes.forEach(v => {
        userVotes[v.targetId.toString()] = v.voteType;
      });
    }
    
    // Add vote info and hide anonymous author details
    posts = posts.map(post => {
      const p = { ...post };
      p.userVote = userVotes[post._id.toString()] || 0;
      p.score = post.upvotes - post.downvotes;
      
      if (post.isAnonymous) {
        p.author = {
          charchaUsername: 'Anonymous',
          avatarIndex: -1,
          isAnonymous: true,
        };
      }
      return p;
    });
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

/**
 * Get single post by ID or share slug
 */
exports.getPost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    // Try to find by ID first, then by share slug
    let post;
    if (idOrSlug.match(/^[a-f0-9]{24}$/i)) {
      post = await Post.findOne({ _id: idOrSlug, isDeleted: false });
    }
    if (!post) {
      post = await Post.findOne({ shareSlug: idOrSlug, isDeleted: false });
    }
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    await post.populate('author', 'charchaUsername avatarIndex karma rank customFlair isAdmin');
    
    // Get user's vote if authenticated
    let userVote = 0;
    if (req.user) {
      const vote = await Vote.findOne({
        user: req.user._id,
        targetType: 'post',
        targetId: post._id,
      });
      if (vote) userVote = vote.voteType;
    }
    
    const postObj = post.toObject();
    postObj.userVote = userVote;
    postObj.score = post.upvotes - post.downvotes;
    
    if (post.isAnonymous) {
      postObj.author = {
        charchaUsername: 'Anonymous',
        avatarIndex: -1,
        isAnonymous: true,
      };
    }
    
    res.json({ post: postObj });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};

/**
 * Delete a post
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Only author or admin can delete
    if (post.author.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    
    // Soft delete
    post.isDeleted = true;
    await post.save();
    
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};

/**
 * Get shareable link for a post
 */
exports.getShareLink = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).select('shareSlug');
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Construct full URL (frontend will handle this route)
    const shareUrl = `/charcha/post/${post.shareSlug}`;
    
    res.json({ shareUrl, shareSlug: post.shareSlug });
  } catch (error) {
    console.error("Get share link error:", error);
    res.status(500).json({ message: "Error getting share link", error: error.message });
  }
};
