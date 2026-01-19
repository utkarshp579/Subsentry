import mongoose from "mongoose";

const gmailTokenSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  accessToken: String,
  refreshToken: String,
  expiryDate: Number
});

export default mongoose.model("GmailToken", gmailTokenSchema);
