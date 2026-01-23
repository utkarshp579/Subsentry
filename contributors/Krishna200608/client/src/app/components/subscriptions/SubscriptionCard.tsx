'use client';

import { Subscription } from '@/lib/api';
import {
  cn,
  formatCurrency,
  formatDate,
  getDaysUntilRenewal,
  isUrgentRenewal,
  getCategoryColor,
  getStatusColor,
  getBillingCycleLabel,
  getSourceIcon,
} from '@/lib/utils';
import { getServiceIcon, getServiceColors } from '@/lib/service-icons';
import {
  Calendar,
  AlertTriangle,
  MoreVertical,
  ExternalLink,
  Pause,
  Trash2,
  Edit,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SubscriptionCardProps {
  subscription: Subscription;
  view?: 'grid' | 'list';
  index?: number;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
}

export default function SubscriptionCard({
  subscription,
  view = 'grid',
  index = 0,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const daysUntil = getDaysUntilRenewal(subscription.renewalDate);
  const isUrgent = isUrgentRenewal(subscription.renewalDate);
  const categoryColors = getCategoryColor(subscription.category);

  // Trial Logic
  const isTrial = subscription.isTrial;
  const isTrialEndingSoon = isTrial && daysUntil <= 3 && daysUntil >= 0;

  // Get service-specific icon and colors
  const serviceIcon = getServiceIcon(subscription.name);
  const serviceColors = getServiceColors(subscription.name);

  const initials = subscription.name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Use service colors if available, otherwise fall back to category colors
  const iconBg = serviceColors?.bg || categoryColors.bg;
  const iconText = serviceColors?.text || categoryColors.text;

  const getRenewalText = () => {
    if (daysUntil < 0) return isTrial ? 'Trial Expired' : 'Overdue';
    if (daysUntil === 0) return isTrial ? 'Trial Ends Today' : 'Today';
    if (daysUntil === 1) return isTrial ? 'Trial Ends Tomorrow' : 'Tomorrow';
    return isTrial ? `${daysUntil} days left` : `${daysUntil} days`;
  };

  const borderColor = isTrialEndingSoon
    ? 'border-amber-500/50 hover:border-amber-500'
    : isUrgent
      ? 'border-red-500/30 hover:border-red-500/50'
      : 'border-[#1a1a1a] hover:border-[#2a2a2a]';

  const glowStyles = isTrialEndingSoon
    ? 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]'
    : '';

  if (view === 'list') {
    return (
      <TooltipProvider>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.01, x: 4 }}
          className={cn(
            'group flex items-center gap-4 p-4 bg-[#0f0f0f] rounded-xl border transition-all duration-200 hover:bg-[#141414]',
            borderColor,
            glowStyles
          )}
        >
          {/* Icon/Logo */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
              iconBg,
              iconText
            )}
          >
            {serviceIcon || initials}
          </motion.div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{subscription.name}</h3>
              {isTrial ? (
                <Badge variant={isTrialEndingSoon ? "warning" : "secondary"} className="text-[10px] uppercase tracking-wider font-bold h-5">
                  Free Trial
                </Badge>
              ) : null}
              <span className="text-xs text-gray-500">{getSourceIcon(subscription.source)}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className={cn(categoryColors.bg, categoryColors.text, 'border-0')}>
                {subscription.category}
              </Badge>
              <span className="text-xs text-gray-500 capitalize">
                {isTrial ? 'Trial Period' : getBillingCycleLabel(subscription.billingCycle)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right hidden sm:block">
            <div className="font-semibold text-white">
              {formatCurrency(subscription.amount, subscription.currency)}
            </div>
            <div className="text-xs text-gray-500">
              {isTrial ? 'after trial' : `/${subscription.billingCycle === 'yearly' ? 'year' : subscription.billingCycle === 'weekly' ? 'week' : 'month'}`}
            </div>
          </div>

          {/* Renewal Date */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                'text-right hidden md:block cursor-help min-w-[100px]',
                isTrialEndingSoon ? 'text-amber-400' : isUrgent ? 'text-red-400' : 'text-gray-400'
              )}>
                <div className="flex items-center gap-1.5 justify-end">
                  {isTrialEndingSoon ? <Clock className="w-3.5 h-3.5 animate-pulse" /> : isUrgent && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
                  <span className="text-sm font-medium">{getRenewalText()}</span>
                </div>
                <div className="text-xs text-gray-500">{formatDate(subscription.renewalDate)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isTrial ? 'Trial ends on:' : 'Next billing:'} {formatDate(subscription.renewalDate)}</p>
            </TooltipContent>
          </Tooltip>

          {/* Status Badge */}
          <Badge
            variant={
              isTrial ? 'secondary' :
                subscription.status === 'active' ? 'success' :
                  subscription.status === 'cancelled' ? 'destructive' : 'secondary'
            }
            className={cn(
              "hidden lg:flex capitalize",
              isTrial && "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            )}
          >
            {isTrial ? 'Trial Active' : subscription.status}
          </Badge>

          {/* Actions with Radix Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(subscription)}>
                <Edit className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Pause className="w-4 h-4" /> Pause
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <ExternalLink className="w-4 h-4" /> Visit Site
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-red-400 focus:text-red-400"
                onClick={() => onDelete?.(subscription)}
              >
                <Trash2 className="w-4 h-4" /> Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </TooltipProvider>
    );
  }

  // Grid View
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className={cn(
          'group relative p-5 bg-[#0f0f0f] rounded-xl border transition-all duration-200 hover:shadow-xl hover:shadow-black/30',
          borderColor,
          glowStyles
        )}
      >
        {/* Spotlight effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Urgent Banner */}
        {isTrialEndingSoon && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute -top-px left-4 right-4 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-b-full origin-left shadow-[0_2px_10px_rgba(245,158,11,0.5)]"
          />
        )}
        {!isTrialEndingSoon && isUrgent && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute -top-px left-4 right-4 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-b-full origin-left"
          />
        )}

        {/* Header */}
        <div className="relative flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg',
              iconBg,
              iconText
            )}
          >
            {serviceIcon || initials}
          </motion.div>

          <div className="flex items-center gap-2">
            {isTrial ? (
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize border-blue-500/20 text-blue-400 bg-blue-500/10",
                  isTrialEndingSoon && "animate-pulse border-amber-500/30 text-amber-400 bg-amber-500/10"
                )}
              >
                Trial
              </Badge>
            ) : (
              <Badge
                variant={subscription.status === 'active' ? 'success' : subscription.status === 'cancelled' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {subscription.status}
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(subscription)}>
                  <Edit className="w-4 h-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Pause className="w-4 h-4" /> Pause
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <ExternalLink className="w-4 h-4" /> Visit Site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-400 focus:text-red-400"
                  onClick={() => onDelete?.(subscription)}
                >
                  <Trash2 className="w-4 h-4" /> Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{subscription.name}</h3>
            {isTrial && <Badge variant="warning" className="text-[10px] h-4 px-1 py-0">FREE TRIAL</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn(categoryColors.bg, categoryColors.text, 'border-0')}>
              {subscription.category}
            </Badge>
            <span className="text-xs text-gray-500">{getSourceIcon(subscription.source)}</span>
          </div>
        </div>

        {/* Price */}
        <div className="relative mb-4">
          <motion.div
            className="text-2xl font-bold text-white flex items-baseline gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.2 }}
          >
            {formatCurrency(subscription.amount, subscription.currency)}
            {isTrial && <span className="text-xs font-normal text-gray-400">/mo</span>}
          </motion.div>
          <div className="text-sm text-gray-500">
            {isTrial ? 'Starts after trial' : getBillingCycleLabel(subscription.billingCycle)}
          </div>
        </div>

        {/* Renewal */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'relative flex items-center justify-between pt-4 border-t border-[#1a1a1a] cursor-help',
              isTrialEndingSoon ? 'text-amber-400 font-medium' : isUrgent ? 'text-red-400' : 'text-gray-400'
            )}>
              <div className="flex items-center gap-2">
                {isTrialEndingSoon ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : isUrgent ? (
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {getRenewalText()}
                </span>
              </div>
              <span className="text-xs opacity-80">{formatDate(subscription.renewalDate)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isTrial ? 'Trial ends on:' : 'Next billing date:'} {formatDate(subscription.renewalDate)}</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}

