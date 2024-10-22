const express = require("express");
const router = express.Router();
const {
  createAuction,
  getAuction,
} = require("../controllers/auction.controller");

router.post("/create", createAuction); // Create a new auction
router.get("/:id", getAuction); // Get auction details

module.exports = router;
