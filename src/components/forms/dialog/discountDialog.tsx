// components/forms/dialog/discountDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type DiscountDialogProps = {
  show: boolean;
  onClose: () => void;
  productName?: string;
  initialValue?: number;          // new
  initialIsPercentage?: boolean;  // new
  onApply: (value: number, isPercentage: boolean) => void;
  onClear: () => void;            // new
};

export default function DiscountDialog({
  show,
  onClose,
  productName,
  initialValue = 0,
  initialIsPercentage = false,
  onApply,
  onClear,
}: DiscountDialogProps) {
  const [discountValue, setDiscountValue] = useState('');
  const [isPercentage, setIsPercentage] = useState(initialIsPercentage);

  // when dialog opens, prefill existing discount
  useEffect(() => {
    if (show) {
      setIsPercentage(initialIsPercentage);
      setDiscountValue(initialValue > 0 ? initialValue.toString() : '');
    }
  }, [show, initialValue, initialIsPercentage]);

  const handleApply = () => {
    const num = parseFloat(discountValue);
    if (isNaN(num) || num <= 0) return;
    onApply(num, isPercentage);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white backdrop-blur-lg p-6 rounded-3xl w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
            >
              <X size={16} />
            </button>

            <div className="p-4 mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Apply Discount
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter discount for <strong>{productName}</strong>
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsPercentage(false)}
                  className={`w-1/2 py-2 rounded-xl ${
                    !isPercentage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  ₦ Amount
                </button>
                <button
                  onClick={() => setIsPercentage(true)}
                  className={`w-1/2 py-2 rounded-xl ${
                    isPercentage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  % Percentage
                </button>
              </div>

              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={isPercentage ? 'Enter % discount' : 'Enter ₦ discount'}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 mb-1"
              />

              {/* Clear link */}
              {initialValue > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs text-red-500 hover:underline mb-4"
                >
                  Clear discount
                </button>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Apply
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
