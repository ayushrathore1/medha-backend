const CharchaComment = require("../models/CharchaComment");
const Post = require("../models/Post");
const Vote = require("../models/Vote");
const User = require("../models/User");
const Mention = require("../models/Mention");
const { calculateWilsonScore, COMMENT_SORT_OPTIONS, getCommentSortQuery } = require("../utils/rankingAlgorithms");
const { generateUniqueUsername } = require("../utils/usernameGenerator");

/**
 * Parse @mentions from text
 */
const parseMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
};

/**
 * Create mentions in database
 */
const createMentions = async (text, authorId, sourceId) => {
  const mentionedUsernames = parseMentions(text);
  const hasAdminMention = mentionedUsernames.some(u => u.toLowerCase() === 'admin');
  
  const mentionedUsers = await User.find({
    charchaUsername: { $in: mentionedUsernames.filter(u => u.toLowerCase() !== 'admin') }
  }).select('_id');
  
  let adminUser = null;
  if (hasAdminMention) {
    adminUser = await User.findOne({ isAdmin: true }).select('_id');
  }
  
  const mentionDocs = [];
  
  for (const user of mentionedUsers) {
    if (user._id.toString() !== authorId.toString()) {
      mentionDocs.push({
        mentioner: authorId,
        mentionedUser: user._id,
        sourceType: 'comment',
        sourceId,
        sourceModel: 'CharchaComment',
        isAdminMention: false,
      });
    }
  }
  
  if (adminUser && adminUser._id.toString() !== authorId.toString()) {
    mentionDocs.push({
      mentioner: authorId,
      mentionedUser: adminUser._id,
      sourceType: 'comment',
      sourceId,
      sourceModel: 'CharchaComment',
      isAdminMention: true,
    });
  }
  
  if (mentionDocs.length > 0) {
    await Mention.insertMany(mentionDocs);
  }
  
  return { mentionedUserIds: mentionedUsers.map(u => u._id), hasAdminMention };
};

/**
 * Add a comment to a post
 */
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId, isAnonymous } = req.body;
    const userId = req.user._id;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Ensure user has Charcha username
    let user = await User.findById(userId);
    if (!user.charchaUsername) {
      const username = await generateUniqueUsername();
      user.charchaUsername = username;
      user.charchaJoinedAt = new Date();
      await user.save();
    }
    
    // Calculate depth if replying to another comment
    let depth = 0;
    if (parentCommentId) {
      const parentComment = await CharchaComment.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentComment.post.toString() !== postId) {
        return res.status(400).json({ message: "Parent comment doesn't belong to this post" });
      }
      depth = Math.min(parentComment.depth + 1, 10); // Max depth of 10
    }
    
    // Parse mentions
    const mentionedUsernames = parseMentions(content);
    const hasAdminMention = mentionedUsernames.some(u => u.toLowerCase() === 'admin');
    const mentionedUsers = await User.find({
      charchaUsername: { $in: mentionedUsernames.filter(u => u.toLowerCase() !== 'admin') }
    }).select('_id');
    
    // Create comment
    const comment = new CharchaComment({
      content,
      author: userId,
      post: postId,
      parentComment: parentCommentId || null,
      depth,
      isAnonymous: isAnonymous || false,
      mentions: mentionedUsers.map(u => u._id),
      hasAdminMention,
      wilsonScore: calculateWilsonScore(0, 0),
    });
    
    await comment.save();
    
    // Update post comment count
    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
    
    // Create mention notifications
    await createMentions(content, userId, comment._id);
    
    // Populate and return
    const populatedComment = await CharchaComment.findById(comment._id)
      .populate('author', 'charchaUsername avatarIndex karma rank customFlair');
    
    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

/**
 * Get comments for a post (threaded)
 */
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = 'best', page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Get top-level comments first
    let comments = await CharchaComment.find({
      post: postId,
      parentComment: null,
      isDeleted: false,
    })
      .sort(getCommentSortQuery(sort))
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'charchaUsername avatarIndex karma rank customFlair isAdmin')
      .lean();
    
    // Get all nested replies
    const allCommentIds = comments.map(c => c._id.toString());
    const allReplies = await CharchaComment.find({
      post: postId,
      parentComment: { $ne: null },
      isDeleted: false,
    })
      .sort(getCommentSortQuery(sort))
      .populate('author', 'charchaUsername avatarIndex karma rank customFlair isAdmin')
      .lean();
    
    // Get user votes if authenticated
    let userVotes = {};
    if (req.user) {
      const commentIds = [...comments.map(c => c._id), ...allReplies.map(r => r._id)];
      const votes = await Vote.find({
        user: req.user._id,
        targetType: 'comment',
        targetId: { $in: commentIds },
      }).lean();
      votes.forEach(v => {
        userVotes[v.targetId.toString()] = v.voteType;
      });
    }
    
    // Process comments
    const processComment = (comment) => {
      const c = { ...comment };
      c.userVote = userVotes[comment._id.toString()] || 0;
      c.score = comment.upvotes - comment.downvotes;
      
      if (comment.isAnonymous) {
        c.author = {
          charchaUsername: 'Anonymous',
          avatarIndex: -1,
          isAnonymous: true,
        };
      }
      
      return c;
    };
    
    comments = comments.map(processComment);
    const processedReplies = allReplies.map(processComment);
    
    // Build threaded structure
    const buildThread = (parentId) => {
      return processedReplies
        .filter(r => r.parentComment.toString() === parentId.toString())
        .map(reply => ({
          ...reply,
          replies: buildThread(reply._id),
        }));
    };
    
    const threadedComments = comments.map(comment => ({
      ...comment,
      replies: buildThread(comment._id),
    }));
    
    const total = await CharchaComment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });
    
    res.json({
      comments: threadedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

/**
 * Delete a comment
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    
    const comment = await CharchaComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Only author or admin can delete
    if (comment.author.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    
    // Soft delete
    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();
    
    // Update post comment count
    await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};
