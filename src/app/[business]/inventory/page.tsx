'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import InventoryTransferPanel from '@/components/inventory/inventoryTransfer';
import ConfirmDialog from '@/components/forms/dialog/dialogForm';
import ProductDetailsDialog from '@/components/forms/dialog/inventory/dialogProductDetails';
import StoreSelectDialog from '@/components/forms/dialog/inventory/selectStore';
import { Category, Product, ProductDetails, StoreInfo } from '@/components/types/product';
import { formatCustomDate } from '@/components/dateFormatting/formattingDate';
import InventoryTabs from '@/components/inventory/inventoryTabs';
import { normalizeId } from '@/lib/inventoryUtils';
import StockAdjustmentPanel from '@/components/inventory/inventoryStockAdjustment';
import AllProductsView from '@/components/inventory/allProduct';
import StockLabelPage from '@/components/inventory/inventoryLabel';

export default function InventoryPage() {
  // --- main state (moved here) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // tabs & selection state
  const [activeTab, setActiveTab] = useState<string>('all-products');

  // store & stock adjustment flow states
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [storeSelectionStep, setStoreSelectionStep] = useState<1 | 2>(1);
  const [selectedForStore, setSelectedForStore] = useState<Record<string, boolean>>({});
  const [adjustments, setAdjustments] = useState<Record<string, { qty: number | '', reason: string }>>({});
  const [selectedAction, setSelectedAction] = useState<Record<string, 'addition' | 'subtraction'>>({});
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [inventoryMode, setInventoryMode] = useState<'addition' | 'subtraction' | null>(null);
  const [triggeredProductId, setTriggeredProductId] = useState<string | null>(null);

  // adjustments history
  const [adjustmentsHistory, setAdjustmentsHistory] = useState<any[]>([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // product details / delete
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const params = useParams();
  const businessSlug = (params?.business as string) ?? 'default-slug';

  // small refs for tab indicator if needed
  const containerRef = useRef<HTMLDivElement | null>(null);

  // derived sets
  const productsTrackable = useMemo(
    () => products.filter(p => p.raw?.track_stock === 1),
    [products]
  );

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const sku = (p.barcode || '').toLowerCase();
      const category = (categories.find(c => c.category_id === p.category_id)?.category_name ?? '').toLowerCase();
      const matchesSearch = name.includes(term) || sku.includes(term) || category.includes(term);
      return matchesSearch;
    });
  }, [products, categories, searchTerm]);

  // --------------- helpers & APIs (kept mostly same) -----------------
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/inventory/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 401 || data.message === 'Unauthorized') {
        localStorage.removeItem('token'); 
        toast.error('Session expired. Please log in again.',{ position: 'top-center' });
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');

      const mapped: Product[] = (data || []).map((p: any) => {
        const raw = { ...(p.raw ?? {}), track_stock: p.raw?.track_stock ?? p.track_stock ?? 0 };
        return {
          product_id: p.product_id,
          barcode: p.barcode ?? null,
          name: p.name ?? null,
          category_id: raw?.category_id ?? null,
          price: raw?.price ?? null,
          currentStock: Number(p.currentStock ?? 0),
          stores: Array.isArray(p.stores) ? p.stores : [],
          last_updated: p.last_updated ?? raw?.updated_at ?? null,
          image: p.image ?? null,
          raw,
          status: raw?.status ?? null,
        } as Product;
      });

      setProducts(mapped);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading products',{ position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading categories',{ position: 'top-center' });
    }
  };

  const fetchAdjustmentsHistory = async () => {
    setLoadingAdjustments(true);
    setHistoryError(null);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/adjustments/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch adjustments history');
      setAdjustmentsHistory(Array.isArray(data) ? data.reverse() : []);
    } catch (err: any) {
      console.error(err);
      setHistoryError(err.message || 'Failed to load adjustments history');
      setAdjustmentsHistory([]);
    } finally {
      setLoadingAdjustments(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // when opening stock-adjustment tab
  useEffect(() => {
    if (activeTab === 'stock-adjustment') {
      const anySelectedProducts = Object.values(selectedForStore).some(Boolean);
      if (!selectedStore && !anySelectedProducts && storeSelectionStep === 1) {
        fetchAdjustmentsHistory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------------- handlers that child components can call ----------------
  const openProductDetails = (product: Product) => {
    const details: ProductDetails = {
      product_id: product.product_id ?? 0,
      name: product.name ?? '',
      totalQuantity: product.currentStock ?? 0,
      costPrice: String(product.raw?.cost_price ?? '0.00'),
      salePrice: String(product.raw?.price ?? '0.00'),
      category: String(product.raw?.category_name ?? 'Unknown'),
      lastUpdated: product.last_updated ?? '',
      sku: product.barcode ?? '',
      stores: product.stores?.map(s => ({
        store_id: s.store_id,
        store: s.store_name ?? '',
        store_name: s.store_name ?? '',
        qty: s.quantity,
        reorderLevel: s.low_stock_alert,
      })) ?? [],
    };

    setSelectedProduct(details);
    setShowProductDialog(true);
  };

  const handleAddStore = (product: Product) => {
    const id = normalizeId(product.product_id);
    setTriggeredProductId(id);
    setSelectedAction(prev => ({ ...prev, [id]: 'addition' }));
    setInventoryMode('addition');
    setShowStoreDialog(true);
  };

  const handleRemoveStore = (product: Product) => {
    const id = normalizeId(product.product_id);
    setTriggeredProductId(id);
    setSelectedAction(prev => ({ ...prev, [id]: 'subtraction' }));
    setInventoryMode('subtraction');
    setShowStoreDialog(true);
  };

  // pass these to StockAdjustmentPanel which will handle UI + submit
  const onStoreSelected = (store: any) => {
    setSelectedStore(store);
    setShowStoreDialog(false);
    setActiveTab('stock-adjustment');
    setStoreSelectionStep(1);

    if (triggeredProductId) {
      setSelectedForStore(prev => ({ ...prev, [triggeredProductId]: true }));
      setAdjustments(prev => ({ ...prev, [triggeredProductId]: { qty: '', reason: '' } }));
      setSelectedAction(prev => ({ ...prev, [triggeredProductId]: prev[triggeredProductId] ?? inventoryMode ?? 'addition' }));
      setTriggeredProductId(null);
    }
  };

  // delete product handler (kept same behavior)
  const handleDeleteProduct = async () => {
    if (!deletingProduct?.product_id) return;
    try {
      setDeleting(true);
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${deletingProduct.product_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');

      toast.success(`\"${deletingProduct.name}\" deleted successfully`, { position: 'top-center' });
      setProducts(prev => prev.filter(p => p.product_id !== deletingProduct.product_id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete product',{ position: 'top-center' });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    }
  };

  // --- Render ---
  return (
    <>
      <ProductDetailsDialog
        show={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        product={selectedProduct ?? {
          product_id: 0,
          name: "-",
          totalQuantity: 0,
          costPrice: "-",
          salePrice: "-",
          category: "-",
          lastUpdated: "-",
          sku: "-",
          stores: [],
        }}
      />

      <StoreSelectDialog
        show={showStoreDialog}
        onClose={() => setShowStoreDialog(false)}
        onSelect={onStoreSelected}
      />

      <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100 min-h-screen rounded-xl">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 px-4 sm:px-0">
          Inventory <span className="text-blue-500">Control</span>
        </h1>

        <InventoryTabs
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            // reset selection for a fresh state when switching tabs
            setSelectedForStore({});
            setAdjustments({});
            setSelectedStore(null);
            setInventoryMode(null);
          }}
          containerRef={containerRef}
        />

        {activeTab === 'stock-adjustment' && (
          <StockAdjustmentPanel
            inventoryMode={inventoryMode}
            setInventoryMode={setInventoryMode}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            storeSelectionStep={storeSelectionStep}
            setStoreSelectionStep={setStoreSelectionStep}
            products={products}
            productsTrackable={productsTrackable}
            selectedForStore={selectedForStore}
            setSelectedForStore={setSelectedForStore}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            fetchProducts={fetchProducts}
            fetchAdjustmentsHistory={fetchAdjustmentsHistory}
            adjustmentsHistory={adjustmentsHistory}
            loadingAdjustments={loadingAdjustments}
            historyError={historyError}
            setShowStoreDialog={setShowStoreDialog}
            setTriggeredProductId={setTriggeredProductId}

            // NEW: fully reset parent state and go back to All Products
            onCancel={() => {
              // clear child-selected and parent-held vars
              setSelectedForStore({});
              setAdjustments({});
              setSelectedAction({});
              setSelectedStore(null);
              setInventoryMode(null);
              setStoreSelectionStep(1);
              // switch back to all-products
              setActiveTab('all-products');
            }}
          />
        )}

        {activeTab === 'all-products' && (
          <AllProductsView
            filtered={filtered}
            loading={loading}
            totalProducts={filtered.length}
            totalStock={filtered.filter(p => p.raw?.track_stock === 1).length}
            openProductDetails={openProductDetails}
            handleAddStore={handleAddStore}
            handleRemoveStore={handleRemoveStore}
            formatCustomDate={formatCustomDate}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === 'inventory-transfer' && (
            <InventoryTransferPanel
                productsTrackable={productsTrackable}
                fetchProducts={fetchProducts}
            />
            )}

            {activeTab === 'stock-label' && (
            <StockLabelPage
                // productsTrackable={productsTrackable}
                // fetchProducts={fetchProducts}
            />
            )}


        <ConfirmDialog
          show={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeletingProduct(null);
          }}
          onConfirm={handleDeleteProduct}
          title={`Delete "${deletingProduct?.name}"?`}
          message="This will permanently remove the product from your inventory."
          confirmText="Delete Product"
          loading={deleting}
        />
      </div>
    </>
  );
}
