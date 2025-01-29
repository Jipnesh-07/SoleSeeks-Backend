const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    content: String,
    image: String,
    community: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    flags: {
      bullyingOrUnwantedContact: { type: Number, default: 0 },
      violenceHateOrExploitation: { type: Number, default: 0 },
      sellingOrPromotingRestrictedItems: { type: Number, default: 0 },
      nudityOrSexualActivity: { type: Number, default: 0 },
      scamFraudOrSpam: { type: Number, default: 0 },
      falseInformation: { type: Number, default: 0 },
      totalFlags: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
