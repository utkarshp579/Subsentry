const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  return next();
};

export default requireAuth;
