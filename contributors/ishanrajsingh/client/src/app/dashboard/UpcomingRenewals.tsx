'use client';

import { Subscription } from '@/lib/api';
import { AlertTriangle, Clock } from 'lucide-react';

function daysUntil(dateISO: string) {
  const today = new Date();
  const target = new Date(dateISO);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function formatDate(dateISO: string) {
  return new Date(dateISO).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type Props = {
  subscriptions: Subscription[];
};

export default function UpcomingRenewals({ subscriptions }: Props) {
  const upcoming = subscriptions
    .filter(s => s.status === 'active')
    .map(s => ({ ...s, daysLeft: daysUntil(s.renewalDate) }))
    .filter(s => s.daysLeft >= 0 && s.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (upcoming.length === 0) {
    return (
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#0b0f14] p-6">
        <h3 className="mb-1 text-lg font-semibold text-white">
          Upcoming Renewals
        </h3>
        <p className="text-sm text-gray-400">
          No renewals in the next 30 days 🎉
        </p>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-[#0b0f14] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">
          Upcoming Renewals
        </h3>
      </div>

      <div className="space-y-3">
        {upcoming.map(sub => {
          const urgent = sub.daysLeft <= 7;

          return (
            <div
              key={sub._id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                urgent
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-amber-500/30 bg-amber-500/10'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{sub.name}</span>
                  {urgent && (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      Urgent
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Renews on {formatDate(sub.renewalDate)}
                </div>
              </div>

              <div className="text-sm font-semibold text-amber-400">
                {sub.daysLeft === 0
                  ? 'Renews today'
                  : `Renews in ${sub.daysLeft} days`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
