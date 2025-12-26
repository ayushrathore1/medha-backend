const express = require("express");
const router = express.Router();

// Controllers
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const voteController = require("../controllers/voteController");
const followController = require("../controllers/followController");
const mentionController = require("../controllers/mentionController");

// Middleware
const protect = require("../middleware/auth");

// ==================== PUBLIC ROUTES ====================

// Posts - Public viewing
router.get("/posts", postController.getPosts);
router.get("/posts/:idOrSlug", postController.getPost);

// User search for @mentions (public for display)
router.get("/users/search", mentionController.searchUsers);

// ==================== PROTECTED ROUTES ====================

// Posts - Authenticated actions
router.post("/posts", protect, postController.createPost);
router.delete("/posts/:postId", protect, postController.deletePost);
router.get("/posts/:postId/share", protect, postController.getShareLink);

// Comments
router.get("/posts/:postId/comments", commentController.getComments);
router.post("/posts/:postId/comments", protect, commentController.addComment);
router.delete("/comments/:commentId", protect, commentController.deleteComment);

// Voting
router.post("/vote", protect, voteController.vote);
router.post("/vote/remove", protect, voteController.removeVote);
router.post("/votes/check", protect, voteController.getUserVotes);

// Following
router.post("/users/:userId/follow", protect, followController.followUser);
router.delete("/users/:userId/follow", protect, followController.unfollowUser);
router.get("/users/:userId/followers", followController.getFollowers);
router.get("/users/:userId/following", followController.getFollowing);
router.get("/users/:userId/following/check", protect, followController.checkFollowing);

// Mentions
router.get("/mentions", protect, mentionController.getMentions);
router.post("/mentions/read", protect, mentionController.markMentionsRead);

// Admin mentions (Admin only)
router.get("/admin/mentions", protect, mentionController.getAdminMentions);
router.post("/admin/mentions/read", protect, mentionController.markAdminMentionsRead);

module.exports = router;
