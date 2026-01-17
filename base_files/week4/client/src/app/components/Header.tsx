'use client';

import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMobileMenuClick }: HeaderProps) {
  return (
    <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onMobileMenuClick && (
          <MobileMenuButton onClick={onMobileMenuClick} />
        )}
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="SubSentry Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] focus-within:border-blue-500/50 transition-colors">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48"
          />
          <kbd className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-gray-500 bg-[#2a2a2a] rounded">
            Ctrl + K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* User Button */}
        <div className="pl-2 md:pl-4 border-l border-[#2a2a2a]">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 md:w-9 md:h-9',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
