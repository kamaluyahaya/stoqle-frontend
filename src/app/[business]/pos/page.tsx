'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

type StoreItem = {
  id: string;
  name: string;
  isDefault?: boolean;
  totalProducts: number;
  inStock: number;
  outOfStock: number;
};
type User = {
  full_name: string;
  email: string;
  role: string;
  profile_image: string;
  business_name: string;
  business_slug?: string; // <— add this
};


export default function POSPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const params = useParams(); // this returns a record of route segments
  const businessSlug = params?.business as string ?? 'default-slug'; // or use fallback logic

useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setCurrentDate(new Date().toLocaleDateString());

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/business/${parsedUser.business_id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stores');
        return res.json();
      })
      .then((data: StoreItem[]) => {
  const mainStore: StoreItem = {
    id: 'main',
    name: 'Main Store (All Products)',
    isDefault: true,
    totalProducts: data.reduce((sum, s) => sum + s.totalProducts, 0),
    inStock: data.reduce((sum, s) => sum + s.inStock, 0),
    outOfStock: data.reduce((sum, s) => sum + s.outOfStock, 0),
  };

  const filteredStores = data.filter(s => !s.isDefault); // remove default from API
  setStores([mainStore, ...filteredStores]);
})
      .catch((error) => {
        console.error('Error fetching store data:', error);
      });
  }
}, []);



const handleStoreSelect = (store: StoreItem) => {
  if (store.id === 'main') {
    // Navigate to a special POS page that fetches all products
    router.push(`/${businessSlug}/pos/sales/all-products`);
  } else {
    router.push(`/${businessSlug}/pos/sales/${store.id}`);
  }
};

  return (
    <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100  min-h-screen rounded-xl">
      {/* Topbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
          Point of Sale <span className="text-blue-500">Stores</span>
        </h1>
        <span className="text-gray-500 text-sm">{currentDate}</span>
      </motion.div>

      {/* Business Name (Default Store) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/70 backdrop-blur-md rounded-3xl p-6 flex items-center justify-between "
      >
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl text-gray-900 tracking-tight font-[SF Pro Text]">
            {user && user?.business_name}
        </h2>
          <p className="text-gray-600 text-sm">Main Store (Default)</p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 shadow-inner">
          <Store size={28} strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Stores List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {stores.map((store, index) => (
  <motion.div
    key={store.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 * index, duration: 0.5 }}
    onClick={() => handleStoreSelect(store)}
    className="group cursor-pointer bg-white/60 backdrop-blur-md rounded-3xl shadow-lg p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1"
  >
    <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-gray-200 group-hover:to-gray-300 transition">
      <Store size={28} strokeWidth={1.5} />
    </div>

    <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate w-full">
      {store.name}
    </h3>

    {store.isDefault && (
      <span className="mt-2 text-xs font-medium text-green-600 bg-green-100 rounded-full px-3 py-0.5">
        Default Store
      </span>
    )}

    <div className="mt-3 text-sm text-gray-600 space-y-1">
      {/* <p className="font-medium text-gray-800">
        Total Products: <span className="text-gray-900">{store.totalProducts}</span>
      </p> */}

      {/* Only show stock counts for non-default stores */}
      {!store.isDefault && (
        <>
          <p className="text-green-600">In Stock: {store.inStock}</p>
          <p className="text-red-600">Out of Stock: {store.outOfStock}</p>
        </>
      )}
    </div>
  </motion.div>
))}

    </motion.div>
    </div>
  );
}
