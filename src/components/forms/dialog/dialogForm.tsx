'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type ConfirmDialogProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  loading?: boolean;
};

export default function ConfirmDialog({
  show,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  loading,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white backdrop-blur-lg p-6 rounded-3xl w-full max-w-sm shadow-xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition"
            >
              <X size={14} strokeWidth={2} />
            </button>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-2">{message}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                disabled={loading}
                className={`w-full py-2 rounded-xl text-white font-medium shadow-md transition ${
                  loading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {loading ? 'Logging out...' : confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
