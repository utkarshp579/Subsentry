import { Subscription } from '../models/Subscription.js';
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
    const {
        serviceName,
        billingCycle,
        amount,
        currency,
        timestamp,
        transactionTypes,
    } = parsedEmail;

    // Skip if no service name or amount
    if (!serviceName) {
        return null;
    }

    // Parse timestamp to date
    let renewalDate = new Date();
    if (timestamp) {
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) {
            renewalDate = parsed;
        }
    }

    // Determine billing cycle (default to monthly if unknown)
    let cycle = BILLING_CYCLES.MONTHLY;
    if (billingCycle === 'yearly') cycle = BILLING_CYCLES.YEARLY;
    else if (billingCycle === 'weekly') cycle = BILLING_CYCLES.WEEKLY;
    else if (billingCycle === 'monthly') cycle = BILLING_CYCLES.MONTHLY;

    // Detect if trial
    const isTrial = transactionTypes?.includes('trial') || false;

    // Get category
    const category = SERVICE_CATEGORIES[serviceName] || SUBSCRIPTION_CATEGORIES.OTHER;

    return {
        userId,
        name: serviceName,
        amount: amount || 0,
        currency: currency || 'USD',
        billingCycle: cycle,
        category,
        renewalDate,
        isTrial,
        source: SUBSCRIPTION_SOURCES.GMAIL,
        status: SUBSCRIPTION_STATUS.ACTIVE,
    };
};

/**
 * Check if subscription already exists (deduplication)
 * @param {string} userId - User ID
 * @param {string} name - Service name
 * @param {number} amount - Amount (optional)
 */
const findExisting = async (userId, name, amount = null) => {
    const query = {
        userId,
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive match
    };

    // If amount is provided, include in deduplication
    if (amount !== null && amount > 0) {
        query.amount = amount;
    }

    return await Subscription.findOne(query);
};

/**
 * Save a single subscription with deduplication
 * @param {Object} subscriptionData - Subscription data
 * @returns {Object} - { saved: boolean, subscription, reason }
 */
const saveSubscription = async (subscriptionData) => {
    try {
        const { userId, name, amount } = subscriptionData;

        // Check for existing subscription
        const existing = await findExisting(userId, name, amount);

        if (existing) {
            return {
                saved: false,
                subscription: existing,
                reason: 'Duplicate subscription already exists',
            };
        }

        // Create new subscription
        const subscription = new Subscription(subscriptionData);
        await subscription.save();

        return {
            saved: true,
            subscription,
            reason: 'New subscription created',
        };
    } catch (error) {
        return {
            saved: false,
            subscription: null,
            reason: `Error: ${error.message}`,
        };
    }
};

/**
 * Save multiple subscriptions from parsed emails
 * @param {Array} parsedEmails - Array of parsed email data
 * @param {string} userId - User ID
 * @returns {Object} - { saved, skipped, errors, results }
 */
export const saveEmailSubscriptions = async (parsedEmails, userId) => {
    const results = [];
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    // Group by service name to avoid duplicate processing
    const seenServices = new Set();

    for (const email of parsedEmails) {
        // Skip unparsed emails
        if (!email.parsed || !email.serviceName) {
            continue;
        }

        // Skip if we've already processed this service in this batch
        const serviceKey = `${email.serviceName}-${email.amount || 0}`;
        if (seenServices.has(serviceKey)) {
            results.push({
                serviceName: email.serviceName,
                saved: false,
                reason: 'Already processed in this batch',
            });
            skipped++;
            continue;
        }
        seenServices.add(serviceKey);

        // Map to subscription schema
        const subscriptionData = mapToSubscription(email, userId);

        if (!subscriptionData) {
            results.push({
                serviceName: email.serviceName,
                saved: false,
                reason: 'Could not map to subscription',
            });
            errors++;
            continue;
        }

        // Save with deduplication
        const result = await saveSubscription(subscriptionData);

        results.push({
            serviceName: email.serviceName,
            ...result,
        });

        if (result.saved) {
            saved++;
        } else if (result.reason.includes('Duplicate')) {
            skipped++;
        } else {
            errors++;
        }
    }

    return {
        saved,
        skipped,
        errors,
        total: saved + skipped + errors,
        results,
    };
};

export { mapToSubscription, findExisting };
