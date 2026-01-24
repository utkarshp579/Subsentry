'use client';

import { Card } from '@/components/ui/card';
import { convertCurrency, formatCurrency } from '@/lib/utils';
import { Calendar, CreditCard, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Subscription {
  amount: number;
  currency?: string;
  billingCycle: 'monthly' | 'yearly' | string;
  status: string;
  isTrial?: boolean;
}

interface SummaryWidgetsProps {
  subscriptions: Subscription[];
  displayCurrency: string;
};

// CountUp hook
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);

      setValue(Math.floor(target * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

const SummaryWidgets = ({ subscriptions, displayCurrency }: SummaryWidgetsProps) => {
  const metrics = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
    const monthlySpend = activeSubscriptions.reduce((sum, sub) => {
      const amountInDisplay = convertCurrency(
        sub.amount,
        sub.currency || 'USD',
        displayCurrency
      );
      if (sub.billingCycle === 'monthly') return sum + amountInDisplay;
      if (sub.billingCycle === 'yearly') return sum + amountInDisplay / 12;
      if (sub.billingCycle === 'weekly') return sum + amountInDisplay * 4.33;
      return sum + amountInDisplay;
    }, 0);

    const yearlySpend = monthlySpend * 12;
    const activeCount = activeSubscriptions.length;
    const trialCount = subscriptions.filter((s) => s.isTrial).length;

    return { monthlySpend, yearlySpend, activeCount, trialCount };
  }, [subscriptions, displayCurrency]);

  const animatedMonthly = useCountUp(Math.round(metrics.monthlySpend));
  const animatedYearly = useCountUp(Math.round(metrics.yearlySpend));
  const animatedActive = useCountUp(metrics.activeCount);
  const animatedTrial = useCountUp(metrics.trialCount);

  const widgetData = [
    {
      label: 'Monthly Spend',
      value: formatCurrency(animatedMonthly, displayCurrency),
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      highlight: true,
      bg: 'bg-gradient-to-br from-[#101c2c] to-[#0a0f1a]',
      ring: 'ring-2 ring-blue-500/40 shadow-blue-500/20',
    },
    {
      label: 'Yearly Spend',
      value: formatCurrency(animatedYearly, displayCurrency),
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      highlight: false,
      bg: 'bg-gradient-to-br from-[#1a102c] to-[#120a1a]',
      ring: 'ring-1 ring-purple-900/30',
    },
    {
      label: 'Active Subscriptions',
      value: animatedActive,
      icon: <CreditCard className="w-6 h-6 text-green-400" />,
      highlight: false,
      bg: 'bg-gradient-to-br from-[#102c1a] to-[#0a1a12]',
      ring: 'ring-1 ring-green-900/30',
    },
    {
      label: 'Trials Count',
      value: animatedTrial,
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      highlight: false,
      bg: 'bg-gradient-to-br from-[#2c2410] to-[#1a150a]',
      ring: 'ring-1 ring-yellow-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {widgetData.map((w) => (
        <Card
          key={w.label}
          className={`relative flex flex-col items-center justify-center h-32 p-6 rounded-2xl border border-[#232323] shadow-lg ${w.bg} ${w.ring}
          transition-all duration-200
          ${
            w.highlight ? 'scale-[1.05]' : 'hover:scale-[1.02] hover:shadow-xl'
          }`}
        >
          <div className="absolute top-4 right-4 opacity-25">{w.icon}</div>

          <span className="text-xs uppercase tracking-wide text-gray-400">
            {w.label}
          </span>

          {w.value !== null ? (
            <span className="text-3xl font-bold text-white mt-1">
              {w.value}
            </span>
          ) : (
            <span className="w-20 h-8 bg-gray-800/40 rounded animate-pulse mt-1" />
          )}
        </Card>
      ))}
    </div>
  );
};

export default SummaryWidgets;
