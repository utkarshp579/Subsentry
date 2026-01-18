'use client';

import { SignIn } from '@clerk/nextjs';
import AuthLayout from '../../components/auth/AuthLayout';

export default function Page() {
  return (
    <AuthLayout mode="sign-in">
      <div className="w-full max-w-md mx-auto">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              // Bright card so Clerk's bright footer matches the card
              card:
                'bg-white border border-gray-200 rounded-2xl p-6 shadow-xl',
              // Hide Clerk headers (we use the layout's title)
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',

              // Social button: subtle light style with icon visible
              socialButtonsBlockButton:
                'w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition',
              socialButtonsBlockButtonText: 'text-gray-800 font-medium',

              dividerLine: 'bg-gray-200',
              dividerText: 'text-gray-400',
              formFieldLabel: 'text-gray-700 font-medium',

              // Inputs: light background and darker text for readable contrast
              formFieldInput:
                'w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition',

              // Primary button: retains vivid gradient so CTA pops on white card
              formButtonPrimary:
                'w-full text-white py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition shadow',

              // Footer / secondary action styling (matches Clerk's default light footer)
              footerActionLink: 'text-blue-600 hover:text-blue-500',
              formFieldAction: 'text-blue-600 hover:text-blue-500',
              identityPreviewEditButton: 'text-blue-600 hover:text-blue-500',

              // Error / success text
              alertText: 'text-red-600',
              formFieldErrorText: 'text-red-600 text-sm',
              formFieldSuccessText: 'text-green-600 text-sm',

              // Password show/hide
              formFieldInputShowPasswordButton: 'text-gray-500 hover:text-gray-700',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
          }}
        />
      </div>
    </AuthLayout>
  );
}
