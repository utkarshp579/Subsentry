'use client';

import { cn } from '@/lib/utils';
import { Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type FilterStatus = 'all' | 'active' | 'paused' | 'cancelled' | 'trial';
export type FilterBillingCycle = 'all' | 'monthly' | 'yearly' | 'weekly' | 'custom';
export type FilterCategory = 'all' | 'entertainment' | 'music' | 'education' | 'productivity' | 'finance' | 'health' | 'other';

interface FilterBarProps {
  statusFilter: FilterStatus;
  billingCycleFilter: FilterBillingCycle;
  categoryFilter: FilterCategory;
  onStatusChange: (status: FilterStatus) => void;
  onBillingCycleChange: (cycle: FilterBillingCycle) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const statusOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

const billingCycleOptions: { value: FilterBillingCycle; label: string }[] = [
  { value: 'all', label: 'All Cycles' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const categoryOptions: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'music', label: 'Music' },
  { value: 'education', label: 'Education' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
];

const PillFilter = ({
  options,
  value,
  onChange,
  label
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  label: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all',
          value !== 'all'
            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
            : 'bg-[#0f0f0f] border-[#2a2a2a] text-gray-300 hover:border-[#3a3a3a]'
        )}
      >
        {options.find(o => o.value === value)?.label || label}
        <ChevronDown className="w-3 h-3" />
      </motion.button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-48">
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
        {options.map((option) => (
          <DropdownMenuRadioItem key={option.value} value={option.value}>
            {option.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const StatusPills = ({
  statusFilter,
  onStatusChange
}: {
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
}) => (
  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
    {statusOptions.map((option) => (
      <motion.button
        key={option.value}
        onClick={() => onStatusChange(option.value)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'px-3 py-1.5 text-sm rounded-lg transition-all',
          statusFilter === option.value
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-sm'
            : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
        )}
      >
        {option.label === 'All Status' ? 'All' : option.label}
      </motion.button>
    ))}
  </div>
);

export default function FilterBar({
  statusFilter,
  billingCycleFilter,
  categoryFilter,
  onStatusChange,
  onBillingCycleChange,
  onCategoryChange,
  onClearFilters,
  activeFiltersCount,
}: FilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Status Pills - Quick Access */}
        <StatusPills statusFilter={statusFilter} onStatusChange={onStatusChange} />

        {/* Billing Cycle Dropdown */}
        <PillFilter
          options={billingCycleOptions}
          value={billingCycleFilter}
          onChange={(val) => onBillingCycleChange(val as FilterBillingCycle)}
          label="Billing Cycle"
        />

        {/* Category Dropdown */}
        <PillFilter
          options={categoryOptions}
          value={categoryFilter}
          onChange={(val) => onCategoryChange(val as FilterCategory)}
          label="Category"
        />

        {/* Clear Filters */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-1.5 text-gray-400"
              >
                <X className="w-4 h-4" />
                Clear ({activeFiltersCount})
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="flex flex-wrap gap-2 p-3 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a]">
                <PillFilter
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(val) => onStatusChange(val as FilterStatus)}
                  label="Status"
                />
                <PillFilter
                  options={billingCycleOptions}
                  value={billingCycleFilter}
                  onChange={(val) => onBillingCycleChange(val as FilterBillingCycle)}
                  label="Billing"
                />
                <PillFilter
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(val) => onCategoryChange(val as FilterCategory)}
                  label="Category"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
