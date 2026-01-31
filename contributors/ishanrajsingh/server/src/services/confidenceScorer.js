/**
 * Service to calculate confidence scores for extracted subscription data
 */

export const calculateConfidence = (extractionResult) => {
    let score = 0;
    const signals = [];

    const {
        vendorMatch, // { name, method, confidence }
        amount,
        billingCycle,
        transactionTypes,
        renewalDate,
        originalSubject
    } = extractionResult;

    // 1. Vendor Confidence
    if (vendorMatch) {
        if (vendorMatch.method === 'REGEX_MATCH') {
            score += 40;
            signals.push(`Exact vendor match: ${vendorMatch.name}`);
        } else if (vendorMatch.method === 'FUZZY_MATCH') {
            score += 20 + (vendorMatch.confidence * 20); // 20-40 points based on similarity
            signals.push(`Fuzzy vendor match: ${vendorMatch.name} (${Math.round(vendorMatch.confidence * 100)}%)`);
        } else {
            score += 10;
            signals.push(`Extracted potential vendor: ${vendorMatch.name}`);
        }
    }

    // 2. Financial Data
    if (amount) {
        score += 25;
        signals.push('Found transaction amount');
    }

    // 3. Subscription Metadata
    if (billingCycle) {
        score += 15;
        signals.push(`Detected billing cycle: ${billingCycle}`);
    }

    if (renewalDate) {
        score += 10;
        signals.push('Found date');
    }

    // 4. Transaction Context
    if (transactionTypes && transactionTypes.length > 0) {
        const strongKeywords = ['subscription', 'renewal', 'invoice', 'receipt'];
        const hasStrongKeyword = transactionTypes.some(t => strongKeywords.includes(t));

        if (hasStrongKeyword) {
            score += 10;
            signals.push(`Found transaction keywords: ${transactionTypes.join(', ')}`);
        }
    }

    // 5. Negative Signals
    if (originalSubject) {
        const negativePatterns = [/verify/i, /code/i, /login/i, /alert/i, /digest/i, /newsletter/i];
        for (const pattern of negativePatterns) {
            if (pattern.test(originalSubject)) {
                score -= 20;
                signals.push('Subject contains non-subscription keywords');
                break;
            }
        }
    }

    // Clamp score 0-100
    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        signals
    };
};
