const AlertRule = require('../models/AlertRule');
const Subscription = require('../models/Subscription');

class AlertsController {
  /**
   * Save or update an alert rule
   */
  async saveAlertRule(req, res) {
    try {
      const userId = req.userId;
      const { daysBefore, channels, enabled = true, notificationTime = '09:00', timezone = 'UTC' } = req.body;
      
      // Check if rule already exists for this user and daysBefore
      const existingRule = await AlertRule.findOne({ userId, daysBefore });
      
      let alertRule;
      
      if (existingRule) {
        // Update existing rule
        existingRule.channels = channels;
        existingRule.enabled = enabled;
        existingRule.notificationTime = notificationTime;
        existingRule.timezone = timezone;
        alertRule = await existingRule.save();
        
        return res.status(200).json({
          success: true,
          message: 'Alert rule updated successfully',
          data: alertRule
        });
      } else {
        // Create new rule
        alertRule = new AlertRule({
          userId,
          daysBefore,
          channels,
          enabled,
          notificationTime,
          timezone
        });
        
        await alertRule.save();
        
        return res.status(201).json({
          success: true,
          message: 'Alert rule created successfully',
          data: alertRule
        });
      }
    } catch (error) {
      console.error('Error saving alert rule:', error);
      
      // Handle duplicate key error (unique constraint violation)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'An alert rule already exists for this reminder period'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to save alert rule',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Fetch all alert rules for the authenticated user
   */
  async getAlertRules(req, res) {
    try {
      const userId = req.userId;
      
      const alertRules = await AlertRule.find({ userId })
        .sort({ daysBefore: 1 })
        .select('-__v');
      
      return res.status(200).json({
        success: true,
        count: alertRules.length,
        data: alertRules
      });
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch alert rules'
      });
    }
  }
  
  /**
   * Get upcoming subscription renewals based on alert rules
   */
  async getUpcomingRenewals(req, res) {
    try {
      const userId = req.userId;
      const { 
        days = 7, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Calculate date range
      const now = new Date();
      let startDateObj, endDateObj;
      
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else {
        startDateObj = new Date();
        endDateObj = new Date();
        endDateObj.setDate(endDateObj.getDate() + parseInt(days));
      }
      
      // Get user's alert rules to determine which reminders to show
      const alertRules = await AlertRule.find({ 
        userId, 
        enabled: true 
      }).sort({ daysBefore: 1 });
      
      // If no alert rules, return empty result
      if (alertRules.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No alert rules configured',
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        });
      }
      
      // Calculate target dates based on alert rules
      const targetDates = alertRules.map(rule => {
        const date = new Date();
        date.setDate(date.getDate() + rule.daysBefore);
        return {
          daysBefore: rule.daysBefore,
          date,
          channels: rule.channels
        };
      });
      
      // Build query for active subscriptions
      const query = {
        userId,
        status: 'active',
        renewalDate: {
          $gte: startDateObj,
          $lte: endDateObj
        }
      };
      
      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const subscriptions = await Subscription.find(query)
        .sort({ renewalDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');
      
      const total = await Subscription.countDocuments(query);
      
      // Enhance subscription data with alert information
      const enhancedSubscriptions = subscriptions.map(subscription => {
        const renewalDate = new Date(subscription.renewalDate);
        const timeDiff = renewalDate.getTime() - now.getTime();
        const daysUntilRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Find which alert rules apply to this subscription
        const applicableAlerts = alertRules
          .filter(rule => daysUntilRenewal <= rule.daysBefore)
          .map(rule => ({
            daysBefore: rule.daysBefore,
            channels: rule.channels,
            notificationTime: rule.notificationTime,
            timezone: rule.timezone
          }));
        
        return {
          ...subscription.toObject(),
          daysUntilRenewal,
          applicableAlerts,
          formattedRenewalDate: renewalDate.toISOString().split('T')[0],
          isUrgent: daysUntilRenewal <= 3
        };
      });
      
      return res.status(200).json({
        success: true,
        data: enhancedSubscriptions,
        meta: {
          dateRange: {
            start: startDateObj.toISOString().split('T')[0],
            end: endDateObj.toISOString().split('T')[0],
            days: parseInt(days)
          },
          alertRules: alertRules.map(rule => ({
            daysBefore: rule.daysBefore,
            channels: rule.channels,
            enabled: rule.enabled
          }))
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching upcoming renewals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch upcoming renewals'
      });
    }
  }
  
  /**
   * Get a summary of upcoming renewals grouped by days until renewal
   */
  async getRenewalSummary(req, res) {
    try {
      const userId = req.userId;
      const days = req.query.days || 30;
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));
      
      const subscriptions = await Subscription.find({
        userId,
        status: 'active',
        renewalDate: { $lte: endDate }
      }).sort({ renewalDate: 1 });
      
      const now = new Date();
      const summary = {};
      let totalAmount = 0;
      
      subscriptions.forEach(subscription => {
        const renewalDate = new Date(subscription.renewalDate);
        const timeDiff = renewalDate.getTime() - now.getTime();
        const daysUntilRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysUntilRenewal >= 0) {
          const key = daysUntilRenewal <= 7 ? 'within_week' : 
                     daysUntilRenewal <= 30 ? 'within_month' : 'future';
          
          if (!summary[key]) {
            summary[key] = {
              count: 0,
              totalAmount: 0,
              subscriptions: []
            };
          }
          
          summary[key].count++;
          summary[key].totalAmount += subscription.amount;
          summary[key].subscriptions.push({
            id: subscription._id,
            name: subscription.name,
            amount: subscription.amount,
            currency: subscription.currency,
            daysUntilRenewal,
            renewalDate: subscription.renewalDate
          });
          
          totalAmount += subscription.amount;
        }
      });
      
      return res.status(200).json({
        success: true,
        data: {
          summary,
          totals: {
            subscriptions: subscriptions.length,
            totalAmount,
            currency: 'USD' // Assuming USD for demo
          }
        }
      });
    } catch (error) {
      console.error('Error fetching renewal summary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch renewal summary'
      });
    }
  }
  
  /**
   * Toggle alert rule status
   */
  async toggleAlertRule(req, res) {
    try {
      const userId = req.userId;
      const { ruleId } = req.params;
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'enabled field must be a boolean'
        });
      }
      
      const alertRule = await AlertRule.findOneAndUpdate(
        { _id: ruleId, userId },
        { enabled },
        { new: true }
      );
      
      if (!alertRule) {
        return res.status(404).json({
          success: false,
          error: 'Alert rule not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Alert rule ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: alertRule
      });
    } catch (error) {
      console.error('Error toggling alert rule:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update alert rule'
      });
    }
  }
  
  /**
   * Delete an alert rule
   */
  async deleteAlertRule(req, res) {
    try {
      const userId = req.userId;
      const { ruleId } = req.params;
      
      const alertRule = await AlertRule.findOneAndDelete({ 
        _id: ruleId, 
        userId 
      });
      
      if (!alertRule) {
        return res.status(404).json({
          success: false,
          error: 'Alert rule not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Alert rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete alert rule'
      });
    }
  }
}

module.exports = new AlertsController();