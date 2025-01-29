const express = require("express");
const router = express.Router();

const {
  joinCommunity,
  leaveCommunity,
  createPost,
  getAllCommunities,
  getPostsByCommunity,
  getUserCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getLeftCommunities,
  flagPost
} = require("../controllers/community.controller");

// Middleware to ensure user is authenticated
const authenticate = require("../middleware/auth.middleware.js");

// Route to create a new community
router.post("/create", authenticate, createCommunity);

// Route to join a community
router.post("/join", authenticate, joinCommunity);

// Route to leave a community
router.post("/leave", authenticate, leaveCommunity);

// Route to get all communities
router.get('/all', getAllCommunities);

// Route to get the user's joined communities
router.get("/user/all", authenticate, getUserCommunities);

//Route ti get the user's left communities
router.get('/user/left',authenticate,getLeftCommunities);

// Route to update details of a specific community
router.put("/update/:communityId", authenticate, updateCommunity);

// Route to delete a specific community
router.delete("/delete/:communityId", authenticate, deleteCommunity);

// Route to create a post in a community
router.post("/posts/create", authenticate, createPost);

// Route to get all posts for a specific community
router.get("/posts/:communityId", getPostsByCommunity);

router.post("/posts/:postId/flag", authenticate, flagPost);

module.exports = router;
