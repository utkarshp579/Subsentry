import { Subscription } from '../models/Subscription.js';
import { SubscriptionCandidate } from '../models/SubscriptionCandidate.js';
import { createHash } from 'crypto';
import {
    BILLING_CYCLES,
    SUBSCRIPTION_SOURCES,
    SUBSCRIPTION_STATUS,
    SUBSCRIPTION_CATEGORIES,
} from '../constants/subscription.constants.js';

/**
 * Subscription Saver Service
 * Converts parsed email data into subscription records with deduplication
 */

// Category detection based on service name
const SERVICE_CATEGORIES = {
    'Netflix': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'Disney+': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'HBO Max': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'Spotify': SUBSCRIPTION_CATEGORIES.MUSIC,
    'YouTube Premium': SUBSCRIPTION_CATEGORIES.MUSIC,
    'Apple': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'GitHub': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Notion': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Slack': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Canva': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Adobe': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Microsoft 365': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Dropbox': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Google': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'Grammarly': SUBSCRIPTION_CATEGORIES.EDUCATION,
    'LinkedIn': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
    'VPN Service': SUBSCRIPTION_CATEGORIES.OTHER,
    'PlayStation': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'Xbox': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'Nintendo': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'Amazon Prime': SUBSCRIPTION_CATEGORIES.ENTERTAINMENT,
    'Zoom': SUBSCRIPTION_CATEGORIES.PRODUCTIVITY,
};

/**
 * Map parsed email to subscription schema
 * @param {Object} parsedEmail - Parsed email data
 * @param {string} userId - User ID
 */
const mapToSubscription = (parsedEmail, userId) => {
    // ... (Legacy support, though typically we use saveCandidates now)
    const {
        vendorName, // Updated key
        extractedData
    } = parsedEmail;

    // Normalize new vs old format
    const name = vendorName || parsedEmail.serviceName;
    const data = extractedData || parsedEmail;

    if (!name) return null;

    const {
        billingCycle,
        amount,
        currency,
        transactionTypes,
        renewalDate
    } = data;

    // Determine billing cycle
    let cycle = BILLING_CYCLES.MONTHLY;
    if (billingCycle === 'yearly') cycle = BILLING_CYCLES.YEARLY;
    else if (billingCycle === 'weekly') cycle = BILLING_CYCLES.WEEKLY;

    const isTrial = transactionTypes?.includes('trial') || false;
    const category = SERVICE_CATEGORIES[name] || SUBSCRIPTION_CATEGORIES.OTHER;

    return {
        userId,
        name: name,
        amount: amount || 0,
        currency: currency || 'USD',
        billingCycle: cycle,
        category,
        renewalDate: renewalDate || new Date(),
        isTrial,
        source: SUBSCRIPTION_SOURCES.GMAIL,
        status: SUBSCRIPTION_STATUS.ACTIVE,
    };
};

/**
 * Check if subscription already exists (deduplication)
 */
const findExisting = async (userId, name, amount = null) => {
    const query = {
        userId,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    };

    if (amount !== null && amount > 0) {
        query.amount = amount;
    }

    return await Subscription.findOne(query);
};

/**
 * Save multiple candidates from parsed emails
 * V2 Logic: Persist as SubscriptionCandidate instead of direct Subscription
 */
export const saveCandidates = async (parsedEmails, userId) => {
    const results = {
        saved: 0,
        skipped: 0,
        errors: 0,
        lowConfidence: 0,
        details: []
    };

    const CONFIDENCE_THRESHOLD = 40; // Only save valid-looking ones

    for (const email of parsedEmails) {
        try {
            // 1. Skip if missing parsed data or low confidence
            if (!email.parsed || !email.vendorName) {
                results.errors++;
                continue;
            }

            if (email.confidenceScore < CONFIDENCE_THRESHOLD) {
                results.lowConfidence++;
                continue;
            }

            // 2. Exact Deduplication (Has this specific email message been processed?)
            const exists = await SubscriptionCandidate.findOne({ userId, messageId: email.messageId });
            if (exists) {
                results.skipped++;
                results.details.push({ vendor: email.vendorName, status: 'EXISTS_MSG' });
                continue;
            }

            // 3. functional Deduplication (Does user already have this Active subscription?)
            const existingSub = await findExisting(userId, email.vendorName, email.extractedData?.amount);
            if (existingSub) {
                // We might still want to save it as a candidate but mark it or just skip
                // For now, let's skip to avoid spamming candidates for known subs
                results.skipped++;
                results.details.push({ vendor: email.vendorName, status: 'EXISTS_SUB' });
                continue;
            }

            // 4. Create Candidate
            const dedupeHash = createHash('sha256')
                .update(`${userId}:${email.messageId}:${email.vendorName}`)
                .digest('hex');

            await SubscriptionCandidate.create({
                userId,
                messageId: email.messageId,
                vendorName: email.vendorName,
                rawVendor: email.rawVendor,
                vendorIcon: email.vendorIcon,
                confidenceScore: email.confidenceScore,
                dedupeHash,
                extractedData: email.extractedData,
                status: 'PENDING',
                signals: email.signals,
                metadata: {
                    originalSubject: email.originalSubject,
                    originalSender: email.originalSender,
                    emailTimestamp: email.emailTimestamp
                }
            });

            results.saved++;
            results.details.push({ vendor: email.vendorName, status: 'SAVED' });

        } catch (error) {
            console.error('Error saving candidate:', error);
            results.errors++;
        }
    }

    return results;
};

// ... keep legacy saveEmailSubscriptions for backward compat if needed, or deprecate
export const saveEmailSubscriptions = async (parsedEmails, userId) => {
    // Redirect to new logic if it looks like new data structure
    if (parsedEmails.length > 0 && parsedEmails[0].vendorName) {
        return await saveCandidates(parsedEmails, userId);
    }
    // Fallback for old structure (omitted for brevity, or kept as is)
    return { saved: 0, message: 'Legacy format not supported in V2' };
};

export { mapToSubscription, findExisting };
