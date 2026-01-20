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

const BILLING_PATTERNS = {
    monthly: /monthly|per\s*month|\/month|\/mo|each\s*month/i,
    yearly: /yearly|annual|per\s*year|\/year|\/yr|each\s*year/i,
    weekly: /weekly|per\s*week|\/week|each\s*week/i,
};

const TRANSACTION_PATTERNS = {
    renewal: /renewal|renewed|renewing|auto.?renew/i,
    payment: /payment|paid|charged|charge|transaction/i,
    invoice: /invoice|bill|billing|receipt/i,
    subscription: /subscription|subscribed|subscribe/i,
    trial: /trial|free\s*trial/i,
    cancelled: /cancel|cancelled|canceled/i,
};

const AMOUNT_PATTERNS = [
    /\$\s*(\d+(?:[.,]\d{1,2})?)/,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:USD|dollars?)/i,
    /₹\s*(\d+(?:[.,]\d{1,2})?)/,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:INR|rupees?)/i,
    /€\s*(\d+(?:[.,]\d{1,2})?)/,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:EUR|euros?)/i,
    /£\s*(\d+(?:[.,]\d{1,2})?)/,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:GBP|pounds?)/i,
];


const extractServiceName = (sender = '', subject = '') => {
    const combined = `${sender} ${subject}`;

    for (const service of KNOWN_SERVICES) {
        if (service.pattern.test(combined)) {
            return service.name;
        }
    }

    const emailMatch = sender.match(/@([a-z0-9.-]+)\./i);
    if (emailMatch) {
        const domain = emailMatch[1];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    const nameMatch = sender.match(/^([^<]+)/);
    if (nameMatch) {
        return nameMatch[1].trim();
    }

    return null;
};

const detectBillingCycle = (text = '') => {
    for (const [cycle, pattern] of Object.entries(BILLING_PATTERNS)) {
        if (pattern.test(text)) {
            return cycle;
        }
    }
    return null;
};

const detectTransactionType = (text = '') => {
    const types = [];
    for (const [type, pattern] of Object.entries(TRANSACTION_PATTERNS)) {
        if (pattern.test(text)) {
            types.push(type);
        }
    }
    return types.length > 0 ? types : ['unknown'];
};

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

export const parseEmail = (email) => {
    try {
        const { messageId, subject = '', sender = '', snippet = '', timestamp } = email;

        const combinedText = `${subject} ${snippet}`;

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
        return {
            messageId: email?.messageId,
            parsed: false,
            error: 'Failed to parse email',
            originalSubject: email?.subject,
            originalSender: email?.sender,
        };
    }
};

const calculateConfidence = ({ serviceName, billingCycle, amountData }) => {
    let score = 0;
    if (serviceName) score += 40;
    if (billingCycle) score += 30;
    if (amountData) score += 30;
    return score;
};


export const parseEmails = (emails = []) => {
    return emails.map(email => parseEmail(email));
};

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