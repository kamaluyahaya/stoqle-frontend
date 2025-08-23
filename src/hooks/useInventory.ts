// FILE: hooks/useInventoryManager.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Category, Product, ProductDetails, StoreInfo } from '@/components/types/product';
import { formatCustomDate } from '@/components/dateFormatting/formattingDate';

export type InventoryManager = ReturnType<typeof useInventoryManager>;

export function useInventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Stock adjustment state
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [storeSelectionStep, setStoreSelectionStep] = useState<1 | 2>(1);
  const [selectedForStore, setSelectedForStore] = useState<Record<string, boolean>>({});
  const [adjustments, setAdjustments] = useState<Record<string, { qty: number | '', reason: string }>>({});
  const [selectedAction, setSelectedAction] = useState<Record<string, 'addition' | 'subtraction'>>({});
  const [inventoryMode, setInventoryMode] = useState<'addition' | 'subtraction' | null>(null);
  const [triggeredProductId, setTriggeredProductId] = useState<string | null>(null);

  // history
  const [adjustmentsHistory, setAdjustmentsHistory] = useState<any[]>([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // helpers
  const normalizeId = (id: string | number | undefined) => String(id ?? '');
  const toApiId = (id?: string | number) => {
    if (id === undefined || id === null || id === '') return id;
    const s = String(id);
    const n = Number(s);
    return Number.isFinite(n) ? n : s;
  };

  // fetchers
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
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');

      const mapped: Product[] = data.map((p: any) => {
        const raw = { ...(p.raw ?? {}), track_stock: p.raw?.track_stock ?? p.track_stock ?? p.trackStock ?? p.track ?? 0 };
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
      toast.error(err.message || 'Error loading products');
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
         // Check for unauthorized status
              if (res.status === 401 || data.message === 'Unauthorized') {
                localStorage.removeItem('token'); // clear token
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login'; // redirect to login
                return;
              }
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // adjustments history
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

  // exposed helpers for UI
  const productsTrackable = useMemo(() => products.filter(p => p.raw?.track_stock === 1), [products]);

  const toggleSelectProduct = (productId: string | number) => {
    const id = normalizeId(productId);
    setSelectedForStore(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id] && !adjustments[id]) {
        setAdjustments(prevA => ({ ...prevA, [id]: { qty: '', reason: '' } }));
      } else if (!next[id]) {
        setAdjustments(prevA => {
          const n = { ...prevA };
          delete n[id];
          return n;
        });
        setSelectedAction(prevA => {
          const n = { ...prevA };
          delete n[id];
          return n;
        });
      }

      if (next[id]) {
        setSelectedAction(prev => ({ ...prev, [id]: prev[id] ?? (inventoryMode ?? 'addition') }));
      }

      return next;
    });
  };

  const proceedToAdjustments = () => {
    const any = Object.values(selectedForStore).some(Boolean);
    if (!any) {
      toast.error('Select at least one product to proceed');
      return;
    }
    setStoreSelectionStep(2);
  };

  const updateAdjustment = (productId: string | number, field: 'qty' | 'reason', value: any) => {
    const id = normalizeId(productId);
    setAdjustments(prev => ({ ...prev, [id]: { ...(prev[id] ?? { qty: '', reason: '' }), [field]: value } }));
  };

  const submitAdjustments = async () => {
    if (!selectedStore) {
      toast.error('No store selected');
      return;
    }

    const storeIdApi = toApiId(selectedStore.store_id ?? (selectedStore as any).id ?? '');
    const selectedIds = Object.entries(selectedForStore).filter(([, v]) => v).map(([k]) => k);

    const adjustmentsPayload = selectedIds.map((id) => {
      const prod = products.find((p) => normalizeId(p.product_id) === id);
      const adj = adjustments[id] ?? { qty: 0, reason: '' };
      const qtyChange = Number(adj.qty ?? 0);
      const changeType = selectedAction[id] ?? inventoryMode ?? 'addition';

      return {
        product_id: toApiId(prod?.product_id ?? id),
        store_id: toApiId(storeIdApi),
        change_type: changeType,
        quantity_change: qtyChange,
        reason: String(adj.reason ?? '').trim(),
      };
    });

    // validation
    for (const p of adjustmentsPayload) {
      if (!p.quantity_change || p.quantity_change <= 0) {
        toast.error('Enter a valid quantity for all selected products');
        return;
      }
      if (!p.reason || p.reason.length < 3) {
        toast.error('Provide a short reason for each product');
        return;
      }
      if (p.change_type === 'subtraction') {
        const prod = products.find(x => String(toApiId(x.product_id)) === String(p.product_id));
        if (prod && (prod.currentStock ?? 0) < p.quantity_change) {
          toast.error(`Remove quantity for "${prod.name}" exceeds current stock`);
          return;
        }
      }
    }

    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/adjustments/batch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adjustments: adjustmentsPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit adjustments');

      toast.success('Stock adjustment submitted');

      // optimistic update
      setProducts(prev => prev.map(prod => {
        const match = adjustmentsPayload.find(p => String(p.product_id) === normalizeId(prod.product_id));
        if (!match) return prod;
        const qtyDelta = match.change_type === 'subtraction' ? -Math.abs(match.quantity_change) : Math.abs(match.quantity_change);
        const updatedStores = (prod.stores || []).map((s) => {
          if (normalizeId(s.store_id) === normalizeId(match.store_id)) {
            return { ...s, quantity: Math.max(0, (s.quantity ?? 0) + qtyDelta) };
          }
          return s;
        });

        if (!updatedStores.find(s => normalizeId(s.store_id) === normalizeId(match.store_id))) {
          updatedStores.push({ store_id: Number(match.store_id), store_name: (selectedStore as any).store_name ?? '', quantity: Math.max(0, qtyDelta), low_stock_alert: 0 });
        }

        return { ...prod, currentStock: Math.max(0, (prod.currentStock ?? 0) + qtyDelta), stores: updatedStores };
      }));

      // reset
      setSelectedForStore({});
      setAdjustments({});
      setSelectedStore(null);
      setStoreSelectionStep(1);
      setInventoryMode(null);

      await fetchProducts();
      await fetchAdjustmentsHistory();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit adjustments');
    }
  };

  const getCategoryName = (category_id?: string | null) => categories.find(c => c.category_id === category_id)?.category_name ?? '-';

  const resolveAdjustedByName = (a: any) => {
    const candidates = [a.adjusted_by_name, a.adjusted_by?.full_name, a.adjusted_by?.fullName, a.staff?.full_name, a.staff?.name, a.performed_by, a.user];
    for (const c of candidates) {
      if (!c) continue;
      const s = String(c).trim();
      if (!s) continue;
      if (/^#?\d+$/.test(s)) continue;
      return s;
    }
    return null;
  };

  return {
    products,
    setProducts,
    categories,
    loading,
    fetchProducts,
    fetchCategories,

    // stock adjustment
    selectedStore,
    setSelectedStore,
    storeSelectionStep,
    setStoreSelectionStep,
    selectedForStore,
    setSelectedForStore,
    adjustments,
    setAdjustments,
    selectedAction,
    setSelectedAction,
    inventoryMode,
    setInventoryMode,
    triggeredProductId,
    setTriggeredProductId,

    // history
    adjustmentsHistory,
    loadingAdjustments,
    historyError,
    fetchAdjustmentsHistory,

    // helpers
    productsTrackable,
    toggleSelectProduct,
    proceedToAdjustments,
    updateAdjustment,
    submitAdjustments,


    // misc
    getCategoryName,
    resolveAdjustedByName,
    normalizeId,
  } as const;
}


/* --------------------------------------------------------------------------- */