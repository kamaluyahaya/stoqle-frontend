'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type EditingStore = {
  id?: string;
  name: string;
  description?: string | null;   // <- allow null
  logo_url?: string | null;      // <- allow null
};

type StoreFormProps = {
  show: boolean;
  onClose: () => void;
  editingStore?: EditingStore | null;  // <- accept null
  refreshStores?: () => void;
};

export default function StoreForm({ show, onClose, editingStore, refreshStores }: StoreFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingStore) {
      setName(editingStore.name);
      setDescription(editingStore.description || '');
      setPreview(editingStore.logo_url || null);
    } else {
      setName('');
      setDescription('');
      setLogo(null);
      setPreview(null);
    }
  }, [editingStore, show]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!name) return toast.error('Enter store name');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = storedToken ? JSON.parse(storedToken) : null;

    if (!user || !token) {
      toast.error('You are not authenticated. Please log in.');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('business_id', String(user.business_id));
      formData.append('store_name', name);
      formData.append('description', description);
      if (logo) formData.append('logo', logo);

      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      let res, data;

      if (editingStore?.id) {
        // Update store
        res = await fetch(`${baseURL}/api/stores/${editingStore.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        data = await res.json();
        if (!res.ok) return toast.error(data.message || 'Failed to update store');
        toast.success(`Store "${data.store_slug}" updated successfully!`);
      } else {
        // Create store
        res = await fetch(`${baseURL}/api/stores`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        data = await res.json();
        if (!res.ok) return toast.error(data.message || 'Failed to create store');
        toast.success(`Store "${data.store_slug}" created successfully!`);
      }

      if (refreshStores) refreshStores();
      setSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while saving the store.');
    }
  };

  const finalPreview =
  preview ??
  (editingStore?.logo_url
    ? editingStore.logo_url.startsWith('http')
      ? editingStore.logo_url
      : `${process.env.NEXT_PUBLIC_API_URL}${editingStore.logo_url}`
    : null);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl w-full max-w-lg shadow-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition"
            >
              <X size={14} strokeWidth={2} />
            </button>

            <div className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {editingStore ? 'Edit Store' : 'Create New Store'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">Provide the details of your online store.</p>

              {/* Logo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border border-gray-300 shadow-inner bg-gray-100 flex items-center justify-center hover:border-blue-400 transition">
                 {finalPreview ? (
                        <img src={finalPreview} alt="Logo Preview" crossOrigin ="anonymous" className="w-full h-full object-cover" />
                        ) : (
                        <UploadCloud className="text-gray-400" size={30} />
                        )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-1">Click to upload</p>
              </div>

              {/* Store Name */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter store name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 mb-2"
              />

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Store description (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 mb-2"
                rows={3}
              />

              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-md transition"
              >
                {editingStore ? 'Update Store' : 'Create Store'}
                 {saving
                  ? editingStore
                    ? 'Updating...'
                    : 'Creating...'
                  : editingStore
                  ? 'Update store'
                  : 'Create store'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
