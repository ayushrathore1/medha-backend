const Vote = require("../models/Vote");
const Post = require("../models/Post");
const CharchaComment = require("../models/CharchaComment");
const User = require("../models/User");
const { calculateHotScore, calculateWilsonScore } = require("../utils/rankingAlgorithms");
const { getRankFromKarma } = require("../utils/usernameGenerator");

/**
 * Vote on a post or comment
 */
exports.vote = async (req, res) => {
  try {
    const { targetType, targetId, voteType } = req.body;
    const userId = req.user._id;
    
    // Validate
    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ message: "Invalid target type" });
    }
    if (![1, -1].includes(voteType)) {
      return res.status(400).json({ message: "Vote type must be 1 (upvote) or -1 (downvote)" });
    }
    
    const targetModel = targetType === 'post' ? 'Post' : 'CharchaComment';
    
    // Get the target to find the author
    let target;
    if (targetType === 'post') {
      target = await Post.findById(targetId);
    } else {
      target = await CharchaComment.findById(targetId);
    }
    
    if (!target || target.isDeleted) {
      return res.status(404).json({ message: `${targetType} not found` });
    }
    
    // Can't vote on own content
    if (target.author.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot vote on your own content" });
    }
    
    // Check for existing vote
    const existingVote = await Vote.findOne({
      user: userId,
      targetType,
      targetId,
    });
    
    let karmaChange = 0;
    let upvoteChange = 0;
    let downvoteChange = 0;
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote = remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        
        if (voteType === 1) {
          upvoteChange = -1;
          karmaChange = -1;
        } else {
          downvoteChange = -1;
          karmaChange = 1;
        }
      } else {
        // Different vote = switch vote
        existingVote.voteType = voteType;
        await existingVote.save();
        
        if (voteType === 1) {
          upvoteChange = 1;
          downvoteChange = -1;
          karmaChange = 2; // Removes -1 and adds +1
        } else {
          upvoteChange = -1;
          downvoteChange = 1;
          karmaChange = -2;
        }
      }
    } else {
      // New vote
      await Vote.create({
        user: userId,
        targetType,
        targetId,
        targetModel,
        voteType,
      });
      
      if (voteType === 1) {
        upvoteChange = 1;
        karmaChange = 1;
      } else {
        downvoteChange = 1;
        karmaChange = -1;
      }
    }
    
    // Update vote counts on target
    const updateQuery = {};
    if (upvoteChange !== 0) updateQuery.upvotes = upvoteChange;
    if (downvoteChange !== 0) updateQuery.downvotes = downvoteChange;
    
    if (targetType === 'post') {
      const updatedPost = await Post.findByIdAndUpdate(
        targetId,
        { $inc: updateQuery },
        { new: true }
      );
      
      // Update hot score
      const newHotScore = calculateHotScore(
        updatedPost.upvotes,
        updatedPost.downvotes,
        updatedPost.createdAt
      );
      await Post.updateOne({ _id: targetId }, { hotScore: newHotScore });
    } else {
      const updatedComment = await CharchaComment.findByIdAndUpdate(
        targetId,
        { $inc: updateQuery },
        { new: true }
      );
      
      // Update Wilson score
      const newWilsonScore = calculateWilsonScore(
        updatedComment.upvotes,
        updatedComment.downvotes
      );
      await CharchaComment.updateOne({ _id: targetId }, { wilsonScore: newWilsonScore });
    }
    
    // Update author's karma (if not anonymous)
    if (!target.isAnonymous && karmaChange !== 0) {
      const authorUpdate = await User.findByIdAndUpdate(
        target.author,
        { $inc: { karma: karmaChange } },
        { new: true }
      );
      
      // Update rank if needed
      const newRank = getRankFromKarma(authorUpdate.karma);
      if (authorUpdate.rank !== newRank) {
        await User.updateOne({ _id: target.author }, { rank: newRank });
      }
    }
    
    // Get updated target
    const finalTarget = targetType === 'post'
      ? await Post.findById(targetId).select('upvotes downvotes')
      : await CharchaComment.findById(targetId).select('upvotes downvotes');
    
    // Get user's current vote
    const currentVote = await Vote.findOne({
      user: userId,
      targetType,
      targetId,
    });
    
    res.json({
      message: "Vote recorded",
      upvotes: finalTarget.upvotes,
      downvotes: finalTarget.downvotes,
      score: finalTarget.upvotes - finalTarget.downvotes,
      userVote: currentVote ? currentVote.voteType : 0,
    });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Error recording vote", error: error.message });
  }
};

/**
 * Remove a vote
 */
exports.removeVote = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;
    
    const existingVote = await Vote.findOne({
      user: userId,
      targetType,
      targetId,
    });
    
    if (!existingVote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    // Get target for karma update
    let target;
    if (targetType === 'post') {
      target = await Post.findById(targetId);
    } else {
      target = await CharchaComment.findById(targetId);
    }
    
    const voteType = existingVote.voteType;
    await Vote.deleteOne({ _id: existingVote._id });
    
    // Update vote counts
    const updateQuery = voteType === 1 
      ? { $inc: { upvotes: -1 } }
      : { $inc: { downvotes: -1 } };
    
    if (targetType === 'post') {
      await Post.updateOne({ _id: targetId }, updateQuery);
    } else {
      await CharchaComment.updateOne({ _id: targetId }, updateQuery);
    }
    
    // Update author karma
    if (target && !target.isAnonymous) {
      const karmaChange = voteType === 1 ? -1 : 1;
      await User.updateOne({ _id: target.author }, { $inc: { karma: karmaChange } });
    }
    
    res.json({ message: "Vote removed" });
  } catch (error) {
    console.error("Remove vote error:", error);
    res.status(500).json({ message: "Error removing vote", error: error.message });
  }
};

/**
 * Get user's votes for multiple targets (for UI state)
 */
exports.getUserVotes = async (req, res) => {
  try {
    const { targetType, targetIds } = req.body;
    const userId = req.user._id;
    
    const votes = await Vote.find({
      user: userId,
      targetType,
      targetId: { $in: targetIds },
    }).lean();
    
    const voteMap = {};
    votes.forEach(v => {
      voteMap[v.targetId.toString()] = v.voteType;
    });
    
    res.json({ votes: voteMap });
  } catch (error) {
    console.error("Get user votes error:", error);
    res.status(500).json({ message: "Error fetching votes", error: error.message });
  }
};
