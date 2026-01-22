const crypto = require("crypto");

const getKey = () => {
  const { GMAIL_TOKEN_ENCRYPTION_KEY } = process.env;
  if (!GMAIL_TOKEN_ENCRYPTION_KEY) {
    throw new Error(
      "Missing GMAIL_TOKEN_ENCRYPTION_KEY. Provide a 32-byte base64 key.",
    );
  }

  const key = Buffer.from(GMAIL_TOKEN_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) {
    throw new Error(
      "Invalid GMAIL_TOKEN_ENCRYPTION_KEY length. Expected 32 bytes base64.",
    );
  }

  return key;
};

const encrypt = (value) => {
  if (!value) {
    return null;
  }
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    encrypted.toString("base64"),
    tag.toString("base64"),
  ].join(":");
};

const decrypt = (payload) => {
  if (!payload) {
    return null;
  }
  const key = getKey();
  const [ivB64, encryptedB64, tagB64] = payload.split(":");
  if (!ivB64 || !encryptedB64 || !tagB64) {
    throw new Error("Invalid encrypted payload format.");
  }
  const iv = Buffer.from(ivB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

module.exports = {
  encrypt,
  decrypt,
};
