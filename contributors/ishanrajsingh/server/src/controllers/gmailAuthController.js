import { oauth2Client, SCOPES } from "../config/googleOAuth.js";
import GmailToken from "../models/GmailToken.js";

//Redirect user to Google OAuth consent page
export const startGoogleOAuth = async (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES
    });
    res.redirect(authUrl);
  } catch (error) {
    return res.status(500).json({ error: "Failed to initiate Google OAuth" });
  }
};

//Handle callback and store tokens securely
export const googleOAuthCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // If no refresh token — user denied or token refused
    if (!tokens.refresh_token) {
      return res.status(401).json({
        error: "Permission denied: Refresh token not provided"
      });
    }

    // Save tokens in DB securely
    await GmailToken.findOneAndUpdate(
      { user: req.user?.id || "default" },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      },
      { upsert: true }
    );

    return res
      .status(200)
      .json({ message: "Gmail connected (read-only) successfully!" });
  } catch (err) {
    return res.status(500).json({ error: "OAuth callback failed" });
  }
};
