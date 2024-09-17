const express = require('express');
const router = express.Router();

const {
    createBid,
    placeBid,
    closeBid,
    getActiveBidsForSneaker,
    getBidDetails,
    updateBid,
    deleteBid
} = require('../controllers/bid.controller');

// Middleware to ensure user is authenticated
const authenticate = require("../middleware/auth.middleware.js");

// Route to create a new bid
router.post('/bids', authenticate, createBid);

// Route to place a bid on an existing bid
router.post('/bids/place', authenticate, placeBid);

// Route to close a bid
router.post('/bids/close', authenticate, closeBid);

// Route to get all active bids for a specific sneaker
router.get('/bids/sneaker/:sneakerId', getActiveBidsForSneaker);

// Route to get details of a specific bid
router.get('/bids/:bidId', getBidDetails);

// Route to update bid details (if needed)
router.put('/bids/:bidId', authenticate, updateBid);

// Route to delete a specific bid
router.delete('/bids/:bidId', authenticate, deleteBid);

module.exports = router;
