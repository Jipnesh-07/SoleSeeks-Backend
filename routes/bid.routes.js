const express = require("express");
const router = express.Router();
const {
  createBid,
  placeBid,
  closeBid,
  getActiveBidsForSneaker,
  getBidDetails,
  updateBid,
  deleteBid,
  getAllActiveBids
} = require("../controllers/bid.controller");

// REST API routes
router.post("/create", createBid);
router.post("/place", placeBid);
router.post("/close", closeBid);
router.get("/sneaker/:sneakerId", getActiveBidsForSneaker);
router.get("/:bidId", getBidDetails);
router.put("/update/:bidId", updateBid);
router.delete("/delete/:bidId", deleteBid);
router.get("/getAllActiveBids", getAllActiveBids)

module.exports = router;
