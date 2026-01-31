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
            required: true,
            trim: true,
        },
        rawVendor: {
            type: String,
        },
        vendorIcon: {
            type: String,
            default: 'default',
        },
        confidenceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            index: true,
        },
        dedupeHash: {
            type: String,
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
            type: String,
        }],
        metadata: {
            originalSubject: String,
            originalSender: String,
            emailTimestamp: Date,
        }
    },
    { timestamps: true }
);

subscriptionCandidateSchema.index({ userId: 1, messageId: 1 }, { unique: true });
subscriptionCandidateSchema.index({ userId: 1, dedupeHash: 1 });

export const SubscriptionCandidate = model('SubscriptionCandidate', subscriptionCandidateSchema);
