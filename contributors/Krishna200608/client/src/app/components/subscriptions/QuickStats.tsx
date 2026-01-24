'use client';

import { Subscription } from '@/lib/api';
import { formatCurrency, isUrgentRenewal, getDaysUntilRenewal } from '@/lib/utils';
import { DollarSign, CreditCard, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SpotlightCard, AnimatedCounter } from '@/components/ui/aceternity';

interface QuickStatsProps {
  subscriptions: Subscription[];
}

export default function QuickStats({ subscriptions }: QuickStatsProps) {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') return sum + sub.amount;
    if (sub.billingCycle === 'yearly') return sum + (sub.amount / 12);
    if (sub.billingCycle === 'weekly') return sum + (sub.amount * 4.33);
    return sum + sub.amount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const urgentRenewals = subscriptions.filter(s =>
    s.status === 'active' && isUrgentRenewal(s.renewalDate)
  ).length;

  const trialsEnding = subscriptions.filter(s =>
    s.isTrial && s.trialEndsAt && getDaysUntilRenewal(s.trialEndsAt) <= 7
  ).length;

  const stats = [
    {
      label: 'Monthly Spend',
      value: monthlyTotal,
      displayValue: formatCurrency(monthlyTotal),
      icon: DollarSign,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      spotlightColor: 'rgba(59, 130, 246, 0.15)',
      change: `${formatCurrency(yearlyTotal)}/year`,
      isMonetary: true,
    },
    {
      label: 'Active Subscriptions',
      value: activeSubscriptions.length,
      displayValue: activeSubscriptions.length.toString(),
      icon: CreditCard,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      spotlightColor: 'rgba(16, 185, 129, 0.15)',
      change: `${subscriptions.length} total`,
      isMonetary: false,
    },
    {
      label: 'Urgent Renewals',
      value: urgentRenewals,
      displayValue: urgentRenewals.toString(),
      icon: AlertTriangle,
      iconBg: urgentRenewals > 0 ? 'bg-amber-500/20' : 'bg-gray-500/20',
      iconColor: urgentRenewals > 0 ? 'text-amber-400' : 'text-gray-400',
      spotlightColor: urgentRenewals > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(107, 114, 128, 0.1)',
      change: 'Next 3 days',
      highlight: urgentRenewals > 0,
      isMonetary: false,
    },
    {
      label: 'Trials Ending',
      value: trialsEnding,
      displayValue: trialsEnding.toString(),
      icon: Clock,
      iconBg: trialsEnding > 0 ? 'bg-purple-500/20' : 'bg-gray-500/20',
      iconColor: trialsEnding > 0 ? 'text-purple-400' : 'text-gray-400',
      spotlightColor: trialsEnding > 0 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(107, 114, 128, 0.1)',
      change: 'Within 7 days',
      highlight: trialsEnding > 0,
      isMonetary: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <SpotlightCard
            key={stat.label}
            spotlightColor={stat.spotlightColor}
            className="p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </motion.div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.isMonetary ? (
                  <span>
                    $<AnimatedCounter value={Math.round(stat.value)} duration={1} />
                  </span>
                ) : (
                  <AnimatedCounter value={stat.value} duration={0.8} />
                )}
              </div>
              <div className={`text-xs ${stat.highlight ? stat.iconColor : 'text-gray-400'}`}>
                {stat.change}
              </div>
            </motion.div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
