/**
 * Email Parser Service
 * Extracts subscription data from email metadata using rule-based parsing
 * 
 * Note: Accuracy is not expected to be perfect — users can edit later
 */

// Common subscription service patterns
const KNOWN_SERVICES = [
    { pattern: /netflix/i, name: 'Netflix' },
    { pattern: /spotify/i, name: 'Spotify' },
    { pattern: /amazon\s*prime/i, name: 'Amazon Prime' },
    { pattern: /disney\s*\+|disneyplus/i, name: 'Disney+' },
    { pattern: /hbo\s*max|hbomax/i, name: 'HBO Max' },
    { pattern: /youtube\s*(premium|music)/i, name: 'YouTube Premium' },
    { pattern: /apple\s*(music|tv|one|arcade)/i, name: 'Apple' },
    { pattern: /google\s*(one|workspace|play)/i, name: 'Google' },
    { pattern: /microsoft\s*365|office\s*365/i, name: 'Microsoft 365' },
    { pattern: /adobe/i, name: 'Adobe' },
    { pattern: /dropbox/i, name: 'Dropbox' },
    { pattern: /slack/i, name: 'Slack' },
    { pattern: /zoom/i, name: 'Zoom' },
    { pattern: /canva/i, name: 'Canva' },
    { pattern: /notion/i, name: 'Notion' },
    { pattern: /github/i, name: 'GitHub' },
    { pattern: /linkedin/i, name: 'LinkedIn' },
    { pattern: /grammarly/i, name: 'Grammarly' },
    { pattern: /nordvpn|expressvpn|surfshark/i, name: 'VPN Service' },
    { pattern: /playstation|ps\s*plus/i, name: 'PlayStation' },
    { pattern: /xbox|game\s*pass/i, name: 'Xbox' },
    { pattern: /nintendo/i, name: 'Nintendo' },
];

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
 * Extract service name from email sender and subject
 * @param {string} sender - Email sender (e.g., "Netflix <info@netflix.com>")
 * @param {string} subject - Email subject
 */
const extractServiceName = (sender = '', subject = '') => {
    const combined = `${sender} ${subject}`;

    // Try known services first
    for (const service of KNOWN_SERVICES) {
        if (service.pattern.test(combined)) {
            return service.name;
        }
    }

    // Extract from email domain
    const emailMatch = sender.match(/@([a-z0-9.-]+)\./i);
    if (emailMatch) {
        const domain = emailMatch[1];
        // Capitalize first letter
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    // Extract from sender name
    const nameMatch = sender.match(/^([^<]+)/);
    if (nameMatch) {
        return nameMatch[1].trim();
    }

    return null;
};

/**
 * Detect billing cycle from email content
 * @param {string} text - Combined email text
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
 * @param {string} text - Combined email text
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
 * @param {string} text - Combined email text
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

        // Extract data
        const serviceName = extractServiceName(sender, subject);
        const billingCycle = detectBillingCycle(combinedText);
        const transactionTypes = detectTransactionType(combinedText);
        const amountData = extractAmount(combinedText);

        return {
            messageId,
            parsed: true,
            serviceName,
            billingCycle,
            transactionTypes,
            amount: amountData?.amount || null,
            currency: amountData?.currency || null,
            originalSubject: subject,
            originalSender: sender,
            timestamp,
            confidence: calculateConfidence({ serviceName, billingCycle, amountData }),
        };
    } catch (error) {
        // Never crash - return partial data
        return {
            messageId: email?.messageId,
            parsed: false,
            error: 'Failed to parse email',
            originalSubject: email?.subject,
            originalSender: email?.sender,
        };
    }
};

/**
 * Calculate confidence score based on extracted data
 */
const calculateConfidence = ({ serviceName, billingCycle, amountData }) => {
    let score = 0;
    if (serviceName) score += 40;
    if (billingCycle) score += 30;
    if (amountData) score += 30;
    return score;
};

/**
 * Parse multiple emails
 * @param {Array} emails - Array of email objects
 */
export const parseEmails = (emails = []) => {
    return emails.map(email => parseEmail(email));
};

/**
 * Parse and group by service
 * @param {Array} emails - Array of email objects
 */
export const parseAndGroupByService = (emails = []) => {
    const parsed = parseEmails(emails);
    const grouped = {};

    for (const email of parsed) {
        const key = email.serviceName || 'Unknown';
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(email);
    }

    return grouped;
};

export { KNOWN_SERVICES, BILLING_PATTERNS, TRANSACTION_PATTERNS };
