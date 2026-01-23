'use client';

import Link from 'next/link';
import { CreditCard, Plus, Sparkles, BarChart3, Bell, Mail } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <CreditCard className="w-12 h-12 text-blue-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-bounce">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        No subscriptions yet
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-center max-w-md mb-6">
        Start tracking your subscriptions to never miss a renewal again.
        Add your first subscription and take control of your recurring expenses.
      </p>

      {/* CTA Button */}
      <Link
        href="/subscriptions/new"
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-5 h-5" />
        Add Your First Subscription
      </Link>

      {/* Feature List */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm text-gray-400">Track spending across all subscriptions</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm text-gray-400">Get notified before renewals</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-sm text-gray-400">Import from Gmail automatically</p>
        </div>
      </div>
    </div>
  );
}
