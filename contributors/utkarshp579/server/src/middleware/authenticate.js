import jwt from "jsonwebtoken";

const unauthorized = (res, message = "User authentication required") =>
  res.status(401).json({
    success: false,
    message,
  });

const authenticate = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "JWT_SECRET is not configured",
    });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload?.sub ?? payload?.userId ?? payload?.id;

    if (userId) {
      req.user = { id: String(userId) };
    }

    return next();
  } catch {
    return unauthorized(res, "Invalid or expired token");
  }
};

export default authenticate;
