"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { SubscriptionData } from "../subscriptions/page";

interface DeleteConfirmationDialogProps {
  subscription: SubscriptionData;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function DeleteConfirmationDialog({
  subscription,
  onConfirm,
  onCancel,
  isOpen,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#191919] to-[#282828] rounded-xl border border-[#2A2A2A]/50 p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#EF4444]/20 rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="w-5 h-5 text-[#EF4444]"
            />
          </div>
          <h2 className="text-xl font-semibold text-white">
            Delete Subscription
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-3">
            Are you sure you want to delete this subscription? This action
            cannot be undone.
          </p>
          <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]/50">
            <div className="flex items-center gap-3">
              <img
                src={subscription.logoUrl}
                alt={subscription.serviceName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    subscription.serviceName
                  )}&background=191919&color=ffffff&size=40`;
                }}
              />
              <div>
                <p className="font-medium text-white">
                  {subscription.serviceName}
                </p>
                <p className="text-sm text-gray-400">
                  ${subscription.cost.toFixed(2)}/{subscription.billingInterval}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            Delete Subscription
          </button>
        </div>
      </div>
    </div>
  );
}
