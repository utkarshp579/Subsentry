const { fetchEmails } = require('../services/gmail.service');

exports.getEmails = async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const pageToken = req.query.pageToken || null;
  const keywords = req.query.keywords
    ? req.query.keywords.split(',')
    : ['invoice', 'payment', 'subscription', 'renewal'];

  const data = await fetchEmails({
    clerkUserId: req.auth.userId,
    limit,
    pageToken,
    keywords,
  });

  res.json({ success: true, ...data });
};
