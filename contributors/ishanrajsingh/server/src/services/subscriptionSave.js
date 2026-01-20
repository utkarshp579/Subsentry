import { Subscription } from '../models/Subscription.js';
import {
    BILLING_CYCLES,
    SUBSCRIPTION_SOURCES,
    SUBSCRIPTION_STATUS,
    SUBSCRIPTION_CATEGORIES,
} from '../constants/subscription.constants.js';

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

const mapToSubscription = (parsedEmail, userId) => {
    const {
        serviceName,
        billingCycle,
        amount,
        currency,
        timestamp,
        transactionTypes,
    } = parsedEmail;

    if (!serviceName) {
        return null;
    }

    let renewalDate = new Date();
    if (timestamp) {
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) {
            renewalDate = parsed;
        }
    }

    let cycle = BILLING_CYCLES.MONTHLY;
    if (billingCycle === 'yearly') cycle = BILLING_CYCLES.YEARLY;
    else if (billingCycle === 'weekly') cycle = BILLING_CYCLES.WEEKLY;
    else if (billingCycle === 'monthly') cycle = BILLING_CYCLES.MONTHLY;

    const isTrial = transactionTypes?.includes('trial') || false;

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

const saveSubscription = async (subscriptionData) => {
    try {
        const { userId, name, amount } = subscriptionData;

        const existing = await findExisting(userId, name, amount);

        if (existing) {
            return {
                saved: false,
                subscription: existing,
                reason: 'Duplicate subscription already exists',
            };
        }

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

export const saveEmailSubscriptions = async (parsedEmails, userId) => {
    const results = [];
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    const seenServices = new Set();

    for (const email of parsedEmails) {
        if (!email.parsed || !email.serviceName) {
            continue;
        }

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