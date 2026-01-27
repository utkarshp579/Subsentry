import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { parseEmails } from '../src/services/emailParser.js';
import { saveCandidates } from '../src/services/subscriptionSaver.js';
import { SubscriptionCandidate } from '../src/models/SubscriptionCandidate.js';

dotenv.config();

// 1. Mock Email Data (Represents what we'd get from Gmail API)
const MOCK_EMAILS = [
    {
        messageId: 'demo-msg-001',
        sender: 'Netflix <info@mailer.netflix.com>',
        subject: 'Your monthly membership payment',
        snippet: 'We successfully processed your payment of $15.49 for your Premium plan.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-002',
        sender: 'Spotify <no-reply@spotify.com>',
        subject: 'Your receipt for Spotify Premium',
        snippet: 'Here is your receipt for 9.99 USD. Automatic renewal is active.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-003',
        sender: 'billing@adobe.com',
        subject: 'Invoice for Creative Cloud',
        snippet: 'Your payment of $54.99 was successful.',
        timestamp: new Date().toISOString()
    },
    {
        messageId: 'demo-msg-004', // Low confidence example
        sender: 'newsletter@techweekly.com',
        subject: 'Top Tech News This Week',
        snippet: 'Read about the latest AI advancements...',
        timestamp: new Date().toISOString()
    }
];

const DEMO_USER_ID = 'pr-demo-user';

const runDemo = async () => {
    try {
        console.log('[STEP 1/4] Connecting to MongoDB...');
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGO_URI is not defined in .env');
        await mongoose.connect(uri);
        console.log('[SUCCESS] Connected.');

        // Cleanup previous demo run
        await SubscriptionCandidate.deleteMany({ userId: DEMO_USER_ID });
        console.log('[CLEANUP] Cleaned up old demo data.');

        console.log('\n[STEP 2/4] Parsing Emails (The "Brain" of V2)...');
        const parsed = parseEmails(MOCK_EMAILS);

        parsed.forEach((p) => {
            const label = p.confidenceScore > 80 ? '[HIGH]' : p.confidenceScore > 40 ? '[MED] ' : '[LOW] ';
            console.log(`${label} Vendor: ${p.vendorName?.padEnd(15) || 'Unknown'.padEnd(15)} | Score: ${p.confidenceScore}% | Signals: ${p.signals.length}`);
        });

        console.log('\n[STEP 3/4] Saving Candidates (Deduplication & Persistence)...');
        const saveResult = await saveCandidates(parsed, DEMO_USER_ID);
        console.log(`[SAVED]   Saved: ${saveResult.saved}`);
        console.log(`[SKIPPED] Skipped: ${saveResult.skipped}`);
        console.log(`[WARN]    Low Confidence/Errors: ${saveResult.errors + saveResult.lowConfidence}`);

        console.log('\n[STEP 4/4] Verifying Database State...');
        const candidates = await SubscriptionCandidate.find({ userId: DEMO_USER_ID });
        console.log(`[DB] Found ${candidates.length} documents in 'subscriptioncandidates' collection:`);

        candidates.forEach(c => {
            console.log(`   - [${c.status}] ${c.vendorName} (Icon: ${c.vendorIcon}) ($${c.extractedData?.amount})`);
        });

        console.log('\n[SUCCESS] DEMO COMPLETE');

    } catch (error) {
        console.error('[ERROR] Demo Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runDemo();
