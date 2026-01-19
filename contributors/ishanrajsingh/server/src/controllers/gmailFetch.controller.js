import { google } from "googleapis";
import { getValidAccessToken } from "../utils/gmailToken.util.js";

//Fetch transactional emails from Gmail

export const fetchTransactionalEmails = async (req, res) => {
  try {
    const userId = req.user?.id || "default"; // adjust if auth exists
    const maxResults = parseInt(req.query.limit) || 10;

    // Get valid access token (auto refresh if expired)
    const accessToken = await getValidAccessToken(userId);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });

    // Gmail search query (NO full inbox scan)
    const query =
      "invoice OR subscription OR renewal OR payment";

    // List matching messages
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults
    });

    const messages = listResponse.data.messages;

    // Handle empty inbox / no matching emails
    if (!messages || messages.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        emails: []
      });
    }

    // Fetch metadata for each message
    const emailPromises = messages.map(async (msg) => {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"]
      });

      const headers = message.data.payload.headers;

      const getHeader = (name) =>
        headers.find((h) => h.name === name)?.value || "";

      return {
        messageId: msg.id,
        subject: getHeader("Subject"),
        sender: getHeader("From"),
        timestamp: message.data.internalDate
      };
    });

    const emails = await Promise.all(emailPromises);

    return res.status(200).json({
      success: true,
      count: emails.length,
      emails
    });
  } catch (error) {
    // Handle rate limits & API errors
    if (error.code === 429) {
      return res.status(429).json({
        error: "Gmail API rate limit exceeded"
      });
    }

    return res.status(500).json({
      error: "Failed to fetch transactional emails",
      message: error.message
    });
  }
};
