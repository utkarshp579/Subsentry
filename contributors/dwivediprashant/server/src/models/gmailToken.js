const mongoose = require("mongoose");

const gmailTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "default",
      index: true,
      unique: true,
    },
    accessTokenEncrypted: {
      type: String,
      required: true,
    },
    refreshTokenEncrypted: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    tokenType: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const GmailToken = mongoose.model("GmailToken", gmailTokenSchema);

module.exports = GmailToken;
