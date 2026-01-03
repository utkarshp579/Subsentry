export default function Sidebar({ activePage }: { activePage: string }) {
  const getActiveClass = (page: string) => {
    if (page === activePage) {
      return "bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30";
    }
    return "text-[#FFFFFF] hover:bg-[#222222]";
  };

  return (
    <aside className="w-64 bg-[#111111] border-r border-[#222222]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGZhYUrmk6vDmi1-Pj7oI-HzTpQDCi9-IFTA&s" 
            alt="Subsentry" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-xl font-semibold text-[#FFFFFF]">Subsentry</span>
        </div>
        
        <nav className="space-y-1">
          <a href="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getActiveClass('Dashboard')}`}>
            <span className="font-medium">Dashboard</span>
          </a>
          
          <a href="/subscriptions" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getActiveClass('Subscriptions')}`}>
            <span className="font-medium">Subscriptions</span>
          </a>
          
          <a href="/renewals" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getActiveClass('Renewals')}`}>
            <span className="font-medium">Renewals</span>
          </a>
          
          <a href="/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getActiveClass('Analytics')}`}>
            <span className="font-medium">Analytics</span>
          </a>
          
          <div className="border-t border-[#222222] my-4"></div>
          
          <div className="px-3 py-2 text-sm font-medium text-[#999999] uppercase tracking-wider">Account</div>
          
          <a href="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getActiveClass('Settings')}`}>
            <span className="font-medium">Settings</span>
          </a>
          
          <a href="/profile" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getActiveClass('Profile')}`}>
            <span className="font-medium">Profile</span>
          </a>
        </nav>
      </div>
    </aside>
  );
}
