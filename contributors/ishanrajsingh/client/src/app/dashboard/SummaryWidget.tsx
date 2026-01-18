'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface Subscription {
  amount: number;
  billingCycle: 'monthly' | 'yearly' | string;
  status: string;
  isTrial?: boolean;
}

type Metrics = {
  monthlySpend: number;
  yearlySpend: number;
  activeCount: number;
  trialCount: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchMetrics(token?: string | null): Promise<Metrics> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/subscriptions`, { headers });
  const json = await res.json();

  const list: Subscription[] = Array.isArray(json.data)
    ? json.data
    : [];
  const meta = json.meta || {};

  let active = 0;
  let trials = 0;

  list.forEach(s => {
    if (s.status === 'active') active++;
    if (s.isTrial) trials++;
  });

  return {
    monthlySpend:
      typeof meta.monthlySpend === 'number' ? meta.monthlySpend : 0,
    yearlySpend:
      typeof meta.yearlySpend === 'number' ? meta.yearlySpend : 0,
    activeCount: active,
    trialCount: trials,
  };
}

/* -----------------------------
   Count-up animation (UNCHANGED)
------------------------------ */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (t: number) => {
      if (!startTime) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      setValue(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(target);
    };

    requestAnimationFrame(animate);
    return () => setValue(target);
  }, [target, duration]);

  return value;
}

export default function SummaryWidgets() {
  const { getToken } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken?.();
      const data = await fetchMetrics(token);
      setMetrics(data);
    })();
  }, [getToken]);

  const monthly = useCountUp(metrics?.monthlySpend ?? 0);
  const yearly = useCountUp(metrics?.yearlySpend ?? 0);
  const active = useCountUp(metrics?.activeCount ?? 0);
  const trials = useCountUp(metrics?.trialCount ?? 0);

  const cards = [
    {
      label: 'Monthly Spend',
      value: `₹${monthly.toLocaleString()}`,
      icon: TrendingUp,
      primary: true,
      gradient: 'from-blue-500/20 via-blue-400/10 to-transparent',
      glow: 'shadow-blue-500/30',
    },
    {
      label: 'Yearly Spend',
      value: `₹${yearly.toLocaleString()}`,
      icon: Calendar,
      gradient: 'from-purple-500/20 via-purple-400/10 to-transparent',
      glow: 'shadow-purple-500/20',
    },
    {
      label: 'Active Subscriptions',
      value: active,
      icon: CreditCard,
      gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
      glow: 'shadow-emerald-500/20',
    },
    {
      label: 'Trials',
      value: trials,
      icon: Zap,
      gradient: 'from-amber-500/20 via-amber-400/10 to-transparent',
      glow: 'shadow-amber-500/20',
    },
  ];

  return (
    <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            tabIndex={0}
            className={`
              group relative overflow-hidden rounded-2xl border border-white/10
              bg-[#0b0f14]/80 backdrop-blur-xl
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-xl
              ${card.primary ? 'scale-[1.06]' : ''}
              ${card.glow}
            `}
          >
            {/* Gradient wash */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-80`}
            />

            {/* Content */}
            <div className="relative z-10 flex h-32 flex-col justify-between p-5">
              {/* Top */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                  {card.label}
                </span>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-5 w-5 text-white/80" />
                </div>
              </div>

              {/* Value */}
              {metrics ? (
                <span
                  className={`text-3xl font-extrabold tracking-tight
                    ${card.primary ? 'text-white' : 'text-gray-100'}
                  `}
                >
                  {card.value}
                </span>
              ) : (
                <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
              )}
            </div>

            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
