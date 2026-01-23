'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  RefreshCw,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { label: 'Renewals', href: '/renewals', icon: RefreshCw },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const accountItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Profile', href: '/profile', icon: User },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ 
  isCollapsed = false, 
  onToggle,
  isMobileOpen = false,
  onMobileClose 
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle?.();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className={cn(
        'h-16 flex items-center border-b border-[#1a1a1a] px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onMobileClose}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20">
            <Image
              src="/logo.png"
              alt="SubSentry Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              SubSentry
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <button
              onClick={handleToggle}
              className="hidden md:flex p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {collapsed && (
        <button
          onClick={handleToggle}
          className="mx-auto mt-4 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white hidden md:flex"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                active
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]',
                collapsed && 'justify-center px-0'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors flex-shrink-0',
                  active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        <div className={cn(
          'my-6 border-t border-[#1a1a1a]',
          collapsed && 'mx-2'
        )} />

        {!collapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account
          </div>
        )}

        {accountItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                active
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]',
                collapsed && 'justify-center px-0'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors flex-shrink-0',
                  active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pro Upgrade Banner */}
      {!collapsed && (
        <div className="p-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Unlock unlimited tracking & advanced analytics
            </p>
            <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-[#0a0a0a] border-r border-[#1a1a1a] transition-all duration-300 ease-in-out h-screen sticky top-0',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] z-50 md:hidden transition-transform duration-300 ease-in-out flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
