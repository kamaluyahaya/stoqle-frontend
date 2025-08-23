// components/forms/dialog/paymentMethodDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Payment = {
  id?: string | number;
  method: 'cash' | 'bank_transfer' | 'card';
  amount: number;
  reference?: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onApply: (p: Payment) => void;
  defaultAmount?: number; // suggested amount (remaining)
};

export default function PaymentMethodDialog({ show, onClose, onApply, defaultAmount = 0 }: Props) {
  const [method, setMethod] = useState<Payment['method']>('cash');
  const [amount, setAmount] = useState<string>(defaultAmount ? String(defaultAmount) : '');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (show) {
      setMethod('cash');
      setAmount(defaultAmount ? String(defaultAmount) : '');
      setReference('');
    }
  }, [show, defaultAmount]);

  const handleApply = () => {
    const n = parseFloat(amount || '0');
    if (isNaN(n) || n <= 0) return;
    // simple validation: if bank_transfer or card require reference
    if ((method === 'bank_transfer' || method === 'card') && reference.trim().length < 3) {
      // minimal guidance; you can show toast upstream
      return;
    }
    onApply({ id: Date.now(), method, amount: n, reference: reference || null });
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl relative"
            initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white">
              <X size={16} />
            </button>

            <h3 className="text-lg font-semibold mb-2">Add payment</h3>
            <p className="text-sm text-gray-500 mb-4">Add one payment line. You can split the bill across multiple methods.</p>

            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 p-2 flex items-center gap-2">
                <select value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])}
                  className="flex-1 bg-transparent px-3 py-2 rounded-lg text-sm">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="card">ATM card</option>
                </select>
              </div>

              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₦)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300"
              />

              {(method === 'bank_transfer' || method === 'card') && (
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={method === 'bank_transfer' ? 'Bank tx ref' : 'Card last 4 / auth ref'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300"
                />
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100">Cancel</button>
              <button onClick={handleApply} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Add payment</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
