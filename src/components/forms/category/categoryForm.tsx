'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type EditingCategory = {
  id?: string;
  category_name: string;
  description?: string | null;
};

type CategoryFormProps = {
  show: boolean;
  onClose: () => void;
  editingCategory?: EditingCategory | null;
  refreshCategories?: () => void;
};

export default function CategoryForm({ show, onClose, editingCategory, refreshCategories }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false); // Apple-like save state

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.category_name);
      setDescription(editingCategory.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editingCategory, show]);

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Enter category name');

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
      const payload = {
        business_id: user.business_id,
        category_name: name.trim(),
        description,
      };

      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      let res, data;

      if (editingCategory?.id) {
        // Update category
        res = await fetch(`${baseURL}/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) return toast.error(data.message || 'Failed to update category');
        toast.success(`Category "${name.trim()}" updated successfully!`);
      } else {
        // Create category
        res = await fetch(`${baseURL}/api/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) return toast.error(data.message || 'Failed to create category');
        toast.success(`Category "${name.trim()}" created successfully!`);
      }

      if (refreshCategories) refreshCategories();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while saving the category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition"
            >
              <X size={14} strokeWidth={2} />
            </button>

            <div className="p-4 mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">Provide the details of the category.</p>

              {/* Category Name */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 mb-2"
              />

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 mb-2"
                rows={3}
              />

              {/* Apple-like Save Button */}
              <motion.button
                whileTap={{ scale: 0.97 }} // Apple-like press feedback
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-3 rounded-xl font-medium shadow-md transition 
                ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                {saving
                  ? editingCategory
                    ? 'Updating...'
                    : 'Creating...'
                  : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
