"use client";

import { useState, useEffect } from "react";

interface SubscriptionData {
  _id?: string;
  name: string;
  amount: string | number;
  billingCycle: string;
  renewalDate: string;
  category: string;
  isTrial: boolean;
  source: string;
  notes: string;
}

interface SubscriptionFormProps {
  initialData?: SubscriptionData;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SubscriptionForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) {
  const [formData, setFormData] = useState<SubscriptionData>({
    name: "",
    amount: "",
    billingCycle: "monthly",
    renewalDate: "",
    category: "Entertainment",
    isTrial: false,
    source: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      // Ensure amount is string for input, and handle potential missing fields
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        renewalDate: initialData.renewalDate
          ? new Date(initialData.renewalDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [initialData]);

  const handleChange = (
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

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Subscription name is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!formData.renewalDate)
      newErrors.renewalDate = "Renewal date is required";
    if (!formData.source.trim())
      newErrors.source = "Payment source is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const url =
        isEditing && initialData?._id
          ? `/api/subscriptions/${initialData._id}`
          : "/api/subscriptions";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? "update" : "add"} subscription`
        );
      }

      setStatus("success");

      if (!isEditing) {
        setFormData({
          name: "",
          amount: "",
          billingCycle: "monthly",
          renewalDate: "",
          category: "Entertainment",
          isTrial: false,
          source: "",
          notes: "",
        });
      }

      setTimeout(() => {
        setStatus("idle");
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Subscription" : "Add New Subscription"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing
              ? "Update your subscription details below."
              : "Track your recurring expenses efficiently."}
          </p>
        </div>
        {isEditing && onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {status === "success" && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {isEditing ? "Updated successfully!" : "Added successfully!"}
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {errorMessage || "An error occurred."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subscription Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="e.g. Netflix"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full pl-7 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.amount ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle
            </label>
            <select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Renewal Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Renewal *
            </label>
            <input
              type="date"
              name="renewalDate"
              value={formData.renewalDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.renewalDate
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            />
            {errors.renewalDate && (
              <p className="text-red-500 text-xs mt-1">{errors.renewalDate}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="Entertainment">Entertainment</option>
              <option value="Tools">Tools</option>
              <option value="Utilities">Utilities</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Source *
          </label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.source ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="e.g. Visa 4242"
          />
          {errors.source && (
            <p className="text-red-500 text-xs mt-1">{errors.source}</p>
          )}
        </div>

        {/* Trial */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isTrial"
            id="isTrial"
            checked={formData.isTrial}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="isTrial"
            className="ml-2 text-sm text-gray-700 cursor-pointer"
          >
            Free Trial?
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center shadow-sm disabled:opacity-70"
          >
            {status === "loading"
              ? "Saving..."
              : isEditing
              ? "Update Subscription"
              : "Add Subscription"}
          </button>
        </div>
      </form>
    </div>
  );
}
