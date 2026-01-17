"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Bell,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
      text-white p-6 hidden md:flex flex-col shadow-2xl border-r border-slate-700/50">

      {/* LOGO */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600
            rounded-xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400
            bg-clip-text text-transparent">
            Subsentry
          </h1>
        </div>

        <p className="text-xs text-slate-400 ml-13">
          Manage your subscriptions
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 group
                ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200
                  ${active ? "scale-110" : "group-hover:scale-110"}`}
              />

              <span className="font-medium">{item.name}</span>

              {active && (
                <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE */}
      <div className="mt-auto pt-6 border-t border-slate-700/50">
        <div className="flex items-center gap-3 p-3 rounded-xl
          bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer group">

          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500
            rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-white">Aman Sharma</p>
            <p className="text-xs text-slate-400">Premium Plan</p>
          </div>

          <Settings
            className="w-4 h-4 text-slate-400 group-hover:text-white
              group-hover:rotate-90 transition-all duration-300"
          />
        </div>
      </div>
    </aside>
  );
}
