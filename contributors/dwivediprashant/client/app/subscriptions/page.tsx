"use client";

import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import SubscriptionCard from "../components/SubscriptionCard";
import FilterControls from "../components/FilterControls";
import EmptyState from "../components/EmptyState";
import Loader from "../utils/Loader";
import Modal from "../components/Modal";
import SubscriptionForm from "../components/SubscriptionForm";
import EditSubscriptionForm from "../components/EditSubscriptionForm";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

export interface SubscriptionData {
  _id: string;
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
  notes?: string;
}

export interface FilterConfiguration {
  statusFilter: string;
  cycleFilter: string;
  categoryFilter: string;
  sortBy: "renewalDate" | "cost" | "serviceCategory";
  sortOrder: "asc" | "desc";
}

export default function Subscriptions() {
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionData[]>(
    [],
  );
  const [loadingState, setLoadingState] = useState(true);
  const [filterConfig, setFilterConfig] = useState<FilterConfiguration>({
    statusFilter: "all",
    cycleFilter: "all",
    categoryFilter: "all",
    sortBy: "renewalDate",
    sortOrder: "asc",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<SubscriptionData | null>(null);
  const [deletingSubscription, setDeletingSubscription] =
    useState<SubscriptionData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchSubscriptionData(); // Refresh the list
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingSubscription(null);
    fetchSubscriptionData(); // Refresh the list
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingSubscription(null);
  };

  const handleEdit = (subscription: SubscriptionData) => {
    setEditingSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleDelete = (subscription: SubscriptionData) => {
    setDeletingSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubscription) return;

    try {
      const response = await fetch(
        `/api/subscriptions/${deletingSubscription._id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      setIsDeleteDialogOpen(false);
      setDeleteSuccess(true);
      setDeletingSubscription(null);
      fetchSubscriptionData(); // Refresh the list

      // Hide success message after 2 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      // You could add error handling here (show toast, etc.)
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeletingSubscription(null);
  };

  const getFilteredAndSortedSubscriptions = () => {
    let filtered = subscriptionList.filter((subscription) => {
      const statusMatch =
        filterConfig.statusFilter === "all" ||
        subscription.serviceStatus === filterConfig.statusFilter;
      const cycleMatch =
        filterConfig.cycleFilter === "all" ||
        subscription.billingInterval === filterConfig.cycleFilter;
      const categoryMatch =
        filterConfig.categoryFilter === "all" ||
        subscription.serviceCategory === filterConfig.categoryFilter;
      return statusMatch && cycleMatch && categoryMatch;
    });

    return filtered.sort((a, b) => {
      const { sortBy, sortOrder } = filterConfig;
      if (sortBy === "renewalDate") {
        const dateA = new Date(a.upcomingRenewal).getTime();
        const dateB = new Date(b.upcomingRenewal).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "serviceCategory") {
        const catA = a.serviceCategory.toLowerCase();
        const catB = b.serviceCategory.toLowerCase();
        if (catA < catB) return sortOrder === "asc" ? -1 : 1;
        if (catA > catB) return sortOrder === "asc" ? 1 : -1;
        return 0;
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
      {/* Delete Success Message */}
      {deleteSuccess && (
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
            Subscription deleted successfully!
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">
              Subscription Management
            </h1>
            <p className="text-[#B3B3B3]">
              Monitor and manage all your active subscriptions
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Subscription
          </button>
        </div>
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Subscription"
      >
        <SubscriptionForm onSuccess={handleFormSuccess} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditCancel}
        title="Edit Subscription"
      >
        {editingSubscription && (
          <EditSubscriptionForm
            subscription={editingSubscription}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        subscription={deletingSubscription!}
        isOpen={isDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </AppLayout>
  );
}
