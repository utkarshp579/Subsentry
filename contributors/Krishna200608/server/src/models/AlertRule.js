import { Schema, model } from 'mongoose';

const alertRuleSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true, // One rule set per user
            index: true,
        },
        daysBefore: {
            type: Number,
            required: true,
            default: 3, // Default alert 3 days before
            min: 1,
            max: 30,
        },
        channels: {
            type: [String],
            enum: ['email', 'in-app'],
            default: ['email'],
        },
        enabled: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const AlertRule = model('AlertRule', alertRuleSchema);
