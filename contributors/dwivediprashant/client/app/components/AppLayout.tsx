"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProperties {
  children: ReactNode;
  activePage: string;
}

export default function AppLayout({
  children,
  activePage,
}: AppLayoutProperties) {
  return (
    <div className="flex h-screen bg-[#000000]">
      <Sidebar activePage={activePage} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
