import Sidebar from './Sidebar';
import Header from './Header';

export default function ComingSoon({ pageName }: { pageName: string }) {
  return (
    <div className="min-h-screen bg-[#000000] flex">
      <Sidebar activePage={pageName} />
      
      {/* Main Content */}
      <div className="flex-1">
        <Header title={pageName} />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-3xl font-bold text-[#FFFFFF] mb-4">Coming Soon</h2>
              <p className="text-lg text-[#999999]">
                {pageName} is currently under development. We're working hard to bring you this feature soon!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
