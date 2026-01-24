const { google } = require('googleapis');
const GmailToken = require('../models/GmailToken');
const { decrypt } = require('../utils/encryption');

exports.fetchEmails = async ({
  clerkUserId,
  limit,
  pageToken,
  keywords,
}) => {
  const tokenDoc = await GmailToken.findOne({ clerkUserId });
  if (!tokenDoc) return { emails: [], nextPageToken: null };

  const tokens = JSON.parse(decrypt(tokenDoc.tokens));

  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);

  const gmail = google.gmail({ version: 'v1', auth });

  const q = keywords.map(k => `"${k}"`).join(' OR ');

  const list = await gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults: limit,
    pageToken,
  });

  const emails = await Promise.all(
    (list.data.messages || []).map(async (m) => {
      const res = await gmail.users.messages.get({
        userId: 'me',
        id: m.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const h = res.data.payload.headers;
      const get = n => h.find(x => x.name === n)?.value || '';

      return {
        messageId: m.id,
        threadId: res.data.threadId,
        subject: get('Subject'),
        sender: get('From'),
        timestamp: get('Date'),
        snippet: res.data.snippet,
      };
    })
  );

  return {
    emails,
    nextPageToken: list.data.nextPageToken || null,
  };
};
