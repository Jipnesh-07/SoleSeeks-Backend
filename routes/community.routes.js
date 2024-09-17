const express = require("express");
const router = express.Router();

const {
  joinCommunity,
  leaveCommunity,
  createPost,
  getPostsByCommunity,
  getUserCommunities,
  createCommunity,
  getCommunityDetails,
  updateCommunity,
  deleteCommunity,
} = require("../controllers/community.controller");

// Middleware to ensure user is authenticated
const authenticate = require("../middleware/auth.middleware.js");

// Route to join a community
router.post("/communities/join", authenticate, joinCommunity);

// Route to leave a community
router.post("/communities/leave", authenticate, leaveCommunity);

// Route to create a post in a community
router.post("/posts", authenticate, createPost);

// Route to get all posts for a specific community
router.get("/posts/:communityId", getPostsByCommunity);

// Route to get the user's joined communities
router.get("/user/communities", authenticate, getUserCommunities);

// Route to create a new community
router.post("/create", authenticate, createCommunity);

// Route to get details of a specific community
router.get("/communities/:communityId", getCommunityDetails);

// Route to update details of a specific community
router.put("/communities/:communityId", authenticate, updateCommunity);

// Route to delete a specific community
router.delete("/communities/:communityId", authenticate, deleteCommunity);

module.exports = router;
