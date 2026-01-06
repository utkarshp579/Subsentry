import AppLayout from "./components/AppLayout";

export default function Dashboard() {
  return (
    <AppLayout activePage="Dashboard">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Dashboard</h1>
        <p className="text-[#B3B3B3]">
          Welcome back! Here's an overview of your subscriptions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#191919] p-6 rounded-xl border border-[#2A2A2A]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#FFFFFF] text-sm font-medium">
              Monthly Spend
            </span>
            <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center">
              <span className="text-[#0000FF] text-sm">💰</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-[#0000FF]">$284.50</div>
          <div className="text-xs text-[#B3B3B3] mt-1">
            +12% from last month
          </div>
        </div>

        <div className="bg-[#191919] p-6 rounded-xl border border-[#2A2A2A]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#FFFFFF] text-sm font-medium">
              Active Subscriptions
            </span>
            <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center">
              <span className="text-[#10B981] text-sm">✓</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-[#009200]">12</div>
          <div className="text-xs text-[#B3B3B3] mt-1">All active</div>
        </div>

        <div className="bg-[#191919] p-6 rounded-xl border border-[#2A2A2A]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#FFFFFF] text-sm font-medium">
              Upcoming Renewals
            </span>
            <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center">
              <span className="text-[#F59E0B] text-sm">📅</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-[#F59E0B]">3</div>
          <div className="text-xs text-[#B3B3B3] mt-1">Next 7 days</div>
        </div>

        <div className="bg-[#191919] p-6 rounded-xl border border-[#2A2A2A]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#FFFFFF] text-sm font-medium">
              Free Trials
            </span>
            <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center">
              <span className="text-[#737373] text-sm">⏱</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-[#FF0000]">2</div>
          <div className="text-xs text-[#B3B3B3] mt-1">Ending soon</div>
        </div>
      </div>
    </AppLayout>
  );
}
