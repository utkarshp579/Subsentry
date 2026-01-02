export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">

      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6">SubSentry</h2>

        <nav className="space-y-3 text-sm">
          <p className="cursor-pointer">Dashboard</p>
          <p className="cursor-pointer">Subscriptions</p>
          <p className="cursor-pointer">Settings</p>
        </nav>
      </aside>

    
      <div className="flex flex-col flex-1">
        
        <header className="h-14 flex items-center border-b px-6">
          <h1 className="font-semibold text-lg">Dashboard</h1>
        </header>

        
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
