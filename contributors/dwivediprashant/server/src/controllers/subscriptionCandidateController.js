const subscriptionCandidateService = require('../services/subscriptionCandidateService');
const { fetchTransactionalEmails } = require('../services/gmailService');

const processSubscriptionCandidates = async (req, res) => {
  try {
    const { userId, query, limit, pageToken, minConfidence } = req.query;
    const maxResults = limit ? Number(limit) : 25;

    if (Number.isNaN(maxResults) || maxResults <= 0) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number.",
      });
    }

    // Step 1: Fetch emails from Gmail
    const emailResult = await fetchTransactionalEmails({
      userId: userId || "default",
      query,
      maxResults,
      pageToken,
    });

    if (!emailResult.emails || emailResult.emails.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No emails found to process.",
        data: {
          candidates: [],
          processed: 0,
          saved: 0,
          duplicates: 0,
          errors: [],
          nextPageToken: emailResult.nextPageToken,
        },
      });
    }

    // Step 2: Process emails into subscription candidates
    const candidates = await subscriptionCandidateService.processEmailCandidates(
      emailResult.emails,
      userId || "default"
    );

    // Step 3: Filter by minimum confidence if specified
    const filteredCandidates = minConfidence 
      ? candidates.filter(c => c.confidence >= Number(minConfidence))
      : candidates;

    // Step 4: Save candidates to database
    const saveResults = await subscriptionCandidateService.saveCandidates(filteredCandidates);

    return res.status(200).json({
      success: true,
      message: `Processed ${emailResult.emails.length} emails, created ${saveResults.saved} subscription candidates.`,
      data: {
        candidates: filteredCandidates,
        processed: emailResult.emails.length,
        ...saveResults,
        nextPageToken: emailResult.nextPageToken,
        query: emailResult.query,
      },
    });
  } catch (error) {
    const statusCode = error.code || error.status || error.response?.status || 500;
    const isRateLimit = statusCode === 429;

    return res.status(statusCode).json({
      success: false,
      message: isRateLimit
        ? "Gmail API rate limit exceeded. Please retry later."
        : error.message || "Failed to process subscription candidates.",
    });
  }
};

const getCandidates = async (req, res) => {
  try {
    const { 
      userId, 
      status, 
      minConfidence, 
      vendorKey, 
      limit = 50, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      status,
      minConfidence: minConfidence ? Number(minConfidence) : undefined,
      vendorKey,
      limit: Number(limit),
      page: Number(page),
      sortBy,
      sortOrder,
    };

    const result = await subscriptionCandidateService.getCandidates(
      userId || "default",
      options
    );

    return res.status(200).json({
      success: true,
      message: `Found ${result.candidates.length} subscription candidates.`,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscription candidates.",
    });
  }
};

const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const candidate = await subscriptionCandidateService.getCandidateById(
      id,
      userId || "default"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Subscription candidate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription candidate retrieved successfully.",
      data: candidate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve subscription candidate.",
    });
  }
};

const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { userId } = req.query;

    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, reviewed, accepted, rejected",
      });
    }

    const candidate = await subscriptionCandidateService.updateCandidateStatus(
      id,
      status,
      userId || "default"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Subscription candidate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription candidate status updated successfully.",
      data: candidate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscription candidate status.",
    });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const deleted = await subscriptionCandidateService.deleteCandidate(
      id,
      userId || "default"
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Subscription candidate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription candidate deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete subscription candidate.",
    });
  }
};

const getStats = async (req, res) => {
  try {
    const { userId } = req.query;

    const stats = await subscriptionCandidateService.getStats(userId || "default");

    return res.status(200).json({
      success: true,
      message: "Subscription candidate statistics retrieved successfully.",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve subscription candidate statistics.",
    });
  }
};

const cleanupOldCandidates = async (req, res) => {
  try {
    const { userId, daysOld = 30 } = req.query;

    const deletedCount = await subscriptionCandidateService.cleanupOldCandidates(
      userId || "default",
      Number(daysOld)
    );

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} old subscription candidates.`,
      data: { deletedCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cleanup old subscription candidates.",
    });
  }
};

module.exports = {
  processSubscriptionCandidates,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  getStats,
  cleanupOldCandidates,
};
