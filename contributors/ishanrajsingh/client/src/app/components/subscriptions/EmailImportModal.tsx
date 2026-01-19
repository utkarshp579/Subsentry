'use client';

import { Loader2, CheckCircle, XCircle, Mail, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

type ImportState = 'explain' | 'loading' | 'success' | 'error' | 'stopped';

interface Props {
  open: boolean;
  state: ImportState;
  successMessage?: string | null;
  errorMessage?: string | null;
  onConfirm: () => void;
  onStop: () => void;
  onClose: () => void;
}

export default function EmailImportModal({
  open,
  state,
  successMessage,
  errorMessage,
  onConfirm,
  onStop,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-xl bg-[#0f0f0f] border border-white/10 p-6"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                Import from Email
              </h2>
            </div>

            {/* EXPLAIN */}
            {state === 'explain' && (
              <div className="space-y-4 text-sm text-gray-400">
                <p>
                  We will scan your email inbox to detect subscription receipts,
                  renewals, and payment confirmations.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No emails are stored</li>
                  <li>Only subscription-related data is extracted</li>
                  <li>Duplicates are automatically skipped</li>
                  <li>You can edit or delete anything later</li>
                </ul>
              </div>
            )}

            {/* LOADING */}
            {state === 'loading' && (
              <div className="py-6 flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-white">Importing subscriptions…</p>
                <p className="text-sm text-gray-400">
                  Scanning emails & extracting data securely
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {state === 'success' && (
              <div className="py-6 flex flex-col items-center gap-2 text-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <p className="text-green-400 font-medium">
                  Import successful
                </p>
                <p className="text-sm text-gray-400">{successMessage}</p>
              </div>
            )}

            {/* ERROR */}
            {state === 'error' && (
              <div className="py-6 flex flex-col items-center gap-2 text-center">
                <XCircle className="w-8 h-8 text-red-400" />
                <p className="text-red-400 font-medium">Import failed</p>
                <p className="text-sm text-gray-400">{errorMessage}</p>
              </div>
            )}

            {/* STOPPED */}
            {state === 'stopped' && (
              <div className="py-6 text-center text-gray-400">
                Import was stopped by you.
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-6 flex justify-end gap-2">
              {state === 'explain' && (
                <>
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={onConfirm}>Confirm & Proceed</Button>
                </>
              )}

              {state === 'loading' && (
                <Button
                  variant="destructive"
                  onClick={onStop}
                  className="flex gap-2"
                >
                  <StopCircle className="w-4 h-4" />
                  Stop Import
                </Button>
              )}

              {(state === 'success' ||
                state === 'error' ||
                state === 'stopped') && (
                <Button onClick={onClose}>Close</Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
