'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

const INTRO_STORAGE_KEY = 'subsentry_intro_seen';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const [showIntro, setShowIntro] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/dashboard');
      return;
    }

    const forceIntro = searchParams?.get('intro') === '1';
    const seen = window.localStorage.getItem(INTRO_STORAGE_KEY);
    if (forceIntro || !seen) {
      setShowIntro(true);
    }
  }, [isLoaded, isSignedIn, router, searchParams]);

  const finishIntro = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INTRO_STORAGE_KEY, '1');
    }
    setIsExiting(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 300);
  }, []);

  const handleSkip = useCallback(() => {
    finishIntro();
  }, [finishIntro]);

  useEffect(() => {
    if (!showIntro || typeof window === 'undefined') return;

    const controller = new AbortController();
    setIsExiting(false);
    setVideoError(false);

    fetch('/fintech-intro.mp4', { method: 'HEAD', signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error('intro video missing');
        }
      })
      .catch(() => {
        setVideoError(true);
        finishIntro();
      });

    return () => controller.abort();
  }, [showIntro, finishIntro]);

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {showIntro && (
        <div
          className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
            isExiting ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <video
            className="h-full w-full object-cover"
            src="/fintech-intro.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={finishIntro}
            onError={() => {
              setVideoError(true);
              finishIntro();
            }}
          />
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/70">
              Video failed to load. Skipping intro.
            </div>
          )}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-6 right-6 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-white active:scale-95"
          >
            Skip
          </button>
        </div>
      )}

      {!showIntro && !isSignedIn && (
        <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Gradient Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Navigation */}
          <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/logo.svg"
                  alt="SubSentry Logo"
                  className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SubSentry</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <button className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="relative px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden group shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300">
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>
            </div>
          </nav>

          {/* Hero Section */}
          <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 lg:pt-32">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">Trusted by 10,000+ users worldwide</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-center max-w-4xl leading-tight mb-6">
              <span className="text-white">Never lose track of</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradientText">
                subscriptions again
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg lg:text-xl text-gray-400 text-center max-w-2xl mb-10 leading-relaxed">
              SubSentry helps you manage all your subscriptions in one place. Get real-time alerts, 
              track spending, and save money effortlessly.
            </p>

            {/* CTA Buttons */}
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/sign-up">
                <button className="group relative px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-100">
                  <span className="relative z-10 flex items-center gap-2">
                    Start for Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="group px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-100">
                  <span className="flex items-center gap-2">
                    Sign In
                    <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </span>
                </button>
              </Link>
            </div>

            {/* Micro-copy */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
                title="Smart Alerts"
                description="Get notified before every renewal. Never be surprised by unexpected charges again."
                gradient="from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Analytics Dashboard"
                description="Visualize your spending patterns and find opportunities to save money."
                gradient="from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                title="Bank-grade Security"
                description="256-bit encryption and SOC 2 compliance keep your data safe and private."
                gradient="from-green-500 to-emerald-500"
              />
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 border-t border-white/5 py-8">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">Contact</Link>
            </div>
            <p className="text-center text-xs text-gray-600 mt-4">
              © 2026 SubSentry. All rights reserved.
            </p>
          </footer>
        </div>
      )}
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
    </div>
  );
}
