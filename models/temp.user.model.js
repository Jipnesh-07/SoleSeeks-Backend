const mongoose = require("mongoose");

const tempUser = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TempUserModel", tempUser);
