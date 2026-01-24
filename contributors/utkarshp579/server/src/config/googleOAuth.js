import { google } from "googleapis";
import crypto from "crypto";
import { GMAIL_SCOPES } from "../constants/gmail.constants.js";

const CIPHER = "aes-256-gcm";
const IV_BYTES = 16;
const TAG_BYTES = 16;

const resolveEncryptionKey = () => {
  if (process.env.TOKEN_ENCRYPTION_KEY) {
    const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, "hex");
    if (key.length === 32) return key;
  }

  // Fallback: derive key from client secret
  return crypto
    .createHash("sha256")
    .update(process.env.GOOGLE_CLIENT_SECRET || "fallback-secret")
    .digest();
};

export const buildOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:5000/api/gmail/callback",
  );
};

export const createAuthUrl = (stateToken) => {
  const client = buildOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    scope: GMAIL_SCOPES,
    state: stateToken,
    prompt: "consent",
  });
};

export const fetchTokensFromCode = async (authCode) => {
  const client = buildOAuthClient();
  const { tokens } = await client.getToken(authCode);
  return tokens;
};

export const fetchGmailAddress = async (accessToken) => {
  const client = buildOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: client });
  const response = await gmail.users.getProfile({ userId: "me" });

  return response.data.emailAddress;
};

export const refreshExpiredAccessToken = async (encryptedRefreshToken) => {
  const client = buildOAuthClient();

  const refreshToken = decrypt(encryptedRefreshToken);
  client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await client.refreshAccessToken();
  return credentials;
};

export const encrypt = (plainText) => {
  const key = resolveEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);

  const cipher = crypto.createCipheriv(CIPHER, key, iv);
  let cipherText = cipher.update(plainText, "utf8", "hex");
  cipherText += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return [iv.toString("hex"), tag.toString("hex"), cipherText].join(":");
};

export const decrypt = (cipherPayload) => {
  const [ivHex, tagHex, encrypted] = cipherPayload.split(":");

  if (!ivHex || !tagHex || !encrypted) {
    throw new Error("Malformed encrypted token");
  }

  const key = resolveEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(CIPHER, key, iv);
  decipher.setAuthTag(tag);

  let output = decipher.update(encrypted, "hex", "utf8");
  output += decipher.final("utf8");

  return output;
};

export const createCsrfState = () => {
  return crypto.randomBytes(32).toString("hex");
};
