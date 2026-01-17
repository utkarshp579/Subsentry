'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import {
  SubscriptionCard,
  FilterBar,
  SortDropdown,
  ViewToggle,
  EmptyState,
  QuickStats,
  FilterStatus,
  FilterBillingCycle,
  FilterCategory,
  SortField,
  SortOrder,
} from '../components/subscriptions';
import { Subscription, getSubscriptions } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/aceternity';

export default function SubscriptionsPage() {
  const { getToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [billingCycleFilter, setBillingCycleFilter] = useState<FilterBillingCycle>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');

  // Sort state
  const [sortField, setSortField] = useState<SortField>('renewalDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Fetch subscriptions from real API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) {
          setError('Authentication required');
          return;
        }
        const data = await getSubscriptions(token);
        setSubscriptions(data.subscriptions || []);
      } catch (err) {
        setError('Failed to load subscriptions. Make sure the server is running.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [getToken]);

  // Calculate active filters count
  const activeFiltersCount = [
    statusFilter !== 'all',
    billingCycleFilter !== 'all',
    categoryFilter !== 'all',
  ].filter(Boolean).length;

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // Apply filters
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (billingCycleFilter !== 'all') {
      result = result.filter(s => s.billingCycle === billingCycleFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter(s => s.category === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'renewalDate':
          comparison = new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [subscriptions, statusFilter, billingCycleFilter, categoryFilter, sortField, sortOrder]);

  const clearFilters = () => {
    setStatusFilter('all');
    setBillingCycleFilter('all');
    setCategoryFilter('all');
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const data = await getSubscriptions(token);
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError('Failed to refresh subscriptions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Subscriptions" subtitle="Manage all your recurring payments">
      {/* Quick Stats */}
      {!isLoading && subscriptions.length > 0 && (
        <div className="mb-6">
          <QuickStats subscriptions={subscriptions} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <FilterBar
          statusFilter={statusFilter}
          billingCycleFilter={billingCycleFilter}
          categoryFilter={categoryFilter}
          onStatusChange={setStatusFilter}
          onBillingCycleChange={setBillingCycleFilter}
          onCategoryChange={setCategoryFilter}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <div className="flex items-center gap-3">
          <SortDropdown
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={setSortField}
            onOrderToggle={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
          />

          <ViewToggle view={view} onViewChange={setView} />

          <Button
            variant="secondary"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>

          <Link href="/subscriptions/new">
            <ShimmerButton className="flex items-center gap-2 px-4 py-2.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-gray-400">Loading your subscriptions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredAndSortedSubscriptions.length === 0 ? (
        subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400 mb-4">No subscriptions match your filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4 text-sm text-gray-500">
            Showing {filteredAndSortedSubscriptions.length} of {subscriptions.length} subscriptions
          </div>

          {/* Subscription Grid/List */}
          <motion.div 
            layout
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedSubscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={subscription._id}
                  subscription={subscription}
                  view={view}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </DashboardLayout>
  );
}
