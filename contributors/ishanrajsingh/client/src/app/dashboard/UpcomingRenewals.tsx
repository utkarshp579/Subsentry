import { Card } from '@/components/ui/card';
import { getServiceColors, getServiceIcon } from '@/lib/service-icons';
import { getDaysUntilRenewal } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertTriangle, Calendar } from 'lucide-react';
import React from 'react';

interface Subscription {
  name: string;
  renewalDate: string;
  amount: number;
  billingCycle: string;
  isTrial?: boolean;
  status: string;
}

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
}

const getUrgency = (days: number) => {
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'normal';
};

const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({
  subscriptions,
}) => {
  const upcoming = subscriptions
    .filter((sub) => {
      const days = getDaysUntilRenewal(sub.renewalDate);
      return sub.status === 'active' && days >= 0 && days <= 30;
    })
    .sort(
      (a, b) =>
        new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
    );

  if (upcoming.length === 0) {
    return (
      <Card className="p-8 rounded-2xl bg-linear-to-br from-[#18181c] to-[#101010] border border-[#232323] text-center shadow-lg">
        <span className="text-gray-400 text-base">
          No upcoming renewals in the next 30 days.
        </span>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Upcoming Renewals</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {upcoming.map((sub) => {
          const days = getDaysUntilRenewal(sub.renewalDate);
          const urgency = getUrgency(days);
          const icon = getServiceIcon(sub.name);
          const colors = getServiceColors(sub.name);
          return (
            <Card
              key={sub.name + sub.renewalDate}
              className={`flex items-center gap-6 p-6 rounded-2xl border shadow-lg transition-colors duration-200
                ${
                  urgency === 'urgent'
                    ? 'border-amber-500/60 bg-linear-to-br from-amber-500/10 to-[#18181c]'
                    : urgency === 'soon'
                      ? 'border-blue-500/30 bg-linear-to-br from-blue-500/10 to-[#18181c]'
                      : 'border-[#232323] bg-linear-to-br from-[#18181c] to-[#101010]'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {icon && (
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shadow ${colors?.bg ?? 'bg-[#232323]'}`}
                  >
                    <span className={`w-6 h-6 ${colors?.icon ?? 'text-white'}`}>
                      {icon}
                    </span>
                  </span>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-white truncate text-base">
                    {sub.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {format(new Date(sub.renewalDate), 'MMM d, yyyy')} &bull;{' '}
                    {sub.billingCycle}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-white text-lg">
                  ₹{sub.amount}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-2
                    ${
                      urgency === 'urgent'
                        ? 'bg-amber-500/20 text-amber-500'
                        : urgency === 'soon'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-[#232323] text-gray-400'
                    }
                  `}
                >
                  {urgency === 'urgent' && (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  Renews in {days} day{days !== 1 ? 's' : ''}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingRenewals;
