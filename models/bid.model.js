const mongoose = require('mongoose');

const biddingSchema = new mongoose.Schema({
    sneaker: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Sneaker', 
        required: true 
    },
    currentPrice: { 
        type: Number, 
        required: true 
    },
    minimumBidIncrement: { 
        type: Number, 
        default: 50 
    },
    bids: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        amount: Number,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    highestBid: {
        type: Number,
        default: 0
    },
    biddingEndsAt: { 
        type: Date, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Bid', biddingSchema);
