// components/forms/dialog/globalDiscountDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  initialValue: string;           // string numeric value like "0" or "10"
  initialIsPercentage: boolean;
  onApply: (value: string, isPercentage: boolean) => void;
};

export default function GlobalDiscountDialog({
  show,
  onClose,
  initialValue,
  initialIsPercentage,
  onApply,
}: Props) {
  const [value, setValue] = useState(initialValue || '0');
  const [isPercentage, setIsPercentage] = useState(!!initialIsPercentage);

  useEffect(() => {
    if (show) {
      // prefill when opening
      setValue(initialValue ?? '0');
      setIsPercentage(!!initialIsPercentage);
    }
  }, [show, initialValue, initialIsPercentage]);

  const handleApply = () => {
    const num = parseFloat(value || '0');
    if (isNaN(num) || num <= 0) {
      // small client-side validation; you can show toast upstream if desired
      return;
    }
    if (isPercentage && (num <= 0 || num > 100)) return;
    onApply(value, isPercentage);
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
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white backdrop-blur-lg p-6 rounded-3xl w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
            >
              <X size={16} />
            </button>

            <div className="p-1 mt-2">
              <h2 className="text-xl font-semibold mb-2">Global discount</h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter a discount to apply to the whole sale (value or percentage).
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsPercentage(false)}
                  className={`w-1/2 py-2 rounded-xl ${!isPercentage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  ₦ Amount
                </button>
                <button
                  onClick={() => setIsPercentage(true)}
                  className={`w-1/2 py-2 rounded-xl ${isPercentage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  % Percentage
                </button>
              </div>

              <input
                type="number"
                min={0}
                step={isPercentage ? '0.01' : '0.01'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={isPercentage ? 'Enter % (1 - 100)' : 'Enter amount in ₦'}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 mb-4"
              />

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
