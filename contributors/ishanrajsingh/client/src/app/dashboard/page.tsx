'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import DashboardLayout from '../components/DashboardLayout';
import SummaryWidgets from './SummaryWidget';

import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  Plus,
  TrendingUp,
} from 'lucide-react';

import { Subscription } from '@/lib/api';
import {
  cn,
  formatCurrency,
  getDaysUntilRenewal,
  isUrgentRenewal,
  getCategoryColor,
  formatDate,
} from '@/lib/utils';
import { getServiceIcon, getServiceColors } from '@/lib/service-icons';

// Mock data for demonstration
const mockSubscriptions: Subscription[] = [
  {
    _id: '1',
    userId: 'user1',
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    renewalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isTrial: false,
    source: 'manual',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    userId: 'user1',
    name: 'Spotify Premium',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'music',
    renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isTrial: false,
    source: 'gmail',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    userId: 'user1',
    name: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'productivity',
    renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isTrial: false,
    source: 'manual',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    userId: 'user1',
    name: 'ChatGPT Plus',
    amount: 20,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'productivity',
    renewalDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isTrial: true,
    trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    userId: 'user1',
    name: 'GitHub Copilot',
    amount: 10,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'productivity',
    renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isTrial: false,
    source: 'imported',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    userId: 'user1',
    name: 'Notion',
    amount: 8,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'productivity',
    renewalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isTrial: false,
    source: 'manual',
    status: 'paused',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await new Promise(r => setTimeout(r, 600));
        setSubs(mockSubscriptions);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getToken]);

  const activeSubs = subs.filter(s => s.status === 'active');

  const urgent = subs.filter(
    s => s.status === 'active' && isUrgentRenewal(s.renewalDate),
  );

  const upcoming = [...activeSubs]
    .sort(
      (a, b) =>
        new Date(a.renewalDate).getTime() -
        new Date(b.renewalDate).getTime(),
    )
    .slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Overview of your subscriptions">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your subscriptions">
      {/* Welcome */}
      <div className="mb-6 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Welcome back 👋</h2>
            <p className="text-gray-400">
              {urgent.length > 0 ? (
                <span className="text-amber-400 font-medium">
                  {urgent.length} renewal{urgent.length > 1 && 's'} soon
                </span>
              ) : (
                'No urgent renewals'
              )}
            </p>
          </div>

          <Link
            href="/subscriptions"
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4" />
            Add Subscription
          </Link>
        </div>
      </div>

      {/* Summary Widgets */}
      <SummaryWidgets />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming renewals */}
        <div className="lg:col-span-2 rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Upcoming Renewals
            </h3>
            <Link
              href="/subscriptions"
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="py-10 text-center text-gray-400">
              No active subscriptions
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(sub => {
                const days = getDaysUntilRenewal(sub.renewalDate);
                const urgentFlag = isUrgentRenewal(sub.renewalDate);
                const categoryColors = getCategoryColor(sub.category);
                const icon = getServiceIcon(sub.name);
                const serviceColors = getServiceColors(sub.name);

                return (
                  <div
                    key={sub._id}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4 transition-colors',
                      urgentFlag
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-[#1a1a1a] hover:bg-[#141414]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold',
                        serviceColors?.bg || categoryColors.bg,
                        serviceColors?.text || categoryColors.text,
                      )}
                    >
                      {icon ||
                        sub.name
                          .split(' ')
                          .map(w => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-white">
                          {sub.name}
                        </span>
                        {sub.isTrial && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                            Trial
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {sub.category}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'text-right',
                        urgentFlag ? 'text-amber-400' : 'text-gray-400',
                      )}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {urgentFlag && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {days === 0
                            ? 'Today'
                            : days === 1
                            ? 'Tomorrow'
                            : `${days}d`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(sub.renewalDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Quick Actions
            </h3>
            <Link
              href="/analytics"
              className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3 hover:bg-[#2a2a2a]"
            >
              <TrendingUp className="text-purple-400" />
              <div>
                <div className="font-medium text-white">
                  View Analytics
                </div>
                <div className="text-xs text-gray-500">
                  Spending insights
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
