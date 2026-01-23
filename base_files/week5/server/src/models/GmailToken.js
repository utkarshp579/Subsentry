import { Schema, model } from 'mongoose';

/**
 * GmailToken Model
 * Stores encrypted OAuth tokens for Gmail integration
 * Tokens are encrypted at rest for security
 */
const gmailTokenSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        connectedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const GmailToken = model('GmailToken', gmailTokenSchema);
