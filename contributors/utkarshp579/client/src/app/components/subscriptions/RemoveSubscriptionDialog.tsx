'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Subscription } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getServiceIcon, getServiceColors } from '@/lib/service-icons';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface RemoveSubscriptionDialogProps {
  subscriptionData: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (subscriptionId: string) => Promise<void>;
}

export default function RemoveSubscriptionDialog({
  subscriptionData,
  open,
  onOpenChange,
  onRemove,
}: RemoveSubscriptionDialogProps) {
  const [removing, setRemoving] = useState(false);
  const [removalError, setRemovalError] = useState('');

  const icon = subscriptionData ? getServiceIcon(subscriptionData.name) : null;
  const colors = subscriptionData ? getServiceColors(subscriptionData.name) : null;

  const executeRemoval = useCallback(async () => {
    if (!subscriptionData) return;

    setRemoving(true);
    setRemovalError('');

    try {
      await onRemove(subscriptionData._id);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove subscription';
      setRemovalError(message);
    } finally {
      setRemoving(false);
    }
  }, [subscriptionData, onRemove, onOpenChange]);

  const dismissDialog = useCallback(() => {
    if (!removing) {
      setRemovalError('');
      onOpenChange(false);
    }
  }, [removing, onOpenChange]);

  if (!subscriptionData) return null;

  return (
    <AlertDialog.Root open={open} onOpenChange={(isOpen) => !isOpen && dismissDialog()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />
        </AlertDialog.Overlay>
        {/* ✅ REMOVED asChild FROM HERE */}
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 focus:outline-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-rose-500/30 rounded-3xl blur-2xl" />
              
              {/* Dialog Content */}
              <div className="relative bg-[#0f1318]/95 backdrop-blur-xl border border-red-500/20 rounded-3xl shadow-2xl overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.1),transparent_50%)]" />
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Warning Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring', duration: 0.6 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Title */}
                  <AlertDialog.Title className="text-center mb-3 text-2xl font-bold text-white">
                    Remove Subscription?
                    </AlertDialog.Title>

                  {/* Description */}
                  <AlertDialog.Description className="text-center text-gray-400 mb-6">
                    This action cannot be undone. The subscription will be permanently deleted from your account.
                  </AlertDialog.Description>

                  {/* Subscription Preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
                      <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          {icon ? (
                            <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shadow-lg', colors?.bg)}>
                              {icon}
                            </div>
                          ) : (
                            <div
                              className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg',
                                colors?.bg || 'bg-gradient-to-br from-gray-500/30 to-gray-600/30',
                                colors?.text || 'text-white'
                              )}
                            >
                              {subscriptionData.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-white truncate">
                              {subscriptionData.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {formatCurrency(subscriptionData.amount, subscriptionData.currency)} /{' '}
                              {subscriptionData.billingCycle}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Error Display */}
                  <AnimatePresence>
                    {removalError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-400">Error removing subscription</p>
                              <p className="text-sm text-red-400/70 mt-1">{removalError}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <AlertDialog.Cancel asChild>
                      <button
                        className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        disabled={removing}
                      >
                        Cancel
                      </button>
                    </AlertDialog.Cancel>
                    
                    <button
                      className="flex-1 h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-red-500/20 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      disabled={removing}
                      onClick={executeRemoval}
                      type="button"
                    >
                      {removing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Forever</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
