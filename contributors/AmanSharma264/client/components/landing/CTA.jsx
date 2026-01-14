'use client';

import { ArrowRight } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

export default function CTA() {
  return (
    <section className="relative py-32 bg-slate-900 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20" />
      
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-8">
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to take control of
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            your subscriptions?
          </span>
        </h2>

        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Join thousands of users who are saving money and staying organized with SubSentry
        </p>

        <SignUpButton mode="modal">
          <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </SignUpButton>

        <p className="mt-6 text-gray-400 text-sm">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}