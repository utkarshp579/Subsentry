'use client';

import { Card } from '@/components/ui/card';
import {
  CURRENCY_OPTIONS,
  convertCurrency,
  formatCurrency,
  getCategoryColor,
} from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Overview = {
  monthlySpend: number;
  yearlySpend: number;
  activeCount: number;
  trialCount: number;
};

type CategoryBreakdown = {
  category: string;
  spend: number;
  percentage: number;
};

type TrendPoint = {
  month: string;
  amount: number;
};

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trendSeries, setTrendSeries] = useState<TrendPoint[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const token = await getToken?.();
        if (!token) {
          setError('Authentication required');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch analytics');
        }

        setOverview(data.overview ?? null);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setTrendSeries(Array.isArray(data.trendSeries) ? data.trendSeries : []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch analytics';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [getToken]);

  const convertedOverview = useMemo(() => {
    if (!overview) return null;
    return {
      ...overview,
      monthlySpend: convertCurrency(
        overview.monthlySpend ?? 0,
        'USD',
        displayCurrency
      ),
      yearlySpend: convertCurrency(
        overview.yearlySpend ?? 0,
        'USD',
        displayCurrency
      ),
    };
  }, [overview, displayCurrency]);

  const maxTrend = useMemo(() => {
    return trendSeries.reduce((max, point) => Math.max(max, point.amount), 0);
  }, [trendSeries]);

  return (
    <DashboardLayout title="Analytics" subtitle="Spend trends and category insights">
      <div className="flex items-center justify-end mb-4">
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
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-5 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center justify-between text-sm text-gray-400">
                Monthly Spend
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-semibold text-white mt-3">
                {convertedOverview
                  ? formatCurrency(convertedOverview.monthlySpend, displayCurrency)
                  : '--'}
              </div>
            </Card>
            <Card className="p-5 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center justify-between text-sm text-gray-400">
                Yearly Spend
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-semibold text-white mt-3">
                {convertedOverview
                  ? formatCurrency(convertedOverview.yearlySpend, displayCurrency)
                  : '--'}
              </div>
            </Card>
            <Card className="p-5 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center justify-between text-sm text-gray-400">
                Active Subscriptions
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-semibold text-white mt-3">
                {convertedOverview?.activeCount ?? '--'}
              </div>
            </Card>
            <Card className="p-5 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center justify-between text-sm text-gray-400">
                Trials
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-semibold text-white mt-3">
                {convertedOverview?.trialCount ?? '--'}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Categories
              </h3>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No category data yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const colors = getCategoryColor(cat.category);
                    const percent = Math.min(100, Math.max(0, cat.percentage));
                    return (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <span className="capitalize">{cat.category}</span>
                          <span className="text-gray-400">
                            {formatCurrency(
                              convertCurrency(cat.spend, 'USD', displayCurrency),
                              displayCurrency
                            )}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#1b1b1b] overflow-hidden">
                          <div
                            className={`h-full ${colors.bg}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {percent}% of monthly spend
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-6 rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Spend Trend (Last 6 Months)
              </h3>
              {trendSeries.length === 0 ? (
                <p className="text-sm text-gray-400">No trend data yet.</p>
              ) : (
                <div className="flex items-end gap-4 h-40">
                  {trendSeries.map((point) => {
                    const height = maxTrend
                      ? Math.round((point.amount / maxTrend) * 120)
                      : 8;
                    return (
                      <div key={point.month} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-blue-500/40 to-purple-500/40"
                          style={{ height: `${Math.max(height, 8)}px` }}
                        />
                        <div className="text-xs text-gray-400">{point.month}</div>
                        <div className="text-[11px] text-gray-500">
                          {formatCurrency(
                            convertCurrency(point.amount, 'USD', displayCurrency),
                            displayCurrency
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
