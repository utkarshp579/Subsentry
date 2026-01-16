import React from "react";

interface SummaryStats {
  monthlySpend: number;
  yearlySpend: number;
  activeSubs: number;
  trialSubs: number;
}

interface SummaryWidgetsProps {
  stats: SummaryStats;
}

const WidgetCard = ({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}) => (
  <div
    className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between h-28 transition-transform hover:scale-[1.02] ${
      highlight
        ? "bg-gray-900 text-white border-gray-900 dark:bg-blue-600 dark:border-blue-600"
        : "bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    }`}
  >
    <p
      className={`text-sm font-medium ${
        highlight
          ? "text-gray-300 dark:text-blue-100"
          : "text-gray-500 dark:text-gray-400"
      }`}
    >
      {label}
    </p>
    <div>
      <h3 className="text-2xl font-bold">{value}</h3>
      {subtext && (
        <p
          className={`text-xs mt-1 ${
            highlight
              ? "text-gray-400 dark:text-blue-200"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {subtext}
        </p>
      )}
    </div>
  </div>
);

export default function SummaryWidgets({ stats }: SummaryWidgetsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Monthly Spend - Highlighted as key metric */}
      <WidgetCard
        label="Monthly Spend"
        value={formatCurrency(stats.monthlySpend)}
        subtext="Estimated"
        highlight={true}
      />

      {/* Yearly Spend */}
      <WidgetCard
        label="Yearly Spend"
        value={formatCurrency(stats.yearlySpend)}
        subtext="Projected"
      />

      {/* Active Subscriptions */}
      <WidgetCard label="Active Subs" value={stats.activeSubs} />

      {/* Trials Count */}
      <WidgetCard label="Active Trials" value={stats.trialSubs} />
    </div>
  );
}
