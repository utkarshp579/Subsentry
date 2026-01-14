'use client';

import DashboardLayout from './DashboardLayout';
import { Construction, Sparkles } from 'lucide-react';

export default function ComingSoon({ pageName }: { pageName: string }) {
  return (
    <DashboardLayout title={pageName} subtitle="Coming soon">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="relative mb-6 inline-block">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Construction className="w-12 h-12 text-amber-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            <span className="text-white font-medium">{pageName}</span> is currently under development. 
            We&apos;re working hard to bring you this feature soon.
          </p>

          {/* Progress indicator */}
          <div className="mt-8 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>40%</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: '40%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
