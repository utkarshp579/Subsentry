const {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessTokenIfNeeded,
  getStoredTokens,
  fetchTransactionalEmails,
} = require("../services/gmailService");

const getAuthUrl = async (req, res) => {
  try {
    const { state, userId } = req.query;
    const authUrl = generateAuthUrl(state);
    return res.status(200).json({
      success: true,
      message: "Google OAuth URL generated.",
      data: {
        authUrl,
        userId: userId || "default",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate auth URL.",
    });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { error, code, userId } = req.query;

    if (error) {
      return res.status(403).json({
        success: false,
        message: "Permission denied or consent rejected.",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required.",
      });
    }

    const result = await exchangeCodeForTokens(code, userId || "default");

    return res.status(200).json({
      success: true,
      message: "Gmail account connected with read-only access.",
      data: {
        scope: result.scope,
        expiryDate: result.expiryDate,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to connect Gmail account.",
    });
  }
};

const getStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    const stored = await getStoredTokens(userId || "default");
    if (!stored) {
      return res.status(404).json({
        success: false,
        message: "No Gmail connection found.",
      });
    }

    const refreshed = await refreshAccessTokenIfNeeded(userId || "default");

    return res.status(200).json({
      success: true,
      message: "Gmail connection is active.",
      data: {
        scope: refreshed.scope,
        expiryDate: refreshed.expiryDate,
      },
    });
  } catch (error) {
    const statusCode =
      error.message && error.message.toLowerCase().includes("invalid")
        ? 401
        : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to verify Gmail connection.",
    });
  }
};

const getTransactionalEmails = async (req, res) => {
  try {
    const { userId, q, limit, pageToken } = req.query;
    const maxResults = limit ? Number(limit) : 10;

    if (Number.isNaN(maxResults) || maxResults <= 0) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number.",
      });
    }

    const result = await fetchTransactionalEmails({
      userId: userId || "default",
      query: q,
      maxResults,
      pageToken,
    });

    return res.status(200).json({
      success: true,
      message: result.emails.length
        ? "Transactional emails fetched."
        : "No matching transactional emails found.",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.code || error.status || error.response?.status || 500;
    const isRateLimit = statusCode === 429;

    return res.status(statusCode).json({
      success: false,
      message: isRateLimit
        ? "Gmail API rate limit exceeded. Please retry later."
        : error.message || "Failed to fetch transactional emails.",
    });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  getStatus,
  getTransactionalEmails,
};
