// components/forms/dialog/storeSelectDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Store } from 'lucide-react';
import { toast } from 'sonner';

interface StoreType {
  id: string;
  name: string;
}

type Props = {
  show: boolean;
  onClose: () => void;
  onSelect: (store: StoreType) => void;
};

export default function StoreSelectDialog({ show, onClose, onSelect }: Props) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchStores();
    }
  }, [show]);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You are not authenticated. Please log in.');
        return;
      }

      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/me`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Failed to fetch stores');
      }

      setStores(
        data.map((store: any) => ({
          id: String(store.store_id),
          name: store.store_name,
        }))
      );
    } catch (e) {
      console.error(e);
      toast.error('Error fetching stores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center  justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/95 p-6 rounded-3xl w-full max-w-md shadow-lg  relative"
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

            <h2 className="text-xl font-semibold mb-2">Select a Store</h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a store where you want to add/remove your product.
            </p>

            <div className="space-y-2 max-h-64 overflow-auto">
              {loading && <p className="text-gray-500 text-center py-4">Loading...</p>}
              {!loading && stores.length === 0 && (
                <p className="text-gray-500 text-center py-4">No stores found.</p>
              )}
              {!loading &&
                stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onSelect(store);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <Store size={18} className="text-blue-500" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{store.name}</span>
                    </div>
                  </button>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
