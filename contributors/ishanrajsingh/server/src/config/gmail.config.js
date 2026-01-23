import { google } from 'googleapis';
import crypto from 'crypto';

/**
 * Gmail OAuth Configuration
 * Enforces read-only scope for user security
 */

// STRICTLY read-only scope - never request write/delete/send permissions
// Also request email scope to get user's email address
const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
];

// Encryption settings for token storage
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Falls back to derivation from client secret if not set
 */
const getEncryptionKey = () => {
    if (process.env.TOKEN_ENCRYPTION_KEY) {
        const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex');
        if (key.length === 32) return key;
    }
    // Derive key from client secret as fallback
    return crypto
        .createHash('sha256')
        .update(process.env.GOOGLE_CLIENT_SECRET || 'default-key')
        .digest();
};

/**
 * Create OAuth2 client instance
 */
export const createOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/gmail/callback'
    );
};

/**
 * Generate OAuth authorization URL
 * @param {string} state - CSRF protection state parameter
 */
export const generateAuthUrl = (state) => {
    const oauth2Client = createOAuth2Client();

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Get refresh token
        scope: GMAIL_SCOPES,
        state: state,
        prompt: 'consent', // Force consent to ensure refresh token
    });
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from callback
 */
export const exchangeCodeForTokens = async (code) => {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

/**
 * Get user email from Gmail API profile
 * @param {string} accessToken - Valid access token
 */
export const getUserEmail = async (accessToken) => {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Use Gmail API to get profile (includes email)
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { data } = await gmail.users.getProfile({ userId: 'me' });
    return data.emailAddress;
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Stored refresh token (encrypted)
 */
export const refreshAccessToken = async (refreshToken) => {
    const oauth2Client = createOAuth2Client();
    const decryptedRefreshToken = decryptToken(refreshToken);

    oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
};

/**
 * Encrypt token for secure database storage
 * @param {string} token - Plain text token
 */
export const encryptToken = (token) => {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt token from database storage
 * @param {string} encryptedToken - Encrypted token string
 */
export const decryptToken = (encryptedToken) => {
    const key = getEncryptionKey();
    const parts = encryptedToken.split(':');

    if (parts.length !== 3) {
        throw new Error('Invalid encrypted token format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

/**
 * Generate secure state for CSRF protection
 */
export const generateState = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Search emails using Gmail API with query
 * @param {string} accessToken - Valid access token
 * @param {string} query - Gmail search query
 * @param {number} maxResults - Maximum results to return (default 20)
 * @param {string} pageToken - Token for pagination (optional)
 */
export const searchEmails = async (accessToken, query, maxResults = 20, pageToken = null) => {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const params = {
        userId: 'me',
        q: query,
        maxResults: Math.min(maxResults, 100), // Cap at 100
    };

    if (pageToken) {
        params.pageToken = pageToken;
    }

    const { data } = await gmail.users.messages.list(params);

    return {
        messages: data.messages || [],
        nextPageToken: data.nextPageToken || null,
        resultSizeEstimate: data.resultSizeEstimate || 0,
    };
};

/**
 * Get email metadata (subject, sender, timestamp)
 * @param {string} accessToken - Valid access token
 * @param {string} messageId - Gmail message ID
 */
export const getEmailMetadata = async (accessToken, messageId) => {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Only fetch metadata, not full body
    const { data } = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
    });

    // Parse headers
    const headers = data.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    return {
        messageId: data.id,
        threadId: data.threadId,
        subject: getHeader('Subject'),
        sender: getHeader('From'),
        timestamp: getHeader('Date'),
        internalDate: data.internalDate,
        snippet: data.snippet,
    };
};

export { GMAIL_SCOPES };

