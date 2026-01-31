'use client';

import { Card } from '@/components/ui/card';
import {
  CURRENCY_OPTIONS,
  convertCurrency,
  formatCurrency,
  formatDate,
  getDaysUntilRenewal,
  isUrgentRenewal,
} from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, CalendarClock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type UpcomingRenewal = {
  _id: string;
  name: string;
  renewalDate: string;
  amount: number;
  currency?: string;
  billingCycle?: string;
  status?: string;
  isTrial?: boolean;
};

export default function RenewalsPage() {
  const { getToken } = useAuth();
  const [upcoming, setUpcoming] = useState<UpcomingRenewal[]>([]);
  const [windowDays, setWindowDays] = useState<number>(3);
  const [message, setMessage] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcoming = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const token = await getToken?.();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/alerts/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to fetch upcoming renewals');
      }

      setUpcoming(Array.isArray(data.subscriptions) ? data.subscriptions : []);
      setWindowDays(data.windowDays ?? 3);
      if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to fetch renewals';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, [getToken]);

  return (
    <DashboardLayout
      title="Renewals"
      subtitle="Upcoming renewals based on your alert window"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="text-sm text-gray-400">
          Alert window: <span className="text-white font-medium">{windowDays} days</span>
          <span className="text-gray-500"> · </span>
          <Link href="/settings" className="text-blue-400 hover:text-blue-300">
            Manage rules
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="appearance-none px-3 py-2 text-sm rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] text-gray-300 outline-none cursor-pointer hover:border-[#3a3a3a] transition-colors"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchUpcoming}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] text-sm text-gray-300 hover:border-[#3a3a3a]"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-gray-400">Loading renewals...</div>
      ) : upcoming.length === 0 ? (
        <Card className="p-8 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] text-center">
          <CalendarClock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">
            No subscriptions renewing in the next {windowDays} days.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcoming.map((sub) => {
            const days = getDaysUntilRenewal(sub.renewalDate);
            const urgent = isUrgentRenewal(sub.renewalDate);
            return (
              <Card
                key={sub._id}
                className={`p-5 rounded-2xl border ${
                  urgent
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-[#1a1a1a] bg-[#0f0f0f]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {sub.name}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {formatDate(sub.renewalDate)}
                      {sub.billingCycle ? ` · ${sub.billingCycle}` : ''}
                    </div>
                    {sub.isTrial && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Trial ending
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      {formatCurrency(
                        convertCurrency(
                          sub.amount,
                          sub.currency || 'USD',
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </div>
                    <div className={`text-xs ${urgent ? 'text-amber-300' : 'text-gray-400'}`}>
                      {days === 0 ? 'Renews today' : `Renews in ${days} days`}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
