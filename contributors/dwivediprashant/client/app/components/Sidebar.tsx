"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarProperties {
  activePage: string;
}

export default function Sidebar({ activePage }: SidebarProperties) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getActiveStateClasses = (currentPage: string) => {
    const isActive = currentPage === activePage;
    return isActive
      ? "bg-[#3B82F6] text-white"
      : "text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[#282828]";
  };

  const navigationItems = [
    { name: "Dashboard", href: "/" },
    { name: "Subscriptions", href: "/subscriptions" },
    { name: "Renewals", href: "/renewals" },
    { name: "Analytics", href: "/analytics" },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 w-64 h-screen bg-[#191919] border-r border-[#2A2A2A]/50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-0
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#2A2A2A]/50">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Subsentry"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-[#FFFFFF]">Subsentry</span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#B3B3B3] hover:text-[#FFFFFF] p-2 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                transition-all duration-200 mb-1
                ${getActiveStateClasses(item.name)}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#191919] border border-[#2A2A2A]/50 rounded-lg p-3 text-[#B3B3B3] hover:text-[#FFFFFF] transition-colors shadow-lg"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </>
  );
}
