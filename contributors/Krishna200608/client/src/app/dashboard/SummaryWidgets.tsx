import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, CreditCard, Zap } from "lucide-react";

interface Subscription {
  amount: number;
  billingCycle: "monthly" | "yearly" | string;
  status: string;
  isTrial?: boolean;
}

type Metrics = {
  monthlySpend: number;
  yearlySpend: number;
  activeCount: number;
  trialCount: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import { useAuth } from '@clerk/nextjs';

const fetchMetrics = async (token: string | null | undefined): Promise<Metrics> => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/api/subscriptions`, { headers });
  const data = await res.json();
  const subs = Array.isArray(data.data) ? data.data : [];
  const meta = data.meta || {};

  // Use meta values if available, otherwise fallback to calculation
  let monthlySpend = typeof meta.monthlySpend === 'number' ? meta.monthlySpend : 0;
  let yearlySpend = typeof meta.yearlySpend === 'number' ? meta.yearlySpend : 0;
  let activeCount = 0;
  let trialCount = 0;

  subs.forEach((sub: Subscription) => {
    if (sub.status === "active") {
      activeCount++;
    }
    if (sub.isTrial) trialCount++;
  });

  return { monthlySpend, yearlySpend, activeCount, trialCount };
};

// CountUp hook for animation
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    let startTime: number | null = null;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(start + (target - start) * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }
    requestAnimationFrame(animate);
    // Reset on target change
    return () => setValue(target);
  }, [target, duration]);
  return value;
}

const SummaryWidgets = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    (async () => {
      const token: string | null = await getToken?.();
      fetchMetrics(token).then(setMetrics);
    })();
  }, [getToken]);

  // Always call hooks, use 0 if metrics not loaded yet
  const animatedMonthly = useCountUp(metrics?.monthlySpend ?? 0);
  const animatedYearly = useCountUp(metrics?.yearlySpend ?? 0);
  const animatedActive = useCountUp(metrics?.activeCount ?? 0);
  const animatedTrial = useCountUp(metrics?.trialCount ?? 0);

  const widgetData = [
    {
      label: "Monthly Spend",
      value: metrics ? `₹${animatedMonthly.toLocaleString()}` : null,
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      highlight: true,
      bg: "bg-gradient-to-br from-[#101c2c] to-[#0a0f1a]",
      ring: "ring-2 ring-blue-500/40 shadow-blue-500/20",
    },
    {
      label: "Yearly Spend",
      value: metrics ? `₹${animatedYearly.toLocaleString()}` : null,
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      highlight: false,
      bg: "bg-gradient-to-br from-[#1a102c] to-[#120a1a]",
      ring: "ring-1 ring-purple-900/30",
    },
    {
      label: "Active Subscriptions",
      value: metrics ? animatedActive : null,
      icon: <CreditCard className="w-6 h-6 text-green-400" />,
      highlight: false,
      bg: "bg-gradient-to-br from-[#102c1a] to-[#0a1a12]",
      ring: "ring-1 ring-green-900/30",
    },
    {
      label: "Trials Count",
      value: metrics ? animatedTrial : null,
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      highlight: false,
      bg: "bg-gradient-to-br from-[#2c2410] to-[#1a150a]",
      ring: "ring-1 ring-yellow-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {widgetData.map((w) => (
        <Card
          key={w.label}
          className={`relative flex flex-col items-center justify-center h-32 p-6 rounded-2xl border border-[#232323] shadow-lg ${w.bg} ${w.ring} transition-all duration-200
            ${w.highlight ? "scale-[1.05]" : "hover:scale-[1.02] hover:shadow-xl"}
            group focus-within:ring-2 focus-within:ring-blue-400/60 cursor-pointer select-none`}
          tabIndex={0}
        >
          <div className="absolute top-4 right-4 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none select-none">
            {w.icon}
          </div>
          <div className="flex flex-col items-center z-10">
            <span className={`text-xs font-semibold tracking-wide uppercase mb-1 ${w.highlight ? "text-blue-100" : "text-gray-300"}`}>{w.label}</span>
            {w.value !== null ? (
              <span className={`text-3xl font-extrabold mt-1 ${w.highlight ? "text-blue-100" : "text-white"}`}>{w.value}</span>
            ) : (
              <span className="w-20 h-8 bg-gray-800/40 rounded animate-pulse mt-1" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SummaryWidgets;
