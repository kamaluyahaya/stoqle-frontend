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
} from 'lucide-react';
import { toast } from 'sonner';
import CategoryForm from '@/components/forms/category/categoryForm';
import BarcodeScannerModal from '@/components/product/scannerBarcode';
import SectionCard from '@/components/product/card';
import Toggle from '@/components/product/toggle';
import Input from '@/components/product/input';
import NumberInput from '@/components/product/numberInput';
import Textarea from '@/components/product/textarea';
import { addOfflineProduct, deleteOfflineProduct, findMatchingOfflineProduct, getAllOfflineProducts } from '@/lib/indexedDB';
import NumberInputQty from '@/components/product/inputQty';
import { useParams, useRouter } from 'next/navigation';

type Variant = {
  id: string;
  name: string;
  value: string;
  barcode?: string;
  extraPrice?: number;
  costPrice?: number | undefined;
  quantity?: number;
  lowStockAlert?: number;
};

type StoreItem = {
  id: string;
  name: string;
  isDefault?: boolean;
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

export default function EditProductPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [trackStock, setTrackStock] = useState(false);
  const [allowOversell, setAllowOversell] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [lowStockAlert, setLowStockAlert] = useState<number>(5);
  const [price, setPrice] = useState<number | undefined>();
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [remoteImages, setRemoteImages] = useState<string[]>([]); // existing images from server
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [inventory, setInventory] = useState<Record<string, {
    quantity: number;
    lowStockAlert: number;
    allowOversell: boolean;
  }>>({});
  const [inputQuantities, setInputQuantities] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; category?: string; price?: string; }>({});
  const [loading, setLoading] = useState(true);

  // These track original product flags so we can disable toggles if product originally had them
  const [originalTrackStock, setOriginalTrackStock] = useState(false);
  const [originalHasVariants, setOriginalHasVariants] = useState(false);

  const params = useParams();
  const router = useRouter();
  const productId = (params as any)?.productId as string | undefined; // adjust if param name differs
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const openAddCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);

  const onAddVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        value: '',
        barcode: randomBarcode(),
        extraPrice: 0,
        costPrice: undefined,
        quantity: 0,
        lowStockAlert: 5
      }
    ]);
  };

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

  // Fetch categories and stores
  const fetchCategories = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${baseURL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
      if (data.length > 0 && !category) setCategory(data[0].category_id);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
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
          isDefault: store.is_default,
        }))
      );
    } catch (e) {
      console.error(e);
      toast.error('Error fetching stores');
    }
  };

  // load unsynced count
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

  // initialize inventory when stores ready
  useEffect(() => {
    const initialInventory = stores.reduce((acc, store) => {
      acc[store.id] = { quantity: 0, lowStockAlert: 5, allowOversell: false };
      return acc;
    }, {} as Record<string, { quantity: number; lowStockAlert: number; allowOversell: boolean }>);
    setInventory(initialInventory);
  }, [stores]);

  // fetch product details if editing
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchStores();
      await fetchCategories();

      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseURL}/api/products/product/${productId}`, {
          headers: { Authorization: `Bearer ${JSON.parse(token || 'null')}` },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to fetch product');
        }
        const p = await res.json();

        // Prefill simple fields
        setName(p.name || '');
        setDescription(p.description || '');
        setCategory(p.category_id || (categories[0]?.category_id ?? ''));
        setBarcode(p.barcode || '');
        setPrice(typeof p.price === 'number' ? p.price : (p.price ? Number(p.price) : undefined));
        setCostPrice(p.cost_price ?? undefined);
        setStatus(p.status ?? 'active');
        setHasVariants(Boolean(p.has_variants));
        setVariants(
          (p.variants || []).map((v: any) => ({
            id: v.id ? String(v.id) : crypto.randomUUID(),
            name: v.name ?? '',
            value: v.value ?? '',
            barcode: v.barcode ?? randomBarcode(),
            extraPrice: v.extra_price ?? 0,
            costPrice: v.cost_price ?? undefined,
            quantity: v.quantity ?? 0,
            lowStockAlert: v.low_stock_alert ?? 5,
          }))
        );

        // inventories
        if (Array.isArray(p.inventories)) {
          // ensure inventory object keys exist
          const newInventory = { ...(Object.keys(inventory).length ? inventory : {}) };
          p.inventories.forEach((inv: any) => {
            const sid = String(inv.store_id);
            newInventory[sid] = {
              quantity: Number(inv.quantity || 0),
              lowStockAlert: Number(inv.low_stock_alert ?? 5),
              allowOversell: Boolean(inv.allow_oversell),
            };
            // set inputQuantities for UI
            setInputQuantities(prev => ({ ...prev, [sid]: String(inv.quantity ?? 0) }));
          });
          // for stores not in product inventories keep defaults if exist
          stores.forEach(s => {
            if (!newInventory[s.id]) newInventory[s.id] = { quantity: 0, lowStockAlert: 5, allowOversell: false };
          });
          setInventory(newInventory);
        }

        // original flags (used for disabling)
        setOriginalTrackStock(Boolean(p.track_stock));
        setOriginalHasVariants(Boolean(p.has_variants));

        // show trackStock if original had it OR if the product currently has inventory data
        setTrackStock(Boolean(p.track_stock) || (Array.isArray(p.inventories) && p.inventories.length > 0));

        // Load remote images (so we can display them alongside new uploads)
        if (Array.isArray(p.images)) {
          const mapped = p.images.map((img: any) => {
            if (typeof img === 'string') return img;
            return img.url || img.path || img.src || '';
          }).filter(Boolean);
          setRemoteImages(mapped);
        }

      } catch (err: any) {
        console.error('Failed to load product', err);
        toast.error('Failed to load product for editing.');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // validation handlers
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

  // On submit -> PUT to product endpoint
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
    if (!productId) {
      toast.error('No product selected to update.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('category_id', category);
    formData.append('price', String(price));
    formData.append('status', status);
    if (description.trim()) formData.append('description', description.trim());
    if (barcode.trim()) formData.append('barcode', barcode.trim());
    if (trackStock) formData.append('track_stock', 'true');
    if (allowOversell) formData.append('allow_oversell', 'true');
    if (quantity > 0) formData.append('quantity', String(quantity));
    if (costPrice != null) formData.append('cost_price', String(costPrice));
    if (hasVariants) formData.append('has_variants', 'true');

    const payloadVariants = variants.map(v => ({
      name: v.name || 'default',
      extra_price: v.extraPrice || 0,
      barcode: v.barcode || undefined,
      cost_price: v.costPrice ? Number(v.costPrice) : undefined,
      quantity: v.quantity ? Number(v.quantity) : undefined,
      low_stock_alert: v.lowStockAlert ? Number(v.lowStockAlert) : undefined,
    }));

    if (hasVariants) {
      payloadVariants.forEach((variant, index) => {
        Object.entries(variant).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(`variants[${index}][${key}]`, String(value));
          }
        });
      });
    }

    const inventoryList = Object.entries(inventory).map(([storeId, entry]) => ({
      store_id: storeId,
      quantity: Number(entry.quantity),
      low_stock_alert: Number(entry.lowStockAlert),
      allow_oversell: Boolean(entry.allowOversell)
    }));

    if (trackStock) {
      formData.append('inventories', JSON.stringify(inventoryList));
    }

    images.forEach((file) => formData.append('images', file));

    try {
      setSubmitting(true);
      if (!navigator.onLine) throw new Error('Offline mode');

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You are not authenticated. Please log in.');
        return;
      }

      // PUT to update
      const res = await fetch(`${baseURL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: formData,
      });

      if (!res.ok) {
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
      toast.success(`${data.message || 'Product updated successfully!'} 🎉`, { position: 'top-center' });
      // go back to products
      router.push(`/${(params as any).business || 'default-slug'}/products`);
    } catch (err: any) {
      const isOffline = !navigator.onLine || err?.message === 'Offline mode' || err?.message === 'Failed to fetch';
      if (isOffline) {
        // fallback: save update to offline queue
        const offlineProduct = {
          id: productId,
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
          updated_at: new Date().toISOString(),
        };

        await addOfflineProduct(offlineProduct);
        window.dispatchEvent(new Event("offline-product-added"));
        toast.success('Update saved offline. It will sync when back online.', { position: 'top-center' });
      } else {
        toast.error(`Failed to update product: ${err?.message}`, { position: 'top-center' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // decide whether Track Stock toggle should be disabled:
  // Disable if original product had track_stock OR original product had variants,
  // OR if the user currently enabled hasVariants (we don't want enabling variants to conflict)
  const trackStockDisabled = originalTrackStock || originalHasVariants || hasVariants;

  // If originalTrackStock is true we want to make inventory inputs and variant quantities read-only
  const inventoryInputsDisabled = originalTrackStock;
  const variantsQuantityDisabled = originalTrackStock;

  // UI render (mostly same as your original layout)
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl">
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
            Edit <span className="text-blue-500">Product</span>
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
            {submitting ? 'Saving...' : 'Update'}
          </button>
        </div>
      </motion.div>

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
              onChange={(e) => setCategory(e.target.value)}
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
            className="md:col-span-2"
          />
        </div>
      </SectionCard>

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

              <label
                htmlFor="barcode"
                className="absolute left-10 -top-2.5 bg-white px-1 text-gray-600 text-xs transition-all duration-300
                  rounded-md
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                  peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
              >
                SKU / Barcode
              </label>

              <BarcodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

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
          </div>
        </div>
      </SectionCard>

      {showScanner && (
        <BarcodeScannerModal
          onDetected={(code) => setBarcode(code)}
          onClose={() => setShowScanner(false)}
        />
      )}

      <SectionCard icon={<Hash className="w-5 h-5" />} title="Inventory & Stock">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Track Stock Toggle - disabled when original track_stock or product has variants */}
          <Toggle
            label="Track Stock"
            checked={trackStock}
            onChange={setTrackStock}
            description="Enable to maintain quantity for this product."
            className="md:col-span-3"
            disabled={trackStockDisabled}
          />

          {originalTrackStock && (
            <div className="md:col-span-3 text-sm text-gray-600">Inventory is locked for this product — quantities are read-only.</div>
          )}

          <AnimatePresence>
            {trackStock && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {stores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/50 backdrop-blur-md rounded-2xl p-4 shadow-inner space-y-4 border border-gray-200/60"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-800 text-sm">{store.name}</h3>
                      {store.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <NumberInputQty
                      label="Quantity"
                      value={inputQuantities[store.id] ?? (inventory[store.id]?.quantity?.toString() ?? '')}
                      onChange={(val) => {
                        if (inventoryInputsDisabled) return; // read-only
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
                      disabled={inventoryInputsDisabled}
                    />

                    <NumberInput
                      label="Low Stock Alert"
                      value={inventory[store.id]?.lowStockAlert || 0}
                      onChange={(v) => {
                        if (inventoryInputsDisabled) return;
                        setInventory((prev) => ({
                          ...prev,
                          [store.id]: {
                            ...prev[store.id],
                            lowStockAlert: v ?? 0,
                          },
                        }));
                      }}
                      min={0}
                      disabled={inventoryInputsDisabled}
                    />

                    <Toggle
                      label="Allow Overselling"
                      checked={inventory[store.id]?.allowOversell || false}
                      onChange={(val) => {
                        if (inventoryInputsDisabled) return;
                        setInventory((prev) => ({
                          ...prev,
                          [store.id]: {
                            ...prev[store.id],
                            allowOversell: val,
                          },
                        }));
                      }}
                      description="Customers can continue to buy when out of stock."
                      disabled={inventoryInputsDisabled}
                    />

                    {(inventory[store.id]?.quantity || 0) <=
                      (inventory[store.id]?.lowStockAlert || 0) && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        Stock is at or below threshold.
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      <SectionCard icon={<Layers className="w-5 h-5" />} title="Variants">
        <Toggle
          label="This product has variants (e.g. size, color)"
          checked={hasVariants}
          disabled={trackStockDisabled}
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
                      disabled={originalTrackStock}
                      className={`text-red-500 hover:text-red-600 ${originalTrackStock ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      disabled={variantsQuantityDisabled}
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
                      disabled={variantsQuantityDisabled}
                    />
                  </div>
                </motion.div>
              ))}

              {!originalTrackStock && (
                <button
                  type="button"
                  onClick={onAddVariant}
                  className="flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

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

          {/* Display remote (existing) images first */}
          {remoteImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {remoteImages.map((url, i) => (
                <div key={`remote-${i}`} className="relative rounded-xl overflow-hidden bg-gray-200 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`remote-${i}`} className="object-cover w-full h-full" />
                  <div className="absolute left-2 top-2 px-2 py-0.5 bg-white/80 text-xs rounded">Existing</div>
                </div>
              ))}
            </div>
          )}

          {/* New uploads */}
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
          {submitting ? 'Saving...' : 'Update'}
        </button>
      </div>
    </div>
  );
}
