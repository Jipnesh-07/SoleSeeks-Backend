const Auction = require("../models/Auction");
const Sneaker = require("../models/sneaker.model");

const createAuction = async (req, res) => {
  try {
    const { sneakerId, startingPrice, biddingEndsAt, minimumBidIncrement } =
      req.body;

    const sneaker = await Sneaker.findById(sneakerId);
    if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });

    const newAuction = await Auction.create({
      sneaker: sneakerId,
      currentPrice: startingPrice,
      highestBid: startingPrice,
      biddingEndsAt,
      minimumBidIncrement,
    });
    res.status(201).json(newAuction);
  } catch (error) {
    res.status(500).json({ message: "Failed to create auction", error });
  }
};

const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate("sneaker");
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve auction", error });
  }
};

module.exports = { createAuction, getAuction };
