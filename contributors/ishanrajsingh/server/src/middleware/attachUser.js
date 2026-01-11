const decodeJwtPayload = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const attachUser = (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (token) {
    const payload = decodeJwtPayload(token);
    const userId = payload?.sub || payload?.userId || payload?.uid || token;
    req.user = { id: userId };
  } else if (req.headers['x-user-id']) {
    req.user = { id: req.headers['x-user-id'] };
  }

  next();
};

export default attachUser;
