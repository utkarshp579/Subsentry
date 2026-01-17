"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  name: z.string().min(1, "Subscription name is required"),
  price: z.string().min(1, "Price is required"),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  renewalDate: z.string().min(1, "Renewal date is required"),
  category: z.string().min(1, "Category is required"),
  source: z.string().min(1, "Payment source is required"),
  isTrial: z.boolean().default(false),
  trialEndDate: z.string().optional(),
  notes: z.string().optional(),
});

const billingCycleOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekly", label: "Weekly" },
];

const categories = [
  { value: "Education", label: "Education" },
  { value: "Software", label: "Software" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Finance", label: "Finance" },
  { value: "Productivity", label: "Productivity" },
  { value: "Other", label: "Other" },
]


const sources = [
  { value: "UPI", label: "UPI" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Debit Card", label: "Debit Card" },
  { value: "PayPal", label: "PayPal" },
  { value: "Bank", label: "Bank" },
  { value: "Other", label: "Other" },
]


export default function SubscriptionForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      price: "",
      billingCycle: "monthly",
      renewalDate: "",
      category: categories[0].value,
      source: sources[0].value,
      isTrial: false,
      trialEndDate: "",
      notes: "",
    },
  });

  const [successMessage, setSuccessMessage] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;
  const isTrial = watch("isTrial");

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    
    const payload = {
      ...data,
      price: parseFloat(data.price),
      trialEndDate: data.isTrial ? data.trialEndDate : null,
    };

    const res = await fetch("http://localhost:5000/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return;
    }
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      form.reset();
      onSuccess();
    }, 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input placeholder="Subscription Name *" {...register("name")} />
      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Price *" type="number" {...register("price")} />
        <Select onValueChange={(v) => setValue("billingCycle", v)}>
          <SelectTrigger><SelectValue placeholder="Billing Cycle" /></SelectTrigger>
          <SelectContent>
            {billingCycleOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input type="date" {...register("renewalDate")} />
      <div className="grid grid-cols-2 gap-3">
        <Select onValueChange={(v) => setValue("category", v)}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setValue("source", v)}>
          <SelectTrigger><SelectValue placeholder="Payment Source" /></SelectTrigger>
          <SelectContent>
            {sources.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-3">
        <Switch checked={isTrial} onCheckedChange={(v) => setValue("isTrial", v)} />
        <span className="text-sm text-slate-700">Trial Active</span>
      </div>

      {isTrial && (
        <Input
          type="date"
          {...register("trialEndDate")}
          placeholder="Trial End Date"
        />
      )}

      <Textarea placeholder="Notes (optional)" {...register("notes")} />

      {successMessage && (
        <p className="text-green-600 font-semibold text-center">
          Subscription added successfully!
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white">
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Save Subscription
      </Button>
    </form>
  );
}
