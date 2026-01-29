import { resolveVendor } from './vendorResolver.js';
import { calculateConfidence } from './confidenceScorer.js';

/**
 * Email Parser Service
 * Extracts subscription data from email metadata using rule-based parsing
 */

// Billing cycle patterns
const BILLING_PATTERNS = {
    monthly: /monthly|per\s*month|\/month|\/mo|each\s*month/i,
    yearly: /yearly|annual|per\s*year|\/year|\/yr|each\s*year/i,
    weekly: /weekly|per\s*week|\/week|each\s*week/i,
};

// Transaction type patterns
const TRANSACTION_PATTERNS = {
    renewal: /renewal|renewed|renewing|auto.?renew/i,
    payment: /payment|paid|charged|charge|transaction/i,
    invoice: /invoice|bill|billing|receipt/i,
    subscription: /subscription|subscribed|subscribe/i,
    trial: /trial|free\s*trial/i,
    cancelled: /cancel|cancelled|canceled/i,
};

// Amount extraction patterns (supports multiple currencies)
const AMOUNT_PATTERNS = [
    /\$\s*(\d+(?:[.,]\d{1,2})?)/,           // $9.99
    /(\d+(?:[.,]\d{1,2})?)\s*(?:USD|dollars?)/i,  // 9.99 USD
    /₹\s*(\d+(?:[.,]\d{1,2})?)/,            // ₹199
    /(\d+(?:[.,]\d{1,2})?)\s*(?:INR|rupees?)/i,   // 199 INR
    /€\s*(\d+(?:[.,]\d{1,2})?)/,            // €9.99
    /(\d+(?:[.,]\d{1,2})?)\s*(?:EUR|euros?)/i,    // 9.99 EUR
    /£\s*(\d+(?:[.,]\d{1,2})?)/,            // £9.99
    /(\d+(?:[.,]\d{1,2})?)\s*(?:GBP|pounds?)/i,   // 9.99 GBP
];

/**
 * Detect billing cycle from email content
 */
const detectBillingCycle = (text = '') => {
    for (const [cycle, pattern] of Object.entries(BILLING_PATTERNS)) {
        if (pattern.test(text)) {
            return cycle;
        }
    }
    return null;
};

/**
 * Detect transaction type from email content
 */
const detectTransactionType = (text = '') => {
    const types = [];
    for (const [type, pattern] of Object.entries(TRANSACTION_PATTERNS)) {
        if (pattern.test(text)) {
            types.push(type);
        }
    }
    return types.length > 0 ? types : ['unknown'];
};

/**
 * Extract amount from email content
 */
const extractAmount = (text = '') => {
    for (const pattern of AMOUNT_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            // Parse the amount
            const amountStr = match[1].replace(',', '.');
            const amount = parseFloat(amountStr);

            if (!isNaN(amount) && amount > 0 && amount < 10000) {
                // Detect currency
                let currency = 'USD';
                if (text.includes('₹') || /INR|rupee/i.test(text)) currency = 'INR';
                else if (text.includes('€') || /EUR|euro/i.test(text)) currency = 'EUR';
                else if (text.includes('£') || /GBP|pound/i.test(text)) currency = 'GBP';

                return { amount, currency };
            }
        }
    }
    return null;
};

/**
 * Parse a single email for subscription data
 * @param {Object} email - Email object with subject, sender, snippet
 */
export const parseEmail = (email) => {
    try {
        const { messageId, subject = '', sender = '', snippet = '', timestamp } = email;

        // Combine all text for analysis
        const combinedText = `${subject} ${snippet}`;

        // 1. Resolve Vendor
        const vendorResolveResult = resolveVendor(sender, sender, subject);
        const serviceName = vendorResolveResult ? vendorResolveResult.name : null;

        // 2. Extract Data
        const billingCycle = detectBillingCycle(combinedText);
        const transactionTypes = detectTransactionType(combinedText);
        const amountData = extractAmount(combinedText);

        // 3. Calculate Confidence
        const confidenceResult = calculateConfidence({
            vendorMatch: vendorResolveResult,
            amount: amountData?.amount,
            billingCycle,
            transactionTypes,
            renewalDate: timestamp ? new Date(timestamp) : null,
            originalSubject: subject
        });

        return {
            messageId,
            parsed: true,

            // Core Identity
            vendorName: serviceName,
            rawVendor: sender,
            vendorIcon: vendorResolveResult?.icon || 'default',

            // Confidence
            confidenceScore: confidenceResult.score,
            signals: confidenceResult.signals,

            // Extracted Info
            extractedData: {
                billingCycle: billingCycle || 'monthly', // Default to monthly if unknown but high confidence
                amount: amountData?.amount || null,
                currency: amountData?.currency || null,
                transactionTypes,
                renewalDate: timestamp ? new Date(timestamp) : new Date(),
            },

            // Metadata
            originalSubject: subject,
            originalSender: sender,
            emailTimestamp: timestamp,
        };
    } catch (error) {
        console.error('Error parsing email:', error);
        return {
            messageId: email?.messageId,
            parsed: false,
            error: 'Failed to parse email'
        };
    }
};

/**
 * Parse multiple emails
 * @param {Array} emails - Array of email objects
 */
export const parseEmails = (emails = []) => {
    return emails.map(email => parseEmail(email));
};

/**
 * Parse and group by service (Legacy support / for direct view)
 */
export const parseAndGroupByService = (emails = []) => {
    const parsed = parseEmails(emails);
    const grouped = {};

    for (const email of parsed) {
        if (!email.vendorName || email.confidenceScore < 30) continue;

        const key = email.vendorName;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(email);
    }

    return grouped;
};

export { BILLING_PATTERNS, TRANSACTION_PATTERNS };

