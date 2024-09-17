const Bid = require('../models/bid.model');
const Sneaker = require('../models/sneaker.model');

exports.createBid = async (req, res) => {
    const { sneakerId, biddingEndsAt } = req.body;
    try {
        const sneaker = await Sneaker.findById(sneakerId);
        if (sneaker.condition !== 'best' || sneaker.price < 6000) {
            return res.status(400).json({ message: 'Sneaker not eligible for bidding.' });
        }
        const bid = new Bid({
            sneaker: sneakerId,
            currentPrice: sneaker.price,
            biddingEndsAt,
            highestBid: sneaker.price
        });
        await bid.save();
        res.status(201).json({ bid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.placeBid = async (req, res) => {
    const { bidId, amount } = req.body;
    try {
        const bid = await Bid.findById(bidId);
        if (!bid.isActive || new Date() > bid.biddingEndsAt) {
            return res.status(400).json({ message: 'Bidding has ended or is not active.' });
        }
        if (amount < bid.highestBid + bid.minimumBidIncrement) {
            return res.status(400).json({ message: `Bid must be at least ${bid.minimumBidIncrement} higher than the current highest bid.` });
        }
        bid.bids.push({ user: req.user._id, amount });
        bid.highestBid = amount;
        await bid.save();
        res.status(200).json({ bid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.closeBid = async (req, res) => {
    const { bidId } = req.body;
    try {
        const bid = await Bid.findById(bidId);
        if (new Date() <= bid.biddingEndsAt) {
            return res.status(400).json({ message: 'Bidding period has not ended yet.' });
        }
        bid.isActive = false;
        await bid.save();
        res.status(200).json({ bid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all active bids for a sneaker
exports.getActiveBidsForSneaker = async (req, res) => {
    const { sneakerId } = req.params;
    try {
        const bids = await Bid.find({ sneaker: sneakerId, isActive: true });
        res.status(200).json({ bids });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a specific bid
exports.getBidDetails = async (req, res) => {
    const { bidId } = req.params;
    try {
        const bid = await Bid.findById(bidId).populate('bids.user', 'username');
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json({ bid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update bid details (if needed)
exports.updateBid = async (req, res) => {
    const { bidId } = req.params;
    const { biddingEndsAt, minimumBidIncrement } = req.body;
    try {
        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        bid.biddingEndsAt = biddingEndsAt || bid.biddingEndsAt;
        bid.minimumBidIncrement = minimumBidIncrement || bid.minimumBidIncrement;
        await bid.save();
        res.status(200).json({ bid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a bid
exports.deleteBid = async (req, res) => {
    const { bidId } = req.params;
    try {
        const bid = await Bid.findByIdAndDelete(bidId);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json({ message: 'Bid deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};