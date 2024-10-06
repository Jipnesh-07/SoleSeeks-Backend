const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    sneaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sneaker",
      required: true,
    },
    currentPrice: { type: Number, required: true },
    highestBid: { type: Number, required: true },
    bids: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    biddingEndsAt: { type: Date, required: true },
    instantBuyPrice: { type: Number }, // Instant Buy Price
    minimumBidIncrement: { type: Number, default: 100 }, // Minimum bid increment
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bid", bidSchema);
