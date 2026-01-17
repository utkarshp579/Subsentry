"use client";

import { useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Subscription {
  _id: string;
  name: string;
  amount: number;
  billingCycle: string;
  renewalDate: string;
  category: string;
  isTrial: boolean;
  source: string;
  notes: string;
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDeleteSuccess: (id: string) => void;
}

export default function SubscriptionCard({
  subscription,
  onEdit,
  onDeleteSuccess,
}: SubscriptionCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDeleteSuccess(subscription._id);
        setIsDeleteModalOpen(false);
      } else {
        alert("Failed to delete subscription");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting subscription");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                subscription.category === "Entertainment"
                  ? "bg-purple-100 text-purple-600"
                  : subscription.category === "Work"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {subscription.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">
                {subscription.name}
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {subscription.billingCycle}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">
              ${subscription.amount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(subscription.renewalDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              subscription.isTrial
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700 font-medium"
            }`}
          >
            {subscription.isTrial ? "Free Trial" : "Active"}
          </span>

          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(subscription)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        subscriptionName={subscription.name}
      />
    </>
  );
}
