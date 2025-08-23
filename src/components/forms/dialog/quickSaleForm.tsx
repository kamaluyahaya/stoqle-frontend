// components/forms/dialog/QuickSaleDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

type QuickSaleDialogProps = {
  show: boolean;
  onClose: () => void;
  onCharge: (amount: number) => void;
};

export default function QuickSaleDialog({ show, onClose, onCharge }: QuickSaleDialogProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (show) setInputValue('');
  }, [show]);

  const formatAmount = (val: string) => {
    // format with commas
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleNumber = (num: string) => {
    if (inputValue === '0' && num === '0') return;
    if (inputValue === '0' && num !== '.') setInputValue(num);
    else setInputValue(prev => prev + num);
  };

  const handleClear = () => setInputValue('');
  const handleDelete = () => setInputValue(prev => prev.slice(0, -1));

  const handleConfirm = () => {
    const amount = parseFloat(inputValue);
    if (!isNaN(amount) && amount > 0) {
      onCharge(amount);
      onClose();
    }
  };

  const keypad = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['.','0','⌫'],
  ];

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

            {/* Display */}
            <div className="mb-6 text-center">
              <span className="text-4xl font-mono text-gray-900">
                ₦{formatAmount(inputValue || '0.00')}
              </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4">
              {keypad.flat().map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === '⌫') handleDelete();
                    else handleNumber(key);
                  }}
                  className="py-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-xl font-medium"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleConfirm}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
              >
                Charge ₦{inputValue || '0'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
