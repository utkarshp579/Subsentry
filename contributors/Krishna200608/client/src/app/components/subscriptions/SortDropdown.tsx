'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'renewalDate' | 'amount' | 'name' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

interface SortDropdownProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onOrderToggle: () => void;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'renewalDate', label: 'Renewal Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Date Added' },
];

export default function SortDropdown({
  sortField,
  sortOrder,
  onSortChange,
  onOrderToggle,
}: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 hidden sm:inline">Sort by</span>

      <div className="relative">
        <select
          value={sortField}
          onChange={(e) => onSortChange(e.target.value as SortField)}
          className="appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] text-gray-300 outline-none cursor-pointer hover:border-[#3a3a3a] transition-colors"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <button
        onClick={onOrderToggle}
        className="p-2 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#3a3a3a] transition-colors text-gray-400 hover:text-white"
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
