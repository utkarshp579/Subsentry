const SubscriptionCandidate = require('../models/subscriptionCandidate');
const vendorResolverService = require('./vendorResolverService');
const confidenceScoringService = require('./confidenceScoringService');

class SubscriptionCandidateService {
  async processEmailCandidates(emails, userId = 'default') {
    const candidates = [];
    const processedHashes = new Set();

    for (const emailData of emails) {
      try {
        const candidate = await this.processSingleEmail(emailData, userId);
        
        if (candidate && !processedHashes.has(candidate.dedupeHash)) {
          candidates.push(candidate);
          processedHashes.add(candidate.dedupeHash);
        }
      } catch (error) {
        console.error(`Error processing email ${emailData.id}:`, error);
        // Continue processing other emails
      }
    }

    return candidates;
  }

  async processSingleEmail(emailData, userId = 'default') {
    // Step 1: Resolve vendor
    const vendorResolution = vendorResolverService.resolveVendor(
      emailData.sender,
      emailData.subject
    );

    // Step 2: Calculate confidence score
    const confidenceResult = confidenceScoringService.calculateOverallConfidence(
      emailData,
      vendorResolution
    );

    // Step 3: Generate dedupe hash
    const dedupeHash = vendorResolverService.generateDedupeHash(
      userId,
      emailData.sender,
      emailData.subject,
      emailData.timestamp
    );

    // Step 4: Check for existing candidate
    const existingCandidate = await SubscriptionCandidate.findOne({ dedupeHash });
    if (existingCandidate) {
      return null; // Skip duplicate
    }

    // Step 5: Get vendor icon
    const vendorIcon = vendorResolverService.getVendorIcon(vendorResolution.vendorKey);

    // Step 6: Create candidate object
    const candidate = {
      userId,
      vendorKey: vendorResolution.vendorKey,
      confidence: confidenceResult.confidence,
      signals: confidenceResult.signals,
      dedupeHash,
      emailData: {
        id: emailData.id,
        threadId: emailData.threadId,
        subject: emailData.subject,
        sender: emailData.sender,
        timestamp: emailData.timestamp
      },
      vendorIcon,
      explainability: confidenceResult.explainability
    };

    return candidate;
  }

  async saveCandidates(candidates) {
    if (!candidates || candidates.length === 0) {
      return { saved: 0, duplicates: 0, errors: [] };
    }

    const results = {
      saved: 0,
      duplicates: 0,
      errors: []
    };

    for (const candidate of candidates) {
      try {
        // Check for duplicates one more time (race condition protection)
        const existing = await SubscriptionCandidate.findOne({ 
          dedupeHash: candidate.dedupeHash 
        });

        if (existing) {
          results.duplicates++;
          continue;
        }

        // Save the candidate
        const newCandidate = new SubscriptionCandidate(candidate);
        await newCandidate.save();
        results.saved++;
      } catch (error) {
        console.error('Error saving candidate:', error);
        results.errors.push({
          dedupeHash: candidate.dedupeHash,
          error: error.message
        });
      }
    }

    return results;
  }

  async getCandidates(userId = 'default', options = {}) {
    const {
      status,
      minConfidence,
      vendorKey,
      limit = 50,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (minConfidence) {
      query.confidence = { $gte: minConfidence };
    }

    if (vendorKey) {
      query.vendorKey = vendorKey;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    try {
      const candidates = await SubscriptionCandidate
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await SubscriptionCandidate.countDocuments(query);

      return {
        candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  async getCandidateById(candidateId, userId = 'default') {
    try {
      const candidate = await SubscriptionCandidate.findOne({
        _id: candidateId,
        userId
      }).lean();

      return candidate;
    } catch (error) {
      console.error('Error fetching candidate by ID:', error);
      throw error;
    }
  }

  async updateCandidateStatus(candidateId, status, userId = 'default') {
    try {
      const candidate = await SubscriptionCandidate.findOneAndUpdate(
        { _id: candidateId, userId },
        { status },
        { new: true }
      ).lean();

      return candidate;
    } catch (error) {
      console.error('Error updating candidate status:', error);
      throw error;
    }
  }

  async deleteCandidate(candidateId, userId = 'default') {
    try {
      const result = await SubscriptionCandidate.deleteOne({
        _id: candidateId,
        userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  async getStats(userId = 'default') {
    try {
      const stats = await SubscriptionCandidate.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            reviewed: {
              $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
            },
            accepted: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            },
            avgConfidence: { $avg: '$confidence' },
            highConfidence: {
              $sum: { $cond: [{ $gte: ['$confidence', 80] }, 1, 0] }
            },
            mediumConfidence: {
              $sum: { $cond: [{ $and: [{ $gte: ['$confidence', 50] }, { $lt: ['$confidence', 80] }] }, 1, 0] }
            },
            lowConfidence: {
              $sum: { $cond: [{ $lt: ['$confidence', 50] }, 1, 0] }
            }
          }
        }
      ]);

      const vendorStats = await SubscriptionCandidate.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$vendorKey',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        overall: stats[0] || {
          total: 0,
          pending: 0,
          reviewed: 0,
          accepted: 0,
          rejected: 0,
          avgConfidence: 0,
          highConfidence: 0,
          mediumConfidence: 0,
          lowConfidence: 0
        },
        topVendors: vendorStats
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  async cleanupOldCandidates(userId = 'default', daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await SubscriptionCandidate.deleteMany({
        userId,
        status: 'rejected',
        createdAt: { $lt: cutoffDate }
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old candidates:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionCandidateService();
