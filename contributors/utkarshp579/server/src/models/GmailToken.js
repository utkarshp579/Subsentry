import mongoose from "mongoose";

const { Schema, model } = mongoose;

const GmailTokenSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },

    gmailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    encryptedAccessToken: {
      type: String,
      required: true,
    },

    encryptedRefreshToken: {
      type: String,
      required: true,
    },

    accessTokenExpiresAt: {
      type: Date,
      required: true,
    },

    connectedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const GmailToken = model("GmailToken", GmailTokenSchema);
