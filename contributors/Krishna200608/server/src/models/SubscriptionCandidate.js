import { Schema, model } from 'mongoose';

const subscriptionCandidateSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        messageId: {
            type: String,
            required: true,
            index: true,
        },
        vendorName: {
            type: String,
            required: true, // Normalized name (e.g., "Netflix")
            trim: true,
        },
        rawVendor: {
            type: String, // What we actually found (e.g., "Netflix, Inc.")
        },
        vendorIcon: {
            type: String, // Icon key (e.g., "netflix")
            default: 'default',
        },
        confidenceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            index: true,
        },
        extractedData: {
            amount: Number,
            currency: String,
            billingCycle: String,
            renewalDate: Date,
            transactionType: [String],
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'MERGED'],
            default: 'PENDING',
            index: true,
        },
        signals: [{
            type: String, // Explanations like "Found 'receipt' in subject"
        }],
        metadata: {
            originalSubject: String,
            originalSender: String,
            emailTimestamp: Date,
        }
    },
    { timestamps: true }
);

// Compound index to prevent duplicate candidates for the same message
subscriptionCandidateSchema.index({ userId: 1, messageId: 1 }, { unique: true });

export const SubscriptionCandidate = model('SubscriptionCandidate', subscriptionCandidateSchema);
