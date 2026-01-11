"use client";

import { useState, useEffect } from "react";
import { SubscriptionData } from "../subscriptions/page";

interface FormData {
  name: string;
  amount: string;
  billingCycle: string;
  renewalDate: string;
  category: string;
  notes: string;
  source: string;
  isTrial: boolean;
}

interface FormErrors {
  name?: string;
  amount?: string;
  renewalDate?: string;
  category?: string;
  source?: string;
  general?: string;
}

interface EditSubscriptionFormProps {
  subscription: SubscriptionData;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditSubscriptionForm({
  subscription,
  onSuccess,
  onCancel,
}: EditSubscriptionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    amount: "",
    billingCycle: "monthly",
    renewalDate: "",
    category: "other",
    isTrial: false,
    source: "manual",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill form with subscription data
  useEffect(() => {
    const renewalDate = new Date(subscription.upcomingRenewal);
    const formattedDate = renewalDate.toISOString().split("T")[0];

    // Transform back to backend values
    const categoryToBackend = (category: string): string => {
      const categoryMap: { [key: string]: string } = {
        Entertainment: "entertainment",
        Productivity: "productivity",
        Utilities: "utilities",
        Education: "education",
        "Health & Wellness": "health",
        Finance: "finance",
        Other: "other",
      };
      return categoryMap[category] || "other";
    };

    const sourceToBackend = (source: string): string => {
      return source.toLowerCase() === "email" ? "email" : "manual";
    };

    setFormData({
      name: subscription.serviceName,
      amount: subscription.cost.toString(),
      billingCycle: subscription.billingInterval,
      renewalDate: formattedDate,
      category: categoryToBackend(subscription.serviceCategory),
      isTrial: subscription.trialPeriod || false,
      source: sourceToBackend(subscription.integrationSource),
      notes: subscription.notes || "",
    });
  }, [subscription]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.renewalDate) {
      newErrors.renewalDate = "Renewal date is required";
    } else {
      const renewalDate = new Date(formData.renewalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (renewalDate < today) {
        newErrors.renewalDate = "Renewal date cannot be in the past";
      }
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/subscriptions/${subscription._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          notes: formData.notes || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message) {
          setErrors({ general: data.message });
        } else {
          setErrors({
            general: "Failed to update subscription. Please try again.",
          });
        }
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error("Error updating subscription:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: "entertainment", label: "Entertainment" },
    { value: "productivity", label: "Productivity" },
    { value: "utilities", label: "Utilities" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health & Wellness" },
    { value: "finance", label: "Finance" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      {isSuccess && (
        <div className="mb-6 p-4 bg-[#16A34A] text-white rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Subscription updated successfully!
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 bg-[#DC2626] text-white rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {errors.general}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Subscription Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Netflix, Spotify"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Amount ($) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-400">{errors.amount}</p>
            )}
          </div>

          {/* Billing Cycle */}
          <div>
            <label
              htmlFor="billingCycle"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Billing Cycle <span className="text-red-400">*</span>
            </label>
            <select
              id="billingCycle"
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              disabled={isSubmitting}
            >
              <option value="monthly" className="bg-[#191919] text-white">
                Monthly
              </option>
              <option value="yearly" className="bg-[#191919] text-white">
                Yearly
              </option>
            </select>
          </div>

          {/* Renewal Date */}
          <div>
            <label
              htmlFor="renewalDate"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Next Renewal Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              id="renewalDate"
              name="renewalDate"
              value={formData.renewalDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 ${
                errors.renewalDate ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.renewalDate && (
              <p className="mt-1 text-sm text-red-400">{errors.renewalDate}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Category <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option
                  key={cat.value}
                  value={cat.value}
                  className="bg-[#191919] text-white"
                >
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Source */}
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              Source
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${
                errors.source ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="manual" className="bg-[#191919] text-white">
                Manual Entry
              </option>
              <option value="email" className="bg-[#191919] text-white">
                Email Import
              </option>
            </select>
          </div>
        </div>

        {/* Trial Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isTrial"
            name="isTrial"
            checked={formData.isTrial}
            onChange={handleInputChange}
            className="w-4 h-4 text-[#2563EB] border-[#E5E7EB] rounded focus:ring-[#2563EB]"
            disabled={isSubmitting}
          />
          <label htmlFor="isTrial" className="ml-2 text-sm text-white">
            This is a trial subscription
          </label>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 bg-gradient-to-br from-[#191919] to-[#282828] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-500"
            placeholder="Add any additional notes about this subscription..."
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-700 text-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Subscription"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
