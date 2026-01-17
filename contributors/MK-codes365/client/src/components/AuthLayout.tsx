import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  type: "sign-in" | "sign-up";
}

export default function AuthLayout({ children, type }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      {/* Left Column: Auth Forms */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg ring-4 ring-blue-600/20">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              SubSentry
            </span>
          </div>

          <div className="mt-8">
            {children}

            <div className="mt-6">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {type === "sign-in" ? (
                  <>
                    Don't have an account?{" "}
                    <a
                      href="/sign-up"
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Sign up for free
                    </a>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <a
                      href="/sign-in"
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Log in
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure 256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Marketing Section */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-linear-to-br from-blue-700 via-blue-800 to-indigo-950">
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            viewBox="0 0 1163 1024"
            aria-hidden="true"
          >
            <circle
              cx="500"
              cy="500"
              r="500"
              fill="url(#paint0_radial_auth)"
              fillOpacity="0.4"
            />
            <defs>
              <radialGradient
                id="paint0_radial_auth"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(500 500) rotate(90) scale(500)"
              >
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          <div className="relative flex h-full items-center justify-center p-12 text-white">
            <div className="max-w-xl space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
                  Coming soon: Advanced Analytics
                </span>
                <h2 className="text-5xl font-bold tracking-tight">
                  Master Your{" "}
                  <span className="text-blue-300">Subscriptions</span> with
                  Ease.
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Join 10,000+ users who high-track their spending and never
                  miss a renewal again. SubSentry gives you the power to manage
                  everything in one place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-sm text-blue-200">User Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">$1.2M+</div>
                  <div className="text-sm text-blue-200">Tracked Monthly</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-400 border border-white/20 overflow-hidden shadow-sm"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                          i * 123
                        }`}
                        alt="avatar"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-100 italic">
                  "The cleanest subscription tracker I've ever used."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
