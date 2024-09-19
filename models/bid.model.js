const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BidSchema = new Schema({
    sneaker: {
        type: Schema.Types.ObjectId,
        ref: 'Sneaker',
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    highestBid: {
        type: Number,
        required: true
    },
    instantBuyPrice: {
        type: Number,  // Highest price for instant buy option
        required: true
    },
    minimumBidIncrement: {
        type: Number,  // Minimum increment preset by app
        default: 500
    },
    biddingEndsAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    bids: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    winner: {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number,
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' } // 'pending' until payment is made
    }
});

const Bid = mongoose.model('Bid', BidSchema);
module.exports = Bid;
