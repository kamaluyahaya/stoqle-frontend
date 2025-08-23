// components/forms/dialog/customerDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import Input from '../inputs/input';

interface Customer {
  user_id?: string | number;
  customer_name: string;
  email?: string;
  phone?: string;
  address?: string;
}

type Props = {
  show: boolean;
  onClose: () => void;
  editingCustomer?: Customer | null;
  refreshCustomers: () => void;
};

export default function CustomerForm({
  show,
  onClose,
  editingCustomer,
  refreshCustomers
}: Props) {
  const [customer_name, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
//   const [user_id, setail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);


const [user_id, setUserId] = useState<string | number | undefined>(undefined);

  const isEditing = Boolean(user_id);
useEffect(() => {
  if (show) {
    setUserId(editingCustomer?.user_id); // ✅ store the actual ID
    setCustomerName(editingCustomer?.customer_name || '');
    setEmail(editingCustomer?.email || '');
    setPhone(editingCustomer?.phone || '');
    setAddress(editingCustomer?.address || '');
    setSaving(false);
  }
}, [show, editingCustomer]);

  const handleSave = async () => {
    if (!customer_name.trim()) {
      toast.error('Customer name is required', {  position: 'top-center',});
      return;
    }

    try {
      setSaving(true);
      const token = JSON.parse(localStorage.getItem('token') || 'null');

      const payload = {
        customer_name: customer_name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };

const url = isEditing
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${user_id}` // ✅ use local state
  : `${process.env.NEXT_PUBLIC_API_URL}/api/customers`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {


        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save customer');

      toast.success(isEditing ? 'Customer updated successfully' : 'Customer created successfully', {  position: 'top-center',});
      refreshCustomers();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving customer', {  position: 'top-center',});
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-3xl w-full max-w-md shadow-lg relative"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-semibold mb-2">
              {isEditing ? 'Edit customer' : 'Add new customer'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isEditing
                ? 'Update the customer details below.'
                : 'Create a customer record to attach to this sale (optional).'}
            </p>

            <div className="space-y-3">
                <Input
                            label="Full Name"
                            placeholder="e.g. iPhone 15 Pro Max 256GB"
                           value={customer_name}
                           onChange={(e) => setCustomerName(e.target.value)}
                          />
              {/* <input
                value={customer_name}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300"
              /> */}

                    <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email (optional)"
                          />
                          
                          <Input
                             value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label="Phone (optional)"
                          />
                          
                          <Input
                            value={address}
                onChange={(e) => setAddress(e.target.value)}
                label="Address (optional)"
                          />
                          
                         
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
