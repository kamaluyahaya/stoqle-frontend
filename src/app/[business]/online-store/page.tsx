// File: components/VendorDashboard.tsx
// ------------------------------------------------
// The dashboard file that imports the portal dropdown. Drop this into `components/VendorDashboard.tsx`.

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, MoreVertical } from 'lucide-react';
import StoreForm from '@/components/forms/store/storeForm';
import { toast } from 'sonner';
import router from 'next/router';
import ConfirmDialog from '@/components/forms/dialog/dialogForm';
import StoreDropdown from '@/components/storeDropdown';

export interface StoreItem {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  totalProducts: number;
  is_default: boolean;
  inStock: number;
  outOfStock: number;
}

type OrderItem = {
  id: string;
  customer: string;
  total: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
};
type User = {
  full_name: string;
  email: string;
  role: string;
  profile_image: string;
  business_name: string;
  business_slug?: string;
};

const parseBool = (v: any) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<'stores' | 'orders'>('stores');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [menuOpenStoreId, setMenuOpenStoreId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStore, setDeletingStore] = useState<StoreItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized');
      router.push('/login');
      return;
    }
  }, []);

  const requestDeleteStore = (store: StoreItem) => {
    setDeletingStore(store);
    setShowDeleteDialog(true);
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You are not authenticated. Please log in.');
        return;
      }

      const res = await fetch(`${baseURL}/api/stores/me`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || 'Failed to fetch stores');
      }

      if (res.status === 401 || data.message === 'Unauthorized') {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      setStores(
        data.map((store: any) => ({
          id: String(store.store_id),
          name: store.store_name,
          slug: store.store_slug,
          logo_url: store.logo_url ?? null,
          description: store.description ?? '',
          totalProducts: 0,
          inStock: 0,
          outOfStock: 0,
          is_default: parseBool(store.is_default),
        }))
      );
    } catch (e) {
      console.error(e);
      toast.error('Error fetching stores');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStore?.id) return;

    setDeleting(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      if (!token) return toast.error('Authentication token missing.');

      const res = await fetch(`${baseURL}/api/stores/${deletingStore.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        setStores((prev) => prev.filter((store) => store.id !== deletingStore.id));
        toast.success('Store deleted successfully!');
        setShowDeleteDialog(false);
        setDeletingStore(null);
      } else {
        toast.error(result.message || 'Error deleting store');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while deleting store.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditStore = (store: StoreItem) => {
    setEditingStore(store);
    setShowModal(true);
  };

  const handleTabChange = (tab: 'stores' | 'orders') => {
    if (tab === activeTab) return;
    setDirection(activeTab === 'stores' && tab === 'orders' ? 1 : -1);
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchStores();
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setOrders([
      { id: 'o1', customer: 'John Doe', total: 2500, date: '2025-07-25', status: 'Pending' },
      { id: 'o2', customer: 'Jane Smith', total: 4300, date: '2025-07-26', status: 'Completed' },
    ]);
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenStoreId(null);
        setMenuAnchorEl(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variants = {
    enter: (dir: 1 | -1) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir * -40, opacity: 0 }),
  };

  return (
    <div className="space-y-8 p-6 md:p-12 bg-gray-100 min-h-screen rounded-xl">
      <ConfirmDialog
        show={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingStore(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deletingStore?.name}"?`}
        message="This action will permanently remove the store and its associated data."
        confirmText="Delete"
        loading={deleting}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Online <span className="text-blue-500">Catalog</span>
        </h1>
        <span className="text-gray-500 text-sm">{currentDate}</span>
      </motion.div>

      <div className="relative bg-gray-200 rounded-full p-1 w-fit mx-auto mb-8 flex">
        <motion.div
          layout
          className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-white shadow-md"
          animate={{ x: activeTab === 'orders' ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
        <button
          onClick={() => handleTabChange('stores')}
          className={`relative z-10 flex-1 px-6 py-2 rounded-full font-medium text-sm ${
            activeTab === 'stores' ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          Online Stores
        </button>

        <button
          onClick={() => handleTabChange('orders')}
          className={`relative z-10 flex-1 px-6 py-2 rounded-full font-medium text-sm ${
            activeTab === 'orders' ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          Online Orders
        </button>
      </div>

      <div className="relative min-h-[260px]">
        <AnimatePresence mode="wait" custom={direction}>
          {activeTab === 'stores' ? (
            <motion.div
              key="stores"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {stores.map((store, idx) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-lg relative"
                >
                  <div className="absolute top-4 right-4">
                    <div className="relative" ref={menuRef}>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          const btn = e.currentTarget as HTMLElement;
                          if (menuOpenStoreId === store.id) {
                            setMenuOpenStoreId(null);
                            setMenuAnchorEl(null);
                          } else {
                            setMenuOpenStoreId(store.id);
                            setMenuAnchorEl(btn);
                          }
                        }}
                        aria-expanded={menuOpenStoreId === store.id}
                        aria-haspopup="menu"
                      >
                        <MoreVertical size={18} className="text-gray-200" />
                      </button>

                      <StoreDropdown
                        anchorEl={menuAnchorEl}
                        open={menuOpenStoreId === store.id}
                        onClose={() => {
                          setMenuOpenStoreId(null);
                          setMenuAnchorEl(null);
                        }}
                        onEdit={() => {
                          handleEditStore(store);
                          setMenuOpenStoreId(null);
                          setMenuAnchorEl(null);
                        }}
                        onDelete={() => {
                          requestDeleteStore(store);
                          setMenuOpenStoreId(null);
                          setMenuAnchorEl(null);
                        }}
                        isDefault={Boolean(store.is_default)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                    <Store size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    {store.name}
                    {store.is_default && (
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </h3>

                  <p className="text-xs text-gray-400">https://stoqle.com/vendors/{user && user?.business_slug}/{store.slug}</p>
                </motion.div>
              ))}

              <div
                onClick={() => {
                  setEditingStore(null);
                  setShowModal(true);
                }}
                className="flex flex-col items-center justify-center bg-white/50 border-dashed border-2 border-gray-300 rounded-3xl p-6 cursor-pointer hover:bg-gray-100 transition"
              >
                <Plus size={28} className="text-gray-400" />
                <p className="mt-2 text-gray-500 text-sm">Add New Store</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="space-y-4"
            >
              {orders.map((order) => (
                <div key={order.id} className="bg-white/70 backdrop-blur-md rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <p className="font-semibold">₦{order.total}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StoreForm show={showModal} onClose={() => setShowModal(false)} editingStore={editingStore} refreshStores={fetchStores} />
    </div>
  );
}
