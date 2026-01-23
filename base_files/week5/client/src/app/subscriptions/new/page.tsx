'use client';

import DashboardLayout from '@/app/components/DashboardLayout';
import AddSubscriptionForm from '@/app/components/subscriptions/AddSubscriptionForm';

export default function NewSubscriptionPage() {
  return (
    <DashboardLayout title="Add Subscription" subtitle="Create a new recurring charge">
      <div className="py-8 px-4">
        <AddSubscriptionForm />
      </div>
    </DashboardLayout>
  );
}
