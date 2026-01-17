import React, { useState, useMemo } from 'react';
import { Calendar, AlertCircle, Clock, DollarSign } from 'lucide-react';

// Sample subscription data
const SAMPLE_SUBSCRIPTIONS = [
  {
    id: 1,
    name: 'Netflix Premium',
    category: 'Entertainment',
    cost: 15.99,
    renewalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'monthly',
    icon: '🎬'
  },
  {
    id: 2,
    name: 'Spotify',
    category: 'Music',
    cost: 9.99,
    renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'monthly',
    icon: '🎵'
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    category: 'Software',
    cost: 54.99,
    renewalDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'monthly',
    icon: '🎨'
  },
  {
    id: 4,
    name: 'GitHub Pro',
    category: 'Development',
    cost: 4.00,
    renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'monthly',
    icon: '💻'
  },
  {
    id: 5,
    name: 'Gym Membership',
    category: 'Health',
    cost: 49.99,
    renewalDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'monthly',
    icon: '💪'
  },
  {
    id: 6,
    name: 'Cloud Storage',
    category: 'Storage',
    cost: 2.99,
    renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: 'monthly',
    icon: '☁️'
  }
];

const UpcomingRenewalsSection = () => {
  const [dateRange, setDateRange] = useState(30);
  const [timeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Calculate days remaining with timezone awareness
  const getDaysRemaining = (renewalDate) => {
    const now = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency level based on days remaining
  const getUrgencyLevel = (daysRemaining) => {
    if (daysRemaining <= 3) return 'critical';
    if (daysRemaining <= 7) return 'high';
    if (daysRemaining <= 14) return 'medium';
    return 'low';
  };

  // Format date with timezone awareness
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timeZone
    }).format(date);
  };

  // Filter and sort subscriptions
  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + dateRange * 24 * 60 * 60 * 1000);

    return SAMPLE_SUBSCRIPTIONS
      .filter(sub => {
        const renewalDate = new Date(sub.renewalDate);
        return renewalDate >= now && renewalDate <= rangeEnd;
      })
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
      .map(sub => ({
        ...sub,
        daysRemaining: getDaysRemaining(sub.renewalDate),
        urgencyLevel: getUrgencyLevel(getDaysRemaining(sub.renewalDate))
      }));
  }, [dateRange]);

  // Calculate total upcoming charges
  const totalUpcoming = upcomingRenewals.reduce((sum, sub) => sum + sub.cost, 0);

  // Urgency badge component
  const UrgencyBadge = ({ daysRemaining, urgencyLevel }) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    const getText = () => {
      if (daysRemaining === 0) return 'Today';
      if (daysRemaining === 1) return 'Tomorrow';
      return `${daysRemaining} days`;
    };

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[urgencyLevel]}`}>
        <Clock className="w-3 h-3" />
        {getText()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upcoming Renewals</h1>
          <p className="text-slate-600">Stay ahead of subscription charges and manage your renewals</p>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Renewal Overview</h2>
              </div>
              <p className="text-blue-100 text-sm">Next {dateRange} days</p>
            </div>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="bg-blue-500 bg-opacity-30 border border-blue-400 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer hover:bg-opacity-40 transition-all"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-blue-100 text-sm mb-1">Total Renewals</div>
              <div className="text-2xl font-bold">{upcomingRenewals.length}</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-blue-100 text-sm mb-1">Total Amount</div>
              <div className="text-2xl font-bold">${totalUpcoming.toFixed(2)}</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-blue-100 text-sm mb-1">Urgent (≤7 days)</div>
              <div className="text-2xl font-bold">
                {upcomingRenewals.filter(s => s.daysRemaining <= 7).length}
              </div>
            </div>
          </div>
        </div>

        {/* Renewals List */}
        {upcomingRenewals.length > 0 ? (
          <div className="space-y-3">
            {upcomingRenewals.map((subscription) => (
              <div 
                key={subscription.id}
                className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-all hover:shadow-md ${
                  subscription.urgencyLevel === 'critical' 
                    ? 'border-red-300 bg-red-50' 
                    : subscription.urgencyLevel === 'high'
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Icon and Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl flex-shrink-0">
                      {subscription.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {subscription.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                              {subscription.category}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="capitalize">{subscription.billingCycle}</span>
                          </div>
                        </div>
                        <UrgencyBadge 
                          daysRemaining={subscription.daysRemaining}
                          urgencyLevel={subscription.urgencyLevel}
                        />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">
                            Renews on {formatDate(subscription.renewalDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">
                            ${subscription.cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex-shrink-0">
                    Manage
                  </button>
                </div>

                {/* Critical Warning */}
                {subscription.urgencyLevel === 'critical' && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-center gap-2 text-sm text-red-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">
                        Action needed: This subscription renews very soon
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Upcoming Renewals
            </h3>
            <p className="text-slate-600">
              You don't have any subscriptions renewing in the next {dateRange} days
            </p>
          </div>
        )}

        {/* Timezone Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          All dates shown in {timeZone} timezone
        </div>
      </div>
    </div>
  );
};

export default UpcomingRenewalsSection;