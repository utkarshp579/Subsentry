import stringSimilarity from 'string-similarity';

/**
 * Service to resolve vendor names using regex patterns and fuzzy matching
 */

// Known services registry with patterns and icon keys
const SERVICE_REGISTRY = [
    { name: 'Netflix', icon: 'netflix', patterns: [/netflix/i] },
    { name: 'Spotify', icon: 'spotify', patterns: [/spotify/i] },
    { name: 'Amazon Prime', icon: 'amazon_prime', patterns: [/amazon\s*prime/i, /prime\s*membership/i] },
    { name: 'Disney+', icon: 'disney_plus', patterns: [/disney\s*\+|disneyplus/i] },
    { name: 'HBO Max', icon: 'hbo_max', patterns: [/hbo\s*max|hbomax/i] },
    { name: 'YouTube Premium', icon: 'youtube', patterns: [/youtube\s*(premium|music)/i] },
    { name: 'Apple', icon: 'apple', patterns: [/apple/i, /itunes/i] },
    { name: 'Google', icon: 'google', patterns: [/google\s*(one|workspace|drive|storage)/i] },
    { name: 'Microsoft 365', icon: 'microsoft', patterns: [/microsoft\s*365|office\s*365/i] },
    { name: 'Adobe', icon: 'adobe', patterns: [/adobe/i, /creative\s*cloud/i] },
    { name: 'Dropbox', icon: 'dropbox', patterns: [/dropbox/i] },
    { name: 'Slack', icon: 'slack', patterns: [/slack/i] },
    { name: 'Zoom', icon: 'zoom', patterns: [/zoom/i] },
    { name: 'Canva', icon: 'canva', patterns: [/canva/i] },
    { name: 'Notion', icon: 'notion', patterns: [/notion/i] },
    { name: 'GitHub', icon: 'github', patterns: [/github/i] },
    { name: 'LinkedIn', icon: 'linkedin', patterns: [/linkedin/i] },
    { name: 'Grammarly', icon: 'grammarly', patterns: [/grammarly/i] },
    { name: 'ChatGPT', icon: 'chatgpt', patterns: [/chatgpt|openai/i] },
    { name: 'Claude', icon: 'claude', patterns: [/claude|anthropic/i] },
    { name: 'Midjourney', icon: 'midjourney', patterns: [/midjourney/i] },
    { name: 'Vercel', icon: 'vercel', patterns: [/vercel/i] },
    { name: 'Heroku', icon: 'heroku', patterns: [/heroku/i] },
    { name: 'DigitalOcean', icon: 'digital_ocean', patterns: [/digital\s*ocean/i] },
    { name: 'AWS', icon: 'aws', patterns: [/amazon\s*web\s*services|aws/i] },
    { name: 'PlayStation', icon: 'playstation', patterns: [/playstation|ps\s*plus/i] },
    { name: 'Xbox', icon: 'xbox', patterns: [/xbox/i] },
    { name: 'Nintendo', icon: 'nintendo', patterns: [/nintendo/i] },
    { name: 'Hulu', icon: 'hulu', patterns: [/hulu/i] },
    { name: 'Peacock', icon: 'peacock', patterns: [/peacock/i] },
    { name: 'Paramount+', icon: 'paramount_plus', patterns: [/paramount\s*\+/i] },
];

// Extract just the names for fuzzy matching
const KNOWN_SERVICE_NAMES = SERVICE_REGISTRY.map(s => s.name);

/**
 * Resolve vendor from text inputs
 * @param {string} senderName - Sender name (e.g., "Netflix, Inc.")
 * @param {string} senderEmail - Sender email (e.g., "info@mailer.netflix.com")
 * @param {string} subject - Email subject
 * @returns {Object} - { name, icon, method, confidence }
 */
export const resolveVendor = (senderName = '', senderEmail = '', subject = '') => {
    // 1. Precise Regex Matching
    const combinedText = `${senderName} ${senderEmail} ${subject}`;

    for (const service of SERVICE_REGISTRY) {
        for (const pattern of service.patterns) {
            if (pattern.test(combinedText)) {
                return {
                    name: service.name,
                    icon: service.icon,
                    method: 'REGEX_MATCH',
                    confidence: 1.0
                };
            }
        }
    }

    // 2. Domain Extraction & Clean up
    let potentialName = '';

    // Try to extract from email domain
    if (senderEmail) {
        const domainMatch = senderEmail.match(/@(?:.*\.)?([a-z0-9-]+)\.[a-z]+$/i);
        if (domainMatch && domainMatch[1]) {
            const domainPart = domainMatch[1];
            // Skip generic domains
            if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'protonmail'].includes(domainPart.toLowerCase())) {
                potentialName = domainPart;
            }
        }
    }

    // Fallback to sender name if no good domain
    if (!potentialName && senderName) {
        potentialName = senderName.split(/[<@(]/)[0].trim().replace(/['"]/g, '');
    }

    if (!potentialName) return null;

    // 3. Fuzzy Matching against known list
    const matches = stringSimilarity.findBestMatch(potentialName, KNOWN_SERVICE_NAMES);
    const bestMatch = matches.bestMatch;

    if (bestMatch.rating > 0.4) {
        // Find the icon for the best match
        const matchedService = SERVICE_REGISTRY.find(s => s.name === bestMatch.target);
        return {
            name: bestMatch.target,
            icon: matchedService ? matchedService.icon : 'default',
            method: 'FUZZY_MATCH',
            confidence: bestMatch.rating
        };
    }

    // 4. Return the cleaned potential name if it looks valid
    // Capitalize first letter
    const formattedName = potentialName.charAt(0).toUpperCase() + potentialName.slice(1);

    return {
        name: formattedName,
        icon: 'default',
        method: 'EXTRACTION',
        confidence: 0.3 // Low confidence as it's just an extraction
    };
};
