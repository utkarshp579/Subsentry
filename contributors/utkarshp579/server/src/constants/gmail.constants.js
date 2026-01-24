// Gmail OAuth scopes - read-only access only
export const GMAIL_SCOPES = Object.freeze([
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
]);

export const GMAIL_ERRORS = Object.freeze({
  DENIED: "denied",
  INVALID_STATE: "invalid_state",
  TOKEN_ERROR: "token_error",
  CALLBACK_FAILED: "callback_failed",
  SUCCESS: "success",
});
