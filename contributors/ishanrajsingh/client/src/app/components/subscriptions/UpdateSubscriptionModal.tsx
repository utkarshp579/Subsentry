'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  DollarSign,
  Clock,
  Tag,
  Calendar,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Subscription } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getServiceIcon, getServiceColors } from '@/lib/service-icons';
import * as Dialog from '@radix-ui/react-dialog';

interface UpdateSubscriptionModalProps {
  subscriptionData: Subscription | null;
  visible: boolean;
  onDismiss: () => void;
  onUpdate: (id: string, updates: Partial<Subscription>) => Promise<void>;
}

interface SubscriptionForm {
  serviceName: string;
  price: string;
  currencyType: string;
  paymentCycle: string;
  serviceCategory: string;
  nextPaymentDate: Date | undefined;
  isTrialPeriod: boolean;
  trialExpiryDate: Date | undefined;
  subscriptionStatus: string;
  additionalNotes: string;
}

interface ValidationErrors {
  serviceName?: string;
  price?: string;
  paymentCycle?: string;
  serviceCategory?: string;
  nextPaymentDate?: string;
  trialExpiryDate?: string;
}

type OperationState = 'idle' | 'processing' | 'completed' | 'failed';

const CATEGORY_OPTIONS = [
  { value: 'entertainment', label: 'Entertainment', color: 'text-purple-400' },
  { value: 'music', label: 'Music', color: 'text-pink-400' },
  { value: 'education', label: 'Education', color: 'text-blue-400' },
  { value: 'productivity', label: 'Productivity', color: 'text-green-400' },
  { value: 'finance', label: 'Finance', color: 'text-yellow-400' },
  { value: 'health', label: 'Health & Fitness', color: 'text-red-400' },
  { value: 'other', label: 'Other', color: 'text-gray-400' },
];

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const CURRENCY_LIST = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

const INITIAL_FORM_STATE: SubscriptionForm = {
  serviceName: '',
  price: '',
  currencyType: 'USD',
  paymentCycle: '',
  serviceCategory: '',
  nextPaymentDate: undefined,
  isTrialPeriod: false,
  trialExpiryDate: undefined,
  subscriptionStatus: 'active',
  additionalNotes: '',
};

export default function UpdateSubscriptionModal({
  subscriptionData,
  visible,
  onDismiss,
  onUpdate,
}: UpdateSubscriptionModalProps) {
  const [formState, setFormState] = useState<SubscriptionForm>(INITIAL_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [operationState, setOperationState] = useState<OperationState>('idle');
  const [operationMessage, setOperationMessage] = useState('');

  const icon = useMemo(() => getServiceIcon(formState.serviceName), [formState.serviceName]);
  const colors = useMemo(() => getServiceColors(formState.serviceName), [formState.serviceName]);

  // Initialize form with subscription data
  useEffect(() => {
    if (subscriptionData) {
      setFormState({
        serviceName: subscriptionData.name,
        price: subscriptionData.amount.toString(),
        currencyType: subscriptionData.currency,
        paymentCycle: subscriptionData.billingCycle,
        serviceCategory: subscriptionData.category,
        nextPaymentDate: new Date(subscriptionData.renewalDate),
        isTrialPeriod: subscriptionData.isTrial,
        trialExpiryDate: subscriptionData.trialEndsAt ? new Date(subscriptionData.trialEndsAt) : undefined,
        subscriptionStatus: subscriptionData.status,
        additionalNotes: '',
      });
      resetOperationState();
    }
  }, [subscriptionData]);

  const resetOperationState = useCallback(() => {
    setValidationErrors({});
    setOperationState('idle');
    setOperationMessage('');
  }, []);

  const validateFormData = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    if (!formState.serviceName.trim()) {
      errors.serviceName = 'Service name is required';
    }

    const priceValue = parseFloat(formState.price);
    if (!formState.price) {
      errors.price = 'Price is required';
    } else if (isNaN(priceValue) || priceValue <= 0) {
      errors.price = 'Enter a valid positive amount';
    }

    if (!formState.paymentCycle) {
      errors.paymentCycle = 'Billing cycle is required';
    }

    if (!formState.serviceCategory) {
      errors.serviceCategory = 'Category is required';
    }

    if (!formState.nextPaymentDate) {
      errors.nextPaymentDate = 'Next payment date is required';
    }

    if (formState.isTrialPeriod && !formState.trialExpiryDate) {
      errors.trialExpiryDate = 'Trial expiry date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState]);

  const updateField = useCallback(
    (field: keyof SubscriptionForm, value: string | boolean | Date | undefined) => {
      setFormState((prev) => ({ ...prev, [field]: value }));

      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      if (operationState !== 'idle') {
        setOperationState('idle');
      }
    },
    [validationErrors, operationState]
  );

  const processUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateFormData() || !subscriptionData) return;

      setOperationState('processing');
      setOperationMessage('');

      try {
        await onUpdate(subscriptionData._id, {
          name: formState.serviceName.trim(),
          amount: parseFloat(formState.price),
          currency: formState.currencyType,
          billingCycle: formState.paymentCycle as 'monthly' | 'yearly' | 'weekly' | 'custom',
          category: formState.serviceCategory as 'entertainment' | 'music' | 'education' | 'productivity' | 'finance' | 'health' | 'other',
          renewalDate: formState.nextPaymentDate!.toISOString(),
          isTrial: formState.isTrialPeriod,
          trialEndsAt: formState.isTrialPeriod && formState.trialExpiryDate ? formState.trialExpiryDate.toISOString() : undefined,
          status: formState.subscriptionStatus as 'active' | 'paused' | 'cancelled',
        });

        setOperationState('completed');
        setTimeout(() => onDismiss(), 1200);
      } catch (error) {
        setOperationState('failed');
        setOperationMessage(error instanceof Error ? error.message : 'Update operation failed');
      }
    },
    [formState, subscriptionData, validateFormData, onUpdate, onDismiss]
  );

  const closeModal = useCallback(() => {
    if (operationState !== 'processing') {
      onDismiss();
    }
  }, [operationState, onDismiss]);

  const isProcessing = operationState === 'processing';

  return (
    <Dialog.Root open={visible} onOpenChange={(isOpen) => !isOpen && closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-[#0f1318] border border-white/10 rounded-2xl p-6 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex-shrink-0">
                {icon ? (
                  <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', colors?.bg)}>
                    {icon}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold',
                      colors?.bg || 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
                      colors?.text || 'text-white'
                    )}
                  >
                    {formState.serviceName.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Dialog.Title className="text-2xl font-bold text-white">
                  Update Subscription
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 mt-1">
                  Modify your subscription details below
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                  disabled={isProcessing}
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Update Form */}
            <form onSubmit={processUpdate} className="space-y-6">
              {/* Service Name Input */}
              <div className="space-y-2">
                <Label htmlFor="service-name" className="text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Service Name
                </Label>
                <Input
                  id="service-name"
                  value={formState.serviceName}
                  onChange={(e) => updateField('serviceName', e.target.value)}
                  placeholder="e.g., Netflix, Spotify"
                  disabled={isProcessing}
                  className={cn(validationErrors.serviceName && 'border-red-500')}
                />
                {validationErrors.serviceName && (
                  <p className="text-sm text-red-400">{validationErrors.serviceName}</p>
                )}
              </div>

              {/* Price and Currency Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formState.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="0.00"
                    disabled={isProcessing}
                    className={cn(validationErrors.price && 'border-red-500')}
                  />
                  {validationErrors.price && (
                    <p className="text-sm text-red-400">{validationErrors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-white">
                    Currency
                  </Label>
                  <Select
                    value={formState.currencyType}
                    onValueChange={(v) => updateField('currencyType', v)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_LIST.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Billing Cycle and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing-cycle" className="text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Billing Cycle
                  </Label>
                  <Select
                    value={formState.paymentCycle}
                    onValueChange={(v) => updateField('paymentCycle', v)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="billing-cycle">
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLES.map((cycle) => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.paymentCycle && (
                    <p className="text-sm text-red-400">{validationErrors.paymentCycle}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Category
                  </Label>
                  <Select
                    value={formState.serviceCategory}
                    onValueChange={(v) => updateField('serviceCategory', v)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.serviceCategory && (
                    <p className="text-sm text-red-400">{validationErrors.serviceCategory}</p>
                  )}
                </div>
              </div>

              {/* Next Payment Date and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Next Payment
                  </Label>
                  <DatePicker
                    value={formState.nextPaymentDate}
                    onChange={(date: Date | undefined) => updateField('nextPaymentDate', date)}
                    placeholder="Select date"
                    disabled={isProcessing}
                  />
                  {validationErrors.nextPaymentDate && (
                    <p className="text-sm text-red-400">{validationErrors.nextPaymentDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">
                    Status
                  </Label>
                  <Select
                    value={formState.subscriptionStatus}
                    onValueChange={(v) => updateField('subscriptionStatus', v)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trial Period Toggle */}
              <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="trial-toggle" className="text-white flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Trial Period
                    </Label>
                    <p className="text-sm text-gray-400">Is this subscription in trial mode?</p>
                  </div>
                  <Switch
                    id="trial-toggle"
                    checked={formState.isTrialPeriod}
                    onCheckedChange={(checked) => updateField('isTrialPeriod', checked)}
                    disabled={isProcessing}
                  />
                </div>

                <AnimatePresence>
                  {formState.isTrialPeriod && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label className="text-white">
                        Trial Expiry Date
                      </Label>
                      <DatePicker
                        value={formState.trialExpiryDate}
                        onChange={(date: Date | undefined) => updateField('trialExpiryDate', date)}
                        placeholder="When does trial end?"
                        disabled={isProcessing}
                      />
                      {validationErrors.trialExpiryDate && (
                        <p className="text-sm text-red-400">{validationErrors.trialExpiryDate}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Operation Status Messages */}
              <AnimatePresence>
                {operationState === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-semibold text-green-400">Successfully Updated!</p>
                      <p className="text-sm text-green-300">Your subscription has been modified</p>
                    </div>
                  </motion.div>
                )}

                {operationState === 'failed' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-400">Update Failed</p>
                        <p className="text-sm text-red-300 mt-1">{operationMessage}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
                  disabled={isProcessing}
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
