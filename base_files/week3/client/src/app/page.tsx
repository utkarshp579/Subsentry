'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

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
        <div className="grid min-h-screen place-items-center p-8 sm:p-20">
          <main className="flex flex-col gap-6 items-center text-center max-w-xl">
            <h1 className="text-4xl font-bold">SubSentry</h1>

            <p className="text-lg text-gray-500">
              Secure subscription management with industry-grade authentication.
            </p>

            <div className="flex gap-4 flex-wrap justify-center">
              <SignInButton>
                <button className="rounded-full bg-black text-white px-6 py-3 hover:bg-gray-800 transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="rounded-full border px-6 py-3 hover:bg-gray-100 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
