import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#000000] flex">
      <Sidebar activePage="Dashboard" />
      
      {/* Main Content */}
      <div className="flex-1">
        <Header title="Dashboard" />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#111111] p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#999999] text-sm font-medium">Monthly Spend</span>
                <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                  <span className="text-[#3B82F6] text-sm">💰</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#FFFFFF]">$284.50</div>
              <div className="text-xs text-[#999999] mt-1">+12% from last month</div>
            </div>

            <div className="bg-[#111111] p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#999999] text-sm font-medium">Active Subscriptions</span>
                <div className="w-8 h-8 bg-[#22C55E]/20 rounded-lg flex items-center justify-center">
                  <span className="text-[#22C55E] text-sm">✓</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#FFFFFF]">12</div>
              <div className="text-xs text-[#999999] mt-1">All active</div>
            </div>

            <div className="bg-[#111111] p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#999999] text-sm font-medium">Upcoming Renewals</span>
                <div className="w-8 h-8 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                  <span className="text-[#F59E0B] text-sm">📅</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#FFFFFF]">3</div>
              <div className="text-xs text-[#999999] mt-1">Next 7 days</div>
            </div>

            <div className="bg-[#111111] p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#999999] text-sm font-medium">Free Trials</span>
                <div className="w-8 h-8 bg-[#64748B]/20 rounded-lg flex items-center justify-center">
                  <span className="text-[#999999] text-sm">⏱</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#FFFFFF]">2</div>
              <div className="text-xs text-[#999999] mt-1">Ending soon</div>
            </div>
          </div>

          {/* Subscriptions Preview Section */}
          <div className="bg-[#111111] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#FFFFFF] mb-4">Recent Subscriptions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#000000] rounded-lg">
                <div className="flex items-start gap-4">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2048px-Netflix_2015_logo.svg.png" 
                    alt="Netflix" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#FFFFFF]">Netflix</div>
                    <div className="text-sm text-[#999999] mb-2">Entertainment</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#FFFFFF]">$15.99</div>
                        <div className="text-sm text-[#999999]">Monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#22C55E]">Active</div>
                        <div className="text-xs text-[#999999]">Renews Dec 15</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#000000] rounded-lg">
                <div className="flex items-start gap-4">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png" 
                    alt="Spotify" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#FFFFFF]">Spotify</div>
                    <div className="text-sm text-[#999999] mb-2">Music</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#FFFFFF]">$9.99</div>
                        <div className="text-sm text-[#999999]">Monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#22C55E]">Active</div>
                        <div className="text-xs text-[#F59E0B]">Renews Dec 10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#000000] rounded-lg">
                <div className="flex items-start gap-4">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGZhYUrmk6vDmi1-Pj7oI-HzTpQDCi9-IFTA&s" 
                    alt="Adobe Creative" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#FFFFFF]">Adobe Creative</div>
                    <div className="text-sm text-[#999999] mb-2">Software</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#FFFFFF]">$52.99</div>
                        <div className="text-sm text-[#999999]">Monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#22C55E]">Active</div>
                        <div className="text-xs text-[#999999]">Renews Dec 20</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#000000] rounded-lg">
                <div className="flex items-start gap-4">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGZhYUrmk6vDmi1-Pj7oI-HzTpQDCi9-IFTA&s" 
                    alt="GitHub Pro" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#FFFFFF]">GitHub Pro</div>
                    <div className="text-sm text-[#999999] mb-2">Development</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#FFFFFF]">$4.00</div>
                        <div className="text-sm text-[#999999]">Monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#22C55E]">Active</div>
                        <div className="text-xs text-[#999999]">Renews Jan 5</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#000000] rounded-lg">
                <div className="flex items-start gap-4">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGZhYUrmk6vDmi1-Pj7oI-HzTpQDCi9-IFTA&s" 
                    alt="OpenAI" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#FFFFFF]">OpenAI</div>
                    <div className="text-sm text-[#999999] mb-2">AI Tools</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#FFFFFF]">$20.00</div>
                        <div className="text-sm text-[#999999]">Monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#F59E0B]">Trial</div>
                        <div className="text-xs text-[#F59E0B]">Ends Dec 12</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
