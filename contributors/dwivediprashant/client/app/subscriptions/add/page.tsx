"use client";

import { useState } from "react";
import AppLayout from "../../components/AppLayout";
import SubscriptionForm from "../../components/SubscriptionForm";
import { useRouter } from "next/navigation";

export default function AddSubscription() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);

  const handleSuccess = () => {
    // Navigate back to subscriptions list
    router.push("/subscriptions");
  };

  return (
    <AppLayout activePage="Subscriptions">
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#6B7280] hover:text-[#111827] mb-4 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Subscriptions
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#111827] mb-2">
                  Add New Subscription
                </h1>
                <p className="text-[#6B7280]">
                  Track your recurring expenses and never miss a renewal
                </p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          {showForm && <SubscriptionForm onSuccess={handleSuccess} />}
        </div>
      </div>
    </AppLayout>
  );
}
