"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { Info } from "lucide-react";



/* ---------------- Types ---------------- */

interface FormState {
  name: string;
  amount: string;
  billingCycle: string;
  renewalDate: Date | null;
  category: string;
  isTrial: boolean;
  source: string;
  notes: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

/* ---------------- Component ---------------- */

export default function AddSubscriptionForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    amount: "",
    billingCycle: "",
    renewalDate: null,
    category: "",
    isTrial: false,
    source: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ---------- Handlers ---------- */

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Errors = {};

    if (!form.name.trim()) e.name = "Name is required";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Amount must be greater than 0";
    if (!form.billingCycle) e.billingCycle = "Billing cycle is required";
    if (!form.isTrial && !form.renewalDate)
      e.renewalDate = "Renewal date is required";
    if (!form.category) e.category = "Category is required";
    if (!form.source) e.source = "Source is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          amount: Number(form.amount),
          billingCycle: form.billingCycle,
          renewalDate: form.isTrial
            ? null
            : form.renewalDate?.toISOString().split("T")[0],
          category: form.category,
          isTrial: form.isTrial,
          source: form.source,
          notes: form.notes,
        }),
      });

      if (!res.ok) throw new Error();

      setSuccess(true);
      setForm({
        name: "",
        amount: "",
        billingCycle: "",
        renewalDate: null,
        category: "",
        isTrial: false,
        source: "",
        notes: "",
      });
    } catch {
      alert("Failed to add subscription");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-neutral-900 p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-white">Add Subscription</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Track a recurring payment and never miss a renewal.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Netflix, ChatGPT Plus"
          />
        </Field>

        <Field label="Amount ($)" required error={errors.amount}>
          <input
            type="number"
            className={inputClass}
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            placeholder="9.99"
          />
        </Field>

        <Field label="Billing Cycle" required error={errors.billingCycle}>
          <select
            className={inputClass}
            value={form.billingCycle}
            onChange={(e) => update("billingCycle", e.target.value)}
          >
            <option value="" className="bg-neutral-900 text-white">
              Select cycle
            </option>
            <option value="monthly" className="bg-neutral-900 text-white">
              Monthly
            </option>
            <option value="yearly" className="bg-neutral-900 text-white">
              Yearly
            </option>
          </select>
        </Field>

        <Field
          label="Renewal Date"
          required={!form.isTrial}
          info="Next date you will be charged"
          error={errors.renewalDate}
        >
          <DatePicker
            value={form.renewalDate}
            disabled={form.isTrial}
            onChange={(d) => update("renewalDate", d)}
          />
        </Field>

        <Field label="Category" required error={errors.category}>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="" className="bg-neutral-900 text-white">
              Select category
            </option>
            <option value="productivity" className="bg-neutral-900 text-white">
              Productivity
            </option>
            <option value="entertainment" className="bg-neutral-900 text-white">
              Entertainment
            </option>
            <option value="utilities" className="bg-neutral-900 text-white">
              Utilities
            </option>
          </select>
        </Field>

        <Field label="Source" required error={errors.source}>
          <select
            className={inputClass}
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
          >
            <option value="" className="bg-neutral-900 text-white">
              Select source
            </option>
            <option value="manual" className="bg-neutral-900 text-white">
              Manual
            </option>
            <option value="gmail" className="bg-neutral-900 text-white">
              Gmail Import
            </option>
          </select>
        </Field>
      </div>

      {/* Trial */}
      <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-850 px-4 py-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.isTrial}
            onChange={(e) => {
              update("isTrial", e.target.checked);
              if (e.target.checked) update("renewalDate", null);
            }}
            className="mt-1 h-4 w-4 accent-purple-500"
          />
          <div>
            <p className="text-sm text-neutral-200">
              This subscription is currently in trial
            </p>
            <p className="text-xs text-neutral-500">
              Renewal date will be required once the trial ends
            </p>
          </div>
        </label>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-neutral-300">
          Notes (optional)
        </label>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Any extra details…"
        />
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-6">
        {success && (
          <span className="text-sm text-green-400">
            Subscription added successfully
          </span>
        )}

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Subscription"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Field ---------------- */

function Field({
  label,
  required,
  info,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  info?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-300">
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </label>

        {info && (
          <div className="group relative">
            <Info size={14} className="text-neutral-500" />
            <div className="absolute left-1/2 top-6 hidden w-56 -translate-x-1/2 rounded-lg bg-neutral-800 p-2 text-xs text-neutral-300 shadow-lg group-hover:block">
              {info}
            </div>
          </div>
        )}
      </div>

      {children}

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

/* ---------------- Date Picker ---------------- */

function DatePicker({
  value,
  onChange,
  disabled,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  disabled?: boolean;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`${inputClass} text-left ${
            !value && "text-neutral-500"
          }`}
        >
          {value ? format(value, "MMM dd, yyyy") : "Select date"}
        </button>
      </Popover.Trigger>

      <Popover.Content
        sideOffset={8}
        className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 shadow-xl"
      >
        <DayPicker
          mode="single"
          selected={value ?? undefined}
          onSelect={(d) => d && onChange(d)}
          disabled={{ before: new Date() }}
          className="text-white"
        />

      </Popover.Content>
    </Popover.Root>
  );
}

/* ---------------- Styles ---------------- */

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-2.5 " +
  "text-sm text-white placeholder-neutral-500 outline-none transition " +
  "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30";
