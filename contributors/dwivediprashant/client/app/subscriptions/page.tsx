"use client";

import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import SubscriptionCard from "../components/SubscriptionCard";
import FilterControls from "../components/FilterControls";
import EmptyState from "../components/EmptyState";
import Loader from "../utils/Loader";

export interface SubscriptionData {
  identifier: string;
  serviceName: string;
  cost: number;
  billingInterval: "monthly" | "yearly" | "weekly";
  serviceCategory: string;
  upcomingRenewal: string;
  trialPeriod: boolean;
  trialEndDate?: string;
  integrationSource: string;
  serviceStatus: "active" | "cancelled" | "expired" | "trial";
  logoUrl: string;
}

export interface FilterConfiguration {
  statusFilter: string;
  cycleFilter: string;
  sortBy: "renewalDate" | "cost";
  sortOrder: "asc" | "desc";
}

export default function Subscriptions() {
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionData[]>(
    []
  );
  const [loadingState, setLoadingState] = useState(true);
  const [filterConfig, setFilterConfig] = useState<FilterConfiguration>({
    statusFilter: "all",
    cycleFilter: "all",
    sortBy: "renewalDate",
    sortOrder: "asc",
  });

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoadingState(true);
      const response = await fetch("/api/subscriptions");
      const data = await response.json();

      // Add minimum 1 second loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubscriptionList(data);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoadingState(false);
    }
  };

  const getFilteredAndSortedSubscriptions = () => {
    let filtered = subscriptionList.filter((subscription) => {
      const statusMatch =
        filterConfig.statusFilter === "all" ||
        subscription.serviceStatus === filterConfig.statusFilter;
      const cycleMatch =
        filterConfig.cycleFilter === "all" ||
        subscription.billingInterval === filterConfig.cycleFilter;
      return statusMatch && cycleMatch;
    });

    return filtered.sort((a, b) => {
      const { sortBy, sortOrder } = filterConfig;

      if (sortBy === "renewalDate") {
        const dateA = new Date(a.upcomingRenewal).getTime();
        const dateB = new Date(b.upcomingRenewal).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc" ? a.cost - b.cost : b.cost - a.cost;
      }
    });
  };

  const isUrgentRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return renewal <= threeDaysFromNow;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="bg-[#34C759] text-[#FFFFFF] px-2 py-1 rounded-md text-xs font-medium">
            Active
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-[#FF3B3B] text-[#FFFFFF] px-2 py-1 rounded-md text-xs font-medium">
            Cancelled
          </div>
        );
      case "expired":
        return (
          <div className="bg-[#FFC107] text-[#FFFFFF] px-2 py-1 rounded-md text-xs font-medium">
            Expired
          </div>
        );
      case "trial":
        return (
          <div className="bg-[#3B82F6] text-[#FFFFFF] px-2 py-1 rounded-md text-xs font-medium">
            Trial
          </div>
        );
      default:
        return null;
    }
  };

  const processedSubscriptions = getFilteredAndSortedSubscriptions();

  return (
    <AppLayout activePage="Subscriptions">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">
          Subscription Management
        </h1>
        <p className="text-[#B3B3B3]">
          Monitor and manage all your active subscriptions
        </p>
      </div>

      <FilterControls
        filterConfig={filterConfig}
        onFilterChange={setFilterConfig}
        totalCount={subscriptionList.length}
        filteredCount={processedSubscriptions.length}
      />

      {loadingState ? (
        <Loader />
      ) : processedSubscriptions.length === 0 ? (
        <EmptyState type="subscriptions" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {processedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.identifier}
              subscription={subscription}
              isUrgent={isUrgentRenewal(subscription.upcomingRenewal)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
