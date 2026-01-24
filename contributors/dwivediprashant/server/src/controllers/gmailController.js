const {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessTokenIfNeeded,
  getStoredTokens,
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

module.exports = {
  getAuthUrl,
  handleCallback,
  getStatus,
};
