const Bid = require('../models/bid.model');
const Sneaker = require('../models/sneaker.model');

exports.createBid = async (req, res) => {
    const { sneakerId, instantBuyPrice, biddingEndsAt } = req.body;
    try {
        const sneaker = await Sneaker.findById(sneakerId);
        if (sneaker.condition !== 'best' || sneaker.price < 6000) {
            return res.status(400).json({ message: 'Sneaker not eligible for bidding.' });
        }

        const bid = new Bid({
            sneaker: sneakerId,
            currentPrice: sneaker.price,
            highestBid: sneaker.price,
            instantBuyPrice,  // Seller sets the highest price for instant buy
            biddingEndsAt,
            minimumBidIncrement: 500  // App preset
        });

        await bid.save();
        res.status(201).json({ bid });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.joinBiddingRoom = async (req, res) => {
    const { bidId, guidelinesAccepted } = req.body;
    try {
        if (!guidelinesAccepted) {
            return res.status(400).json({ message: 'You must accept the guidelines to join the bidding.' });
        }

        const bid = await Bid.findById(bidId);
        if (!bid.isActive || new Date() > bid.biddingEndsAt) {
            return res.status(400).json({ message: 'Bidding has ended or is not active.' });
        }

        // User successfully joins the bidding room (Socket connection would happen here)
        res.status(200).json({ message: 'Joined bidding room', bid });
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

        // Check for instant buy
        if (amount >= bid.instantBuyPrice) {
            bid.isActive = false;
            bid.winner = { user: req.user._id, amount, status: 'pending' };
        } else {
            bid.bids.push({ user: req.user._id, amount });
            bid.highestBid = amount;
        }

        await bid.save();

        // Notify other users in the room about the new bid (via Socket)
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

        // Close the bid and declare the highest bidder as the winner
        bid.isActive = false;

        if (bid.bids.length > 0) {
            const highestBid = bid.bids.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev));
            bid.winner = { user: highestBid.user, amount: highestBid.amount, status: 'pending' };
        }

        await bid.save();
        res.status(200).json({ message: 'Bid closed', winner: bid.winner });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.handlePayment = async (req, res) => {
    const { bidId } = req.body;
    try {
        const bid = await Bid.findById(bidId);
        if (!bid.winner) {
            return res.status(400).json({ message: 'No winner for this bid.' });
        }

        bid.winner.status = 'paid';
        await bid.save();

        res.status(200).json({ message: 'Payment successful, sneaker sold to winner.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.offerToSecondHighest = async (req, res) => {
    const { bidId } = req.body;
    try {
        const bid = await Bid.findById(bidId);
        if (bid.winner && bid.winner.status === 'pending') {
            return res.status(400).json({ message: 'First winner still has time to make payment.' });
        }

        // Find the second-highest bidder
        if (bid.bids.length > 1) {
            const sortedBids = bid.bids.sort((a, b) => b.amount - a.amount);
            const secondHighest = sortedBids[1];
            bid.winner = { user: secondHighest.user, amount: secondHighest.amount, status: 'pending' };
            await bid.save();
            res.status(200).json({ message: 'Sneaker offered to second-highest bidder.', winner: bid.winner });
        } else {
            res.status(400).json({ message: 'No other valid bids.' });
        }
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