import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { parseEmails } from '../src/services/emailParser.js';
import { saveCandidates } from '../src/services/subscriptionSaver.js';
import { SubscriptionCandidate } from '../src/models/SubscriptionCandidate.js';

dotenv.config();

const MOCK_EMAILS = [
    {
        messageId: 'demo-msg-101',
        sender: 'Amazon Pay <no-reply@amazonpay.in>',
        subject: 'Payment successful for your Amazon order',
        snippet: 'Your payment of ₹1,499 for Order #402-9182736 has been processed successfully.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-102',
        sender: 'Swiggy <order@swiggy.in>',
        subject: 'Your Swiggy order has been delivered',
        snippet: 'Hope you enjoyed your meal! Order #SW-876542 was delivered successfully.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-103',
        sender: 'Google Cloud <billing-noreply@google.com>',
        subject: 'Your Google Cloud invoice for January 2026',
        snippet: 'Your invoice amount of $27.43 is now available.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-104',
        sender: 'Razorpay <no-reply@razorpay.com>',
        subject: 'Payment receipt',
        snippet: '₹3,200 received from ACME Corp. Transaction ID: TXN908712.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-105',
        sender: 'IRCTC <ticket@irctc.co.in>',
        subject: 'E-Ticket Confirmation',
        snippet: 'Your train ticket for booking ID 8432198765 is confirmed.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-106',
        sender: 'Flipkart <order-update@flipkart.com>',
        subject: 'Your Flipkart order is out for delivery',
        snippet: 'Order ID OD329817236 will be delivered today.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-107',
        sender: 'HDFC Bank <alerts@hdfcbank.net>',
        subject: 'Debit Alert: ₹12,000 spent on your card',
        snippet: '₹12,000 was spent using your HDFC Debit Card at Croma Store.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-108',
        sender: 'Zoom <no-reply@zoom.us>',
        subject: 'Your Zoom subscription renewal receipt',
        snippet: 'Your Pro plan has been renewed. Amount charged: $14.99.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-109',
        sender: 'Zomato <order@zomato.com>',
        subject: 'Order delivered — Rate your experience',
        snippet: 'Your order #ZO-567821 has been delivered. Tell us how we did!',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-110',
        sender: 'Medium Daily Digest <noreply@medium.com>',
        subject: 'Stories you’ll love today',
        snippet: 'Top reads on AI, startups, and productivity this morning.',
        timestamp: new Date().toISOString()
    }
];

const DEMO_USER_ID = 'demo-user';

const runDemo = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGO_URI is not defined in .env');
        await mongoose.connect(uri);
        console.log('Connected.');

        await SubscriptionCandidate.deleteMany({ userId: DEMO_USER_ID });
        console.log('Cleaned up old demo data.');

        console.log('\nParsing Emails (The "Brain" of V2)...');
        const parsed = parseEmails(MOCK_EMAILS);

        parsed.forEach((p) => {
            const label = p.confidenceScore > 80 ? '[HIGH]' : p.confidenceScore > 40 ? '[MED] ' : '[LOW] ';
            console.log(`${label} Vendor: ${p.vendorName?.padEnd(15) || 'Unknown'.padEnd(15)} | Score: ${p.confidenceScore}% | Signals: ${p.signals.length}`);
        });

        console.log('\nSaving Candidates (Deduplication & Persistence)...');
        const saveResult = await saveCandidates(parsed, DEMO_USER_ID);
        console.log(`Saved: ${saveResult.saved}`);
        console.log(`Skipped: ${saveResult.skipped}`);
        console.log(`Low Confidence/Errors: ${saveResult.errors + saveResult.lowConfidence}`);

        console.log('\nVerifying Database State...');
        const candidates = await SubscriptionCandidate.find({ userId: DEMO_USER_ID });
        console.log(`Found ${candidates.length} documents in 'subscriptioncandidates' collection:`);

        candidates.forEach(c => {
            console.log(`   - [${c.status}] ${c.vendorName} (Icon: ${c.vendorIcon}) ($${c.extractedData?.amount})`);
        });

        console.log('\nCOMPLETE');

    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runDemo();
