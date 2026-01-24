"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import GmailConnect from "../../components/GmailConnect";

function SettingsContent() {
  const searchParams = useSearchParams();
  const gmailParam = searchParams.get("gmail");

  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-zinc-300 mb-4">
              Email Integration
            </h2>
            <GmailConnect gmailParam={gmailParam} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsLoading() {
  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4 mb-8"></div>
          <div className="h-48 bg-zinc-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}
