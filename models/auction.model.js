const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const auctionSchema = new mongoose.Schema(
  {
    sneaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sneaker",
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    highestBid: {
      type: Number,
      required: true,
    },
    bids: [bidSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    biddingEndsAt: {
      type: Date,
      required: true,
    },
    minimumBidIncrement: {
      type: Number,
      default: 100,
    },
    uniqueBiddersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
