const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
};

export default requireAuth;
