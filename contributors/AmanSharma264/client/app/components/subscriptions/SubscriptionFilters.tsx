"use client";

export default function Filters({
  status,
  billing,
  setStatus,
  setBilling,
}: any) {
  return (
    <div className="flex gap-4 mb-4 flex-wrap">
      <select
        className="border p-2 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select
        className="border p-2 rounded"
        value={billing}
        onChange={(e) => setBilling(e.target.value)}
      >
        <option value="">All Billing</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
  );
}
