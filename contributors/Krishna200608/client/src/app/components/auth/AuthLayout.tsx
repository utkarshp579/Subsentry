'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  mode: 'sign-in' | 'sign-up';
}

export default function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-black">
      {/* Left Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 relative z-10 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/30">
        {/* Logo & Branding */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo.svg"
                alt="SubSentry Logo"
                className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300"
              />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              SubSentry
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-400 text-lg">
            {mode === 'sign-in'
              ? 'Sign in to manage your subscriptions securely'
              : 'Start tracking your subscriptions in seconds'}
          </p>
        </div>

        {/* Clerk Auth Component */}
        <div className="auth-container">{children}</div>

        {/* Micro-copy & Trust Indicators */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>SOC 2 compliant</span>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Switch Auth Mode */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-400">
            {mode === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign up for free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Panel - Visual/Marketing */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Main Heading */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Take control of
            <br />
            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              your subscriptions
            </span>
          </h2>

          <p className="text-xl text-white/80 mb-12 max-w-md leading-relaxed">
            Never miss a payment or renewal again. SubSentry helps you track, manage, and optimize all your subscriptions in one place.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Real-time Alerts"
              description="Get notified before renewals"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Spending Analytics"
              description="Visualize your subscription costs"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Bank-grade Security"
              description="Your data is always encrypted"
            />
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-white/60">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">$2M+</div>
              <div className="text-sm text-white/60">Saved Monthly</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-white/60">Uptime</div>
            </div>
          </div>
        </div>

        {/* Corner Badge */}
        <div className="absolute top-8 right-8 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-white font-medium">Free to start</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 group cursor-default">
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-sm text-white/70">{description}</div>
      </div>
    </div>
  );
}
