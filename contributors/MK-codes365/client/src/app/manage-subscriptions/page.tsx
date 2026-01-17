"use client";

import { useState } from "react";
import SubscriptionForm from "../../components/SubscriptionForm";
import SubscriptionCard from "../../components/SubscriptionCard";

// Mock Data
const MOCK_SUBSCRIPTIONS = [
  {
    _id: "1",
    name: "Netflix",
    amount: 15.99,
    billingCycle: "monthly",
    renewalDate: "2024-02-15",
    category: "Entertainment",
    isTrial: false,
    source: "Visa 1234",
    notes: "",
  },
  {
    _id: "2",
    name: "Spotify",
    amount: 9.99,
    billingCycle: "monthly",
    renewalDate: "2024-02-20",
    category: "Entertainment",
    isTrial: false,
    source: "MasterCard 5678",
    notes: "",
  },
  {
    _id: "3",
    name: "Adobe Cloud",
    amount: 54.99,
    billingCycle: "monthly",
    renewalDate: "2024-03-01",
    category: "Work",
    isTrial: true,
    source: "PayPal",
    notes: "Cancel before trial ends",
  },
];

export default function ManageSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Mock Delete Success
  const handleDeleteSuccess = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub._id !== id));
    console.log(`Deleted subscription ${id}`); // In real app, API handles this
  };

  const handleEdit = (sub: any) => {
    setEditingSub(sub);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSub(null);
  };

  const handleSuccess = () => {
    // In a real app, we would refetch mock data or update state with response
    alert(
      "Operation simulated successfully! (Database update would happen here)"
    );
    handleCloseForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Subscriptions
            </h1>
            <p className="text-gray-500">
              Edit or remove your active subscriptions
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSub(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add New
          </button>
        </header>

        {isFormOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
              <SubscriptionForm
                initialData={editingSub}
                isEditing={!!editingSub}
                onCancel={handleCloseForm}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub._id}
              subscription={sub}
              onEdit={handleEdit}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No subscriptions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
