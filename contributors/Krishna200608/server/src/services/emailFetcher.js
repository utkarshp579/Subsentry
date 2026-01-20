import { GmailToken } from '../models/GmailToken.js';
import {
    searchEmails,
    getEmailMetadata,
    decryptToken,
    refreshAccessToken,
    encryptToken,
} from '../config/gmail.config.js';

/**
 * Email Fetcher Service
 * Fetches subscription-related emails using intelligent Gmail search queries
 */

// Keywords for finding subscription-related emails
const SUBSCRIPTION_KEYWORDS = [
    'invoice',
    'subscription',
    'renewal',
    'payment',
    'receipt',
    'billing',
];

/**
 * Build Gmail search query from keywords
 * Uses OR to match any keyword
 */
const buildSearchQuery = (keywords = SUBSCRIPTION_KEYWORDS) => {
    return keywords.map(k => `(${k})`).join(' OR ');
};

/**
 * Get valid access token for user, refreshing if needed
 * @param {string} userId - User ID
 * @returns {Object} - { accessToken, gmailToken }
 */
const getValidAccessToken = async (userId) => {
    const gmailToken = await GmailToken.findOne({ userId });

    if (!gmailToken) {
        throw new Error('Gmail not connected');
    }

    // Check if token is expired
    const isExpired = new Date() > new Date(gmailToken.expiresAt);

    if (isExpired) {
        // Refresh the token
        const newTokens = await refreshAccessToken(gmailToken.refreshToken);

        // Update stored token
        gmailToken.accessToken = encryptToken(newTokens.access_token);
        gmailToken.expiresAt = new Date(newTokens.expiry_date || Date.now() + 3600 * 1000);
        await gmailToken.save();

        return { accessToken: newTokens.access_token, gmailToken };
    }

    // Decrypt and return existing token
    const accessToken = decryptToken(gmailToken.accessToken);
    return { accessToken, gmailToken };
};

/**
 * Fetch subscription-related emails
 * @param {string} userId - User ID
 * @param {Object} options - Fetch options
 * @param {number} options.maxResults - Max emails to return (default 20)
 * @param {string} options.pageToken - Pagination token
 * @param {string[]} options.keywords - Custom keywords (optional)
 */
export const fetchTransactionalEmails = async (userId, options = {}) => {
    const {
        maxResults = 20,
        pageToken = null,
        keywords = SUBSCRIPTION_KEYWORDS
    } = options;

    // Get valid access token
    const { accessToken } = await getValidAccessToken(userId);

    // Build search query
    const query = buildSearchQuery(keywords);

    // Search for matching emails
    const searchResult = await searchEmails(accessToken, query, maxResults, pageToken);

    if (!searchResult.messages || searchResult.messages.length === 0) {
        return {
            emails: [],
            nextPageToken: null,
            totalEstimate: 0,
            message: 'No subscription-related emails found',
        };
    }

    // Fetch metadata for each email
    const emails = await Promise.all(
        searchResult.messages.map(async (msg) => {
            try {
                return await getEmailMetadata(accessToken, msg.id);
            } catch (error) {
                // Skip emails that fail to fetch
                return null;
            }
        })
    );

    // Filter out failed fetches
    const validEmails = emails.filter(email => email !== null);

    return {
        emails: validEmails,
        nextPageToken: searchResult.nextPageToken,
        totalEstimate: searchResult.resultSizeEstimate,
    };
};

export { SUBSCRIPTION_KEYWORDS, buildSearchQuery };
