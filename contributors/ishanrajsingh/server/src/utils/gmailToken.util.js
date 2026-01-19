import { oauth2Client } from "../config/googleOAuth.js";
import GmailToken from "../models/GmailToken.js";

//Returns a valid Gmail access token.
//Automatically refreshes if expired.
export const getValidAccessToken = async (userId) => {
  const tokenData = await GmailToken.findOne({ user: userId });

  if (!tokenData) {
    throw new Error("No Gmail token stored for this user");
  }

  oauth2Client.setCredentials({
    refresh_token: tokenData.refreshToken
  });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  return accessTokenResponse.token;
};
