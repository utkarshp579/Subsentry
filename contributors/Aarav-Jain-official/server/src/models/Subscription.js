import { Schema, model } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    renewalDate: {
      type: Date,
      required: true,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['manual', 'email'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

export const Subscription = model('Subscription', subscriptionSchema);
