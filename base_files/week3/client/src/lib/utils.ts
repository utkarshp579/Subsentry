import { clsx, type ClassValue } from 'clsx';
import { Pencil, Mail, Download, ClipboardList } from 'lucide-react';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntilRenewal(renewalDate: string | Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(renewalDate);
  renewal.setHours(0, 0, 0, 0);
  const diffTime = renewal.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isUrgentRenewal(renewalDate: string | Date): boolean {
  const daysUntil = getDaysUntilRenewal(renewalDate);
  return daysUntil >= 0 && daysUntil <= 3;
}

export function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    entertainment: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    music: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
    education: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    productivity: { bg: 'bg-green-500/20', text: 'text-green-400' },
    finance: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    health: { bg: 'bg-red-500/20', text: 'text-red-400' },
    other: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  };
  return colors[category] || colors.other;
}

export function getStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    paused: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
  };
  return colors[status] || colors.active;
}

export function getBillingCycleLabel(cycle: string): string {
  const labels: Record<string, string> = {
    monthly: 'Monthly',
    yearly: 'Yearly',
    weekly: 'Weekly',
    custom: 'Custom',
  };
  return labels[cycle] || cycle;
}

export function getSourceIcon(source: string): React.ReactNode {
  const iconClass = 'w-3.5 h-3.5 text-gray-500';
  const icons: Record<string, React.ReactNode> = {
    manual: React.createElement(Pencil, { className: iconClass }),
    gmail: React.createElement(Mail, { className: iconClass }),
    imported: React.createElement(Download, { className: iconClass }),
  };
  return icons[source] || React.createElement(ClipboardList, { className: iconClass });
}
