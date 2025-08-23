'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Hash,
  Barcode as BarcodeIcon,
  Layers,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  ArrowLeft,
  StoreIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import CategoryForm from '@/components/forms/category/categoryForm';
import BarcodeScannerModal from '@/components/product/scannerBarcode';
import router from 'next/router';
import SectionCard from '@/components/product/card';
import Toggle from '@/components/product/toggle';
import Input from '@/components/product/input';
import NumberInput from '@/components/product/numberInput';
import Textarea from '@/components/product/textarea';
import { addOfflineProduct, deleteOfflineProduct, findMatchingOfflineProduct, getAllOfflineProducts } from '@/lib/indexedDB';
import NumberInputQty from '@/components/product/inputQty';
import { useParams, useRouter } from 'next/navigation';
import StoreForm from '@/components/forms/store/storeForm';



type Variant = {
  id: string;
  name: string;
  value: string;
  barcode?: string;
  extraPrice?: number;   // <— new
  costPrice?: number;
  quantity?: number;
  lowStockAlert?: number;
};



type StoreItem = {
  id: string;
  name: string;
  is_default?: boolean;
};

type Category = {
  category_id: string;
  category_name: string;
  description?: string | null;
};

function randomBarcode(len = 12) {
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export default function AddProductPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const [trackStock, setTrackStock] = useState(false);
  const [allowOversell, setAllowOversell] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [lowStockAlert, setLowStockAlert] = useState<number>(5);

  const [price, setPrice] = useState<number | undefined>();
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  const [submitting, setSubmitting] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const openAddCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);
  {/* Inside your component */}
const [showScanner, setShowScanner] = useState(false);
const [pendingSync, setPendingSync] = useState(0);


const onAddVariant = () => {
  setVariants(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      name: '',
      value: '',
      barcode: randomBarcode(),
      extraPrice: 0,             // start at zero modifier
      costPrice: undefined,
      quantity: 0,
      lowStockAlert: 5
    }
  ]);
};


   const fetchCategories = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) setCategory(data[0].category_id); // Preselect first category
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };
  

  const baseURL = process.env.NEXT_PUBLIC_API_URL;

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

      // Check for unauthorized status
          if (res.status === 401 || data.message === 'Unauthorized') {
            localStorage.removeItem('token'); // clear token
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login'; // redirect to login
            return;
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
    }
  };
  

  useEffect(() => {
  fetchStores();
    fetchCategories();
    setSelectedStore('1');
  }, []);

  const onRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const removeImage = (file: File) => {
    setImages((prev) => prev.filter((f) => f !== file));
  };

  const [inventory, setInventory] = useState<Record<string, {
  quantity: number;
  lowStockAlert: number;
  allowOversell: boolean;
}>>({});

useEffect(() => {
  const updatePendingSync = async () => {
    const products = await getAllOfflineProducts();
    setPendingSync(products.length);
  };

  updatePendingSync();

  const listener = () => updatePendingSync();
  window.addEventListener("offline-product-added", listener);

  return () => window.removeEventListener("offline-product-added", listener);
}, []);

useEffect(() => {
  const initialInventory = stores.reduce((acc, store) => {
    acc[store.id] = { quantity: 0, lowStockAlert: 5, allowOversell: false };
    return acc;
  }, {} as Record<string, { quantity: number; lowStockAlert: number; allowOversell: boolean }>);
  setInventory(initialInventory);
}, [stores]);

   const [name, setName] = useState('');
  // const [price, setPrice] = useState<number | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    category?: string;
    price?: string;
  }>({});

  // real-time field handlers
  
// PRODUCT NAME: at least 2 non‑whitespace characters
const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setName(val);
  setErrors((prev) => ({
    ...prev,
    name:
      !val.trim()
        ? 'Product name is required'
        : val.trim().length < 2
        ? 'Product name must be at least 2 characters'
        : undefined,
  }));
};

// PRICE: must be > 0
const handlePriceChange = (val: number | undefined) => {
  setPrice(val);
  setErrors((prev) => ({
    ...prev,
    price:
      val === undefined
        ? 'Selling price is required'
        : val <= 0
        ? 'Selling price must be greater than zero'
        : undefined,
  }));
};

const [inputQuantities, setInputQuantities] = useState<Record<string, string>>({});

  const router = useRouter();
  const params = useParams(); // this returns a record of route segments

  const businessSlug = params?.business as string ?? 'default-slug'; // or use fallback logic

  // onSubmit still does a final check
const onSubmit = async () => {
  if (!name.trim()) {
    toast.error('Product name is required', { position: 'top-center' });
    return;
  }

  if (!category) {
    toast.error('Product category is required', { position: 'top-center' });
    return;
  }

  if (price === undefined || price <= 0) {
    toast.error('Price must be greater than 0', { position: 'top-center' });
    return;
  }

  const formData = new FormData();
  formData.append('name', name.trim());
  formData.append('category_id', category);
  formData.append('price', String(price));
  formData.append('status', status);

  if (description.trim())      formData.append('description', description.trim());
  if (barcode.trim())          formData.append('barcode', barcode.trim());
  if (trackStock)              formData.append('track_stock', 'true');
  if (allowOversell)           formData.append('allow_oversell', 'true');
  if (quantity > 0)            formData.append('quantity', String(quantity));
  if (costPrice != null)       formData.append('cost_price', String(costPrice));
  if (hasVariants)             formData.append('has_variants', 'true');

// ✅ Variants payload transformation
const payloadVariants = variants.map(v => ({
  name: v.name || "default",
  extra_price: v.extraPrice || 0,
  barcode: v.barcode || undefined,
  cost_price: v.costPrice ? Number(v.costPrice) : undefined,
  quantity: v.quantity ? Number(v.quantity) : undefined,
  low_stock_alert: v.lowStockAlert ? Number(v.lowStockAlert) : undefined,
}));

// ✅ Append variants properly if hasVariants is true
if (hasVariants) {
  payloadVariants.forEach((variant, index) => {
    Object.entries(variant).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(`variants[${index}][${key}]`, String(value));
      }
    });
  });
}


  // ✅ Inventories
  const inventoryList = Object.entries(inventory).map(([storeId, entry]) => ({
    store_id: storeId,
    quantity: Number(entry.quantity),
    low_stock_alert: Number(entry.lowStockAlert),
    allow_oversell: Boolean(entry.allowOversell)
  }));

  if(trackStock){
  formData.append('inventories', JSON.stringify(inventoryList));
  }

  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  // ✅ Images
  images.forEach((file) => formData.append('images', file));

 try {
  setSubmitting(true);

  if (!navigator.onLine) throw new Error('Offline mode');

  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('You are not authenticated. Please log in.');
    return;
  }

  const res = await fetch('http://localhost:4000/api/products/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JSON.parse(token)}`,
    },
    body: formData,
  });

  if (!res.ok) {
    // Try to parse error as JSON
    let errorMessage = 'An error occurred';
    try {
      const errorData = await res.json();
      errorMessage = errorData?.message || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();

  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  toast.success(`${data.message || 'Product created successfully!'} 🎉`, {
    position: 'top-center',
  });

  router.push(`/${businessSlug}/products`);
  
} catch (err: any) {
  console.warn('Error:', err?.message);

  const isOffline = !navigator.onLine || err?.message === 'Offline mode' || err?.message === 'Failed to fetch';

  if (isOffline) {
    console.warn('Falling back to offline mode...');

    const offlineProduct = {
      name: name.trim(),
      category_id: category,
      price,
      description,
      barcode,
      track_stock: trackStock || false,
      allow_oversell: allowOversell || false,
      quantity: quantity || 0,
      low_stock_alert: lowStockAlert || 0,
      cost_price: costPrice || 0,
      has_variants: hasVariants,
      status,
      images,
      variants: hasVariants ? payloadVariants : [],
      inventories: inventoryList,
      created_at: new Date().toISOString(),
    };

    await addOfflineProduct(offlineProduct);
    window.dispatchEvent(new Event("offline-product-added"));
  } else if (err?.message === 'Product name already exists in this category and price') {
    // 🧹 Cleanup duplicate from offline
    const duplicate = await findMatchingOfflineProduct({
      name: name.trim(),
      category_id: category,
      price,
    });

    if (duplicate) {
      await deleteOfflineProduct(duplicate.id);
      toast.info('Duplicate offline product automatically removed', {
        position: 'top-center',
      });
    }

    toast.error(`Product already exists: ${err.message}`, {
      position: 'top-center',
    });
  } else {
    toast.error(`Failed to create product: ${err.message}`, {
      position: 'top-center',
    });
  }

} finally {
  setSubmitting(false);  
}

};


  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl">
      {/* Header */}
     <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Add <span className="text-blue-500">Product</span>
        </h1>
      </div>

      {pendingSync > 0 && (
        <span className="text-yellow-600 font-medium">
          ({pendingSync}) unsynced product(s)
        </span>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setStatus('draft');
            onSubmit();
          }}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition duration-300 shadow-sm border ${
            status === 'draft'
              ? 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
              : 'bg-gray-900 text-white hover:bg-gray-800 border-transparent'
          }`}
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={Boolean(errors.name || errors.category || errors.price)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : 'Publish'}
        </button>
      </div>
    </motion.div>

      {/* Basic Info */}
      {/* Category Modal */}
            <CategoryForm
              show={showCategoryModal}
              onClose={closeCategoryModal}
              refreshCategories={fetchCategories}
            />
      <SectionCard icon={<Package className="w-5 h-5" />} title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            
          <Input
            label="Product Name"
            placeholder="e.g. iPhone 15 Pro Max 256GB"
            value={name}
            onChange={handleNameChange}
          />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          <div className="relative w-full">
            <select
              id="outlined-select"
              className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
                bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
                transition-all duration-300 placeholder-transparent
                focus:border-blue-500 focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)} // Ensure single selected value
            >
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>


            <label
              htmlFor="outlined-select"
              className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-xs transition-all duration-200
                peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
            >
              Choose category
            </label>

            {/* + Add Category Button */}
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="absolute right-3 -top-5 text-blue-500 text-xs hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Add category
            </button>

           {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}

            
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the product…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2  "
          />
        </div>
      </SectionCard>

      {/* Pricing */}
{/* Pricing Section */}
<SectionCard icon={<span className="text-lg font-semibold">₦</span>} title="Pricing & Tax">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    <div>
      <NumberInput
      label="Selling Price"
      value={price}
      onChange={handlePriceChange}
      min={0}
    />
    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
    </div>

    <NumberInput
      label="Cost Price (Optional)"
      value={costPrice}
      onChange={setCostPrice}
      min={0}
    />

    <div className="w-full">
  <div className="relative w-full">
    <input
      type="text"
      id="barcode"
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
      placeholder=" "
      className={`peer w-full rounded-xl pl-10 pr-24 pt-4 pb-2 text-gray-900 text-sm
         bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
            transition-all duration-300 placeholder-transparent
            focus:border-blue-500 focus:outline-none
       `}
    />

    {/* Label */}
    <label
      htmlFor="barcode"
      className="absolute left-10 -top-2.5 bg-white px-1 text-gray-600 text-xs transition-all duration-300
        rounded-md
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
        peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
    >
      SKU / Barcode
    </label>

    {/* Barcode Icon */}
    <BarcodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

    {/* Buttons */}
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
      <button
        type="button"
        onClick={() => setBarcode(randomBarcode())}
        className="text-[11px] font-medium text-blue-600 hover:underline"
      >
        Generate
      </button>
      <button
        type="button"
        onClick={() => setShowScanner(true)}
        className="text-[11px] font-medium text-green-600 hover:underline"
      >
        Scan
      </button>
    </div>
  </div>

  {/* {error && <p className="text-red-500 text-xs mt-1">{error}</p>} */}
</div>

  </div>

 
</SectionCard>

      {/* Barcode Scanner Modal */}
{showScanner && (
  <BarcodeScannerModal
    onDetected={(code) => setBarcode(code)}
    onClose={() => setShowScanner(false)}
  />
)}
<StoreForm
        show={showModal}
        onClose={() => setShowModal(false)}
        // editingStore={editingStore}
        refreshStores={fetchStores}
      />
    {/* Inventory */}
<SectionCard icon={<Hash className="w-5 h-5" />} title="Inventory & Stock">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* Track Stock Toggle */}
    <Toggle
      label="Track Stock"
      checked={trackStock}
      onChange={setTrackStock}
      description="Enable to maintain quantity for this product."
      className="md:col-span-3"
    />
{/* Store Form */}
      
    <AnimatePresence>
      {trackStock && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-3"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          {stores.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center p-6 bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-inner space-y-4">
              <StoreIcon className="w-10 h-10 text-gray-400" />
              <p className="text-gray-600 text-sm">
                No stores available. You need to add a store before tracking inventory.
              </p>
              <button
               onClick={() => {
                  // setEditingStore(null);
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-900 transition-all"
              >
                + Add Store
              </button>
            </div>
          ) : (
            stores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/50 backdrop-blur-md rounded-2xl p-4 shadow-inner space-y-4 border border-gray-200/60"
              >
                {/* Store Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 text-sm">{store.name}</h3>
                  {store.is_default && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                      Default
                    </span>
                  )}
                </div>

                {/* Quantity */}
                <NumberInputQty
                  label="Quantity"
                  value={inputQuantities[store.id] ?? (inventory[store.id]?.quantity?.toString() ?? '')}
                  onChange={(val) => {
                    setInputQuantities((prev) => ({
                      ...prev,
                      [store.id]: val ?? '',
                    }));

                    const parsed = Number(val);
                    if (!isNaN(parsed) && val !== '') {
                      setInventory((prev) => ({
                        ...prev,
                        [store.id]: {
                          ...prev[store.id],
                          quantity: parsed,
                        },
                      }));
                    }
                  }}
                  min={0}
                />

                {/* Low Stock Alert */}
                <NumberInput
                  label="Low Stock Alert"
                  value={inventory[store.id]?.lowStockAlert || 0}
                  onChange={(v) =>
                    setInventory((prev) => ({
                      ...prev,
                      [store.id]: {
                        ...prev[store.id],
                        lowStockAlert: v ?? 0,
                      },
                    }))
                  }
                  min={0}
                />

                {/* Allow Oversell */}
                <Toggle
                  label="Allow Overselling"
                  checked={inventory[store.id]?.allowOversell || false}
                  onChange={(val) =>
                    setInventory((prev) => ({
                      ...prev,
                      [store.id]: {
                        ...prev[store.id],
                        allowOversell: val,
                      },
                    }))
                  }
                  description="Customers can continue to buy when out of stock."
                />

                {/* Warning */}
                {(inventory[store.id]?.quantity || 0) <=
                  (inventory[store.id]?.lowStockAlert || 0) && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    Stock is at or below threshold.
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</SectionCard>



      {/* Variants */}
      <SectionCard icon={<Layers className="w-5 h-5" />} title="Variants">
        <Toggle
          label="This product has variants (e.g. size, color)"
          checked={hasVariants}
          onChange={(v) => {
            setHasVariants(v);
            if (v && variants.length === 0) onAddVariant();
          }}
        />

        <AnimatePresence>
          {hasVariants && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4 space-y-4"
            >
              {variants.map((variant, idx) => (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-800">Variant #{idx + 1}</p>
                    <button
                      type="button"
                      onClick={() => onRemoveVariant(variant.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Option Name"
                      placeholder="e.g. Color, Size"
                      value={variant.name}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, name: e.target.value } : v))
                        )
                      }
                    />
                     <NumberInput
                        label="Additional Price (₦)"
                        value={variant.extraPrice}
                        onChange={(val) =>
                          setVariants(prev =>
                            prev.map(v =>
                              v.id === variant.id ? { ...v, extraPrice: val ?? 0 } : v
                            )
                          )
                        }
                        min={0}
                      />

                      {/* optional per‑variant cost price */}
                      <NumberInput
                        label="Cost Price (Optional)"
                        value={variant.costPrice}
                        onChange={(val) =>
                          setVariants(prev =>
                            prev.map(v =>
                              v.id === variant.id ? { ...v, costPrice: val } : v
                            )
                          )
                        }
                        min={0}
                      />
                   
                    <Input
                      label="SKU/Barcode"
                      value={variant.barcode || ''}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, barcode: e.target.value } : v))
                        )
                      }
                      leftIcon={<BarcodeIcon className="w-4 h-4 text-gray-400" />}
                      rightAddon={
                        <button
                          type="button"
                          className="text-xs font-medium text-blue-600 hover:underline"
                          onClick={() =>
                            setVariants((prev) =>
                              prev.map((v) =>
                                v.id === variant.id ? { ...v, barcode: randomBarcode() } : v
                              )
                            )
                          }
                        >
                          Generate
                        </button>
                      }
                    />
                    <NumberInput
                      label="Quantity"
                      value={variant.quantity}
                      onChange={(val) =>
                        setVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, quantity: val } : v))
                        )
                      }
                      min={0}
                    />
                    <NumberInput
                      label="Low Stock Alert"
                      value={variant.lowStockAlert}
                      onChange={(val) =>
                        setVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, lowStockAlert: val } : v))
                        )
                      }
                      min={0}
                    />
                  </div>
                </motion.div>
              ))}

              <button
                type="button"
                onClick={onAddVariant}
                className="flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-800 transition"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Media */}
      <SectionCard icon={<ImageIcon className="w-5 h-5" />} title="Media">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="images"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-center hover:border-gray-400 cursor-pointer"
          >
            <Upload className="w-6 h-6 text-gray-500" />
            <span className="text-sm text-gray-600">
              Click to upload or drag & drop (PNG, JPG)
            </span>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImages(e.target.files)}
            />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, i) => {
                const url = URL.createObjectURL(img);
                return (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden bg-gray-200 aspect-square"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`image-${i}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute top-2 right-2 rounded-full bg-white/80 p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionCard>
      <div className="flex gap-3">
          <button
  type="button"
  onClick={() => {
    setStatus('draft');
    onSubmit();
  }}
  className={`px-5 py-2 rounded-xl text-sm font-semibold transition duration-300 shadow-sm border ${
    status === 'draft'
      ? 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
      : 'bg-gray-900 text-white hover:bg-gray-800 border-transparent'
  }`}
>
  Save as Draft
</button>


          <button
            type="button"
                onClick={onSubmit}
                disabled={Boolean(errors.name || errors.category || errors.price)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Publish'}
          </button>
        </div>
    </div>
  );
}