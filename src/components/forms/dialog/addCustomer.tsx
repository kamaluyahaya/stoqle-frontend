// components/forms/dialog/addCustomerDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  onCreate: (customer: { id: number | string; name: string; email?: string; phone?: string }) => void;
  suggestedName?: string;
};

export default function AddCustomerDialog({ show, onClose, onCreate, suggestedName = '' }: Props) {
  const [name, setName] = useState(suggestedName);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setName(suggestedName);
      setEmail('');
      setPhone('');
      setSaving(false);
    }
  }, [show, suggestedName]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return; // you can show toast upstream
    setSaving(true);

    // For now, create a temporary id (front-end). Backend should return real id.
    const newCustomer = { id: Date.now(), name: trimmed, email: email.trim() || undefined, phone: phone.trim() || undefined };

    // Simulate instant success (replace with API call when ready)
    onCreate(newCustomer);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white/95 p-6 rounded-3xl w-full max-w-md shadow-lg relative"
            initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white">
              <X size={16} />
            </button>

            <h2 className="text-xl font-semibold mb-2">Add new customer</h2>
            <p className="text-sm text-gray-500 mb-4">Create a customer record to attach to this sale (optional).</p>

            <div className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300" />

              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300" />

              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
