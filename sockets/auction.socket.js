const Auction = require("../models/auction.model");

//? In-memory data structures to track real-time data
const bids = {}; // { auctionId: [{ userId, amount, timestamp }] }
const userCounts = {}; // { auctionId: Set of userIds }

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("place_bid", async ({ auctionId, bidAmount, userId }) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) {
          return socket.emit("bidError", { message: "Auction not found." });
        }

        if (!auction.isActive) {
          return socket.emit("bidError", {
            message: "Bidding has ended for this auction.",
          });
        }

        if (bids[auctionId].length > 0) {
          const lastBid = bids[auctionId][bids[auctionId].length - 1];
          if (bidAmount <= lastBid.amount) {
            return socket.emit("bidError", { message: "Bid is too low." });
          }
        }

        if (!bids[auctionId]) {
          bids[auctionId] = [];
          userCounts[auctionId] = new Set();
        }

        const bid = {
          user: userId,
          amount: bidAmount,
          timestamp: new Date(),
        };

        bids[auctionId].push(bid);
        userCounts[auctionId].add(userId);

        auction.highestBid = bidAmount;
        auction.bids.push(bid);

        await auction.save();

        io.emit(`bid_update_${auctionId}`, {
          bids: bids[auctionId],
          userCount: userCounts[auctionId].size,
        });
      } catch (error) {
        console.error("Error processing new bid:", error);
        socket.emit("error", "Error processing your bid. Please try again.");
      }
    });

    //! Still in Progress
    socket.on("end_auction", async (auctionId) => {
      await endAuction(auctionId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

async function endAuction(auctionId) {
  try {
    const auction = await Auction.findById(auctionId);
    if (auction && auction.isActive) {
      auction.isActive = false;

      const bidHistory = bids[auctionId] || [];
      auction.bids = bidHistory;

      auction.uniqueBiddersCount = userCounts[auctionId]?.size || 0;

      await auction.save();

      io.emit(`auction_ended_${auctionId}`, {
        auctionId,
        bids: auction.bids,
        highestBid: auction.highestBid,
        uniqueBiddersCount: auction.uniqueBiddersCount,
      });

      console.log(
        `Auction for ${auctionId} ended. Data saved to the database.`
      );
    }

    // Clean up in-memory data for this auction
    delete bids[auctionId];
    delete userCounts[auctionId];
  } catch (error) {
    console.error("Error ending auction:", error);
  }
}
