import { GmailToken } from '../models/GmailToken.js';
import {
    searchEmails,
    getEmailMetadata,
    decryptToken,
    refreshAccessToken,
    encryptToken,
} from '../config/googleOAuth.js';

const SUBSCRIPTION_KEYWORDS = [
    'invoice',
    'subscription',
    'renewal',
    'payment',
    'receipt',
    'billing',
];

const buildSearchQuery = (keywords = SUBSCRIPTION_KEYWORDS) => {
    return keywords.map(k => `(${k})`).join(' OR ');
};


const getValidAccessToken = async (userId) => {
    const gmailToken = await GmailToken.findOne({ userId });

    if (!gmailToken) {
        throw new Error('Gmail not connected');
    }

    const isExpired = new Date() > new Date(gmailToken.expiresAt);

    if (isExpired) {
        const newTokens = await refreshAccessToken(gmailToken.refreshToken);

        gmailToken.accessToken = encryptToken(newTokens.access_token);
        gmailToken.expiresAt = new Date(newTokens.expiry_date || Date.now() + 3600 * 1000);
        await gmailToken.save();

        return { accessToken: newTokens.access_token, gmailToken };
    }

    const accessToken = decryptToken(gmailToken.accessToken);
    return { accessToken, gmailToken };
};

export const fetchTransactionalEmails = async (userId, options = {}) => {
    const {
        maxResults = 20,
        pageToken = null,
        keywords = SUBSCRIPTION_KEYWORDS
    } = options;

    const { accessToken } = await getValidAccessToken(userId);

    const query = buildSearchQuery(keywords);

    const searchResult = await searchEmails(accessToken, query, maxResults, pageToken);

    if (!searchResult.messages || searchResult.messages.length === 0) {
        return {
            emails: [],
            nextPageToken: null,
            totalEstimate: 0,
            message: 'No subscription-related emails found',
        };
    }

    const emails = await Promise.all(
        searchResult.messages.map(async (msg) => {
            try {
                return await getEmailMetadata(accessToken, msg.id);
            } catch (error) {
                return null;
            }
        })
    );

    const validEmails = emails.filter(email => email !== null);

    return {
        emails: validEmails,
        nextPageToken: searchResult.nextPageToken,
        totalEstimate: searchResult.resultSizeEstimate,
    };
};

export { SUBSCRIPTION_KEYWORDS, buildSearchQuery };