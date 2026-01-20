import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const GmailOAuthSchema = new Schema(
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
  }
);


GmailOAuthSchema.index({ userId: 1 });

export const GmailToken = model('GmailToken', GmailOAuthSchema);