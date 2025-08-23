'use client';
import { CartItem, Customer } from '@/components/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_STORE_ID = 'all-products';

export default function useCheckout() {
   const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // global discount
  const [globalIsPercentage, setGlobalIsPercentage] = useState(false);
  const [globalDiscountValue, setGlobalDiscountValue] = useState<string>('0');

  // payments
  const [payments, setPayments] = useState<{ id: string | number; method: string; amount: number; reference?: string | null }[]>([]);
  // payment dialog helpers
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentDialogDefaultAmount, setPaymentDialogDefaultAmount] = useState<number>(0);

  // selected customer & store info read from currentSale
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [storeId, setStoreId] = useState<string | number>(DEFAULT_STORE_ID);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);
  const [receiptEmail, setReceiptEmail] = useState<string>('');



  // load currentSale from localStorage (backward compatible with older payloads)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentSale');
      if (!raw) {
        setItems([]);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(raw);

      // If parsed has items => CurrentSale object
      let itemsFromStorage: any[] = [];
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
        itemsFromStorage = parsed.items;
        // prefer parsed.customer shape, fallback to parsed.customer_id/name
        // setSelectedCustomer(parsed.customer ?? (parsed.customer_id ? { user_id: parsed.customer_id, customer_name: parsed.customer_name } : null));
        setSelectedCustomer(
  parsed.customer && parsed.customer.user_id
    ? parsed.customer
    : parsed.customer_id
    ? { user_id: parsed.customer_id, customer_name: parsed.customer_name }
    : null
);
        setStoreId(parsed.store_id ?? parsed.store ?? DEFAULT_STORE_ID);
      } else if (Array.isArray(parsed)) {
        // legacy: just items array
        itemsFromStorage = parsed;
      } else {
        // unknown shape
        itemsFromStorage = [];
      }

      const normalized = itemsFromStorage.map((p: any) => {
        // handle many legacy names for the quick sale flag & meta
        const rawFlag = p.is_quick_sale ?? p.isQuickSale ?? p.quick_sale ?? p.quickSale ?? 0;
        const isQuick =
          rawFlag === 1 || rawFlag === '1' || rawFlag === true
            ? 1
            : 0;

        // variant id legacy keys: variant_id, variantId, variant
        const variantId = p.variant_id ?? p.variantId ?? p.variant ?? null;

        // quick meta legacy keys
        const quickMeta = p.quick_meta ?? p.quickMeta ?? p.quick ?? null;

        const unitPrice = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price ?? p.unit_price ?? 0);
        const qty = Number(p.quantity ?? p.qty ?? 1);
        const discountAmt = Number(p.discount ?? p.discount_amount ?? 0);
        const lineTotal = Math.max(0, unitPrice * qty - discountAmt);

        return {
          product_id: String(p.product_id ?? p.id ?? uuidv4()),
          variant_id: variantId ? String(variantId) : null,
          name: p.name ?? p.title ?? 'Unnamed',
          price: unitPrice,
          quantity: qty,
          discount: discountAmt,
          isDiscountPercentage: !!p.isDiscountPercentage,
          barcode: p.barcode ?? null,
          image: p.image ?? null,
          // cart-only fields
          is_quick_sale: isQuick as 0 | 1,
          // keep quick_meta as object in UI, but allow null in type — we'll always send {}
          quick_meta: (quickMeta && typeof quickMeta === 'object') ? quickMeta : {},
          line_total: Number(lineTotal.toFixed(2)),
        } as CartItem;
      });

      setItems(normalized);
    } catch (err) {
      console.error('Failed to load currentSale', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // formatting helper (exposed)
  const formatPrice = (v: number) => `₦ ${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // computed amounts
  const subTotal = useMemo<number>(() => items.reduce((acc, it) => acc + (it.price ?? 0) * (it.quantity ?? 1), 0), [items]);
  const itemDiscountTotal = useMemo<number>(() => items.reduce((acc, it) => acc + (it.discount ?? 0), 0), [items]);

  const globalDiscountAmount = useMemo<number>(() => {
    const raw = parseFloat(globalDiscountValue || '0');
    if (isNaN(raw) || raw <= 0) return 0;
    if (globalIsPercentage) {
      const pct = Math.min(raw, 100);
      return (subTotal * pct) / 100;
    } else {
      return Math.min(raw, subTotal);
    }
  }, [globalDiscountValue, globalIsPercentage, subTotal]);

  const totalDiscount = useMemo<number>(() => Math.min(subTotal, itemDiscountTotal + globalDiscountAmount), [subTotal, itemDiscountTotal, globalDiscountAmount]);
  const total = useMemo<number>(() => Math.max(0, subTotal - totalDiscount), [subTotal, totalDiscount]);

  const sumPayments = useMemo<number>(() => payments.reduce((s, p) => s + (p.amount || 0), 0), [payments]);
  const remainingAmount = useMemo<number>(() => Math.max(0, total - sumPayments), [total, sumPayments]);

  // handlers
  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => prev.map(it => {
      if (it.product_id !== productId) return it;
      const newQty = Math.max(1, (it.quantity || 1) + delta);
      const unitPrice = Number(it.price ?? 0);
      const discountAmt = Number(it.discount ?? 0);
      return { ...it, quantity: newQty, line_total: Number((unitPrice * newQty - discountAmt).toFixed(2)) };
    }));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(it => it.product_id !== productId));
    toast.info('Item removed', {position: 'top-center'});
  };

  // NEW: set quick sale flag for item (0|1) and ensure quick_meta exists
  const setItemQuickSale = (productId: string, isQuick: boolean) => {
    setItems(prev => prev.map(it => {
      if (it.product_id !== productId) return it;
      const qm = it.quick_meta && typeof it.quick_meta === 'object' ? it.quick_meta : {};
      return { ...it, is_quick_sale: isQuick ? 1 : 0, quick_meta: qm };
    }));
  };

  const applyGlobalDiscount = (value: string, isPct: boolean) => {
    setGlobalDiscountValue(value);
    setGlobalIsPercentage(isPct);
  };

  const addPayment = (p: { id?: string | number; method: string; amount: number; reference?: string | null }) => {
    const id = p.id ?? Date.now();
    setPayments(prev => [...prev, { id, method: p.method, amount: p.amount, reference: p.reference ?? null }]);
    toast.success(`Added ${p.method} payment: ${formatPrice(p.amount)}`, {position: 'top-center'});
  };

  const removePayment = (id: string | number) => setPayments(prev => prev.filter(p => p.id !== id));

  const finalizeCharge = async (paymentMethodName?: string) => {
    if (items.length === 0) {
      toast.error('Cart is empty', {position: 'top-center'});
      return;
    }

    // --- normalize items to backend shape (CRITICAL: variant_id must be null not '') ---
    const mappedItems = items.map((it) => {
      const unitPrice = Number(it.price ?? 0);
      const qty = Number(it.quantity ?? 1);
      const discountAmount = Number(it.discount ?? 0);
      const computedLine = Math.max(0, unitPrice * qty - discountAmount);
      const lineTotal = (typeof it.line_total === 'number' && !Number.isNaN(it.line_total)) ? Number(it.line_total.toFixed(2)) : Number(computedLine.toFixed(2));
      const isQuick = it.is_quick_sale ? 1 : 0;

      // product_id MUST be null for quick sales so FK does not fail
      const productId = isQuick ? null : (it.product_id ?? null);

      // ensure variant_id isn't empty string
      const variantId = it.variant_id && String(it.variant_id).trim().length > 0 ? String(it.variant_id) : null;

      return {
        product_id: productId,
        variant_id: variantId,
        name: it.name ?? null,
        unit_price: Number(unitPrice.toFixed(2)),
        quantity: qty,
        discount_amount: Number(discountAmount),
        line_total: lineTotal,
        is_quick_sale: isQuick,
        quick_meta: (it.quick_meta && typeof it.quick_meta === 'object') ? it.quick_meta : {}, // always an object
      };
    });

    // --- handle payment_method when multiple payments used ---
    // priority: explicit paymentMethodName param > payments array
    const determinePaymentMethod = (explicit?: string) => {
      if (explicit && String(explicit).trim().length) return String(explicit);
      if (!payments || payments.length === 0) return 'cash';
      const uniq = Array.from(new Set(payments.map(p => String(p.method ?? 'cash').trim()).filter(Boolean)));
      if (uniq.length === 1) return uniq[0];          // single method used
      return 'mixed';                                 // multiple different methods used
      // optionally: return uniq.join('+') to record exact methods used
    };

    const pm = determinePaymentMethod(paymentMethodName);
    const staff = JSON.parse(localStorage.getItem('user') || 'null');

    const payload = {
      staff_id: staff.id,
      store: storeId ?? DEFAULT_STORE_ID,
      customer_id: selectedCustomer?.user_id ?? null,
      customer_name: selectedCustomer?.customer_name ?? 'Walk-in customer',
      items: mappedItems,
      subtotal: subTotal,
      item_discount_total: itemDiscountTotal,
      global_discount_amount: globalDiscountAmount,
      total_discount: totalDiscount,
      total: total,
      payment_method: pm,
      payments: payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        reference: p.reference ?? null,
      })),
      metadata: null,
    };

    console.log

    try {
  setLoading(true);
  const token = JSON.parse(localStorage.getItem('token') || 'null');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  console.log(`frontend payload`, payload)

  const data = await res.json().catch(() => ({} as any));
  console.log('API response:', data);

  // --- auth check
  if (res.status === 401 || data.message === 'Unauthorized') {
    localStorage.removeItem('token');
    toast.error('Session expired. Please log in again.', { position: 'top-center' });
    window.location.href = '/login';
    return;
  }

  // --- insufficient stock error handling
  if (!res.ok) {
    if (data.error === 'insufficient_stock') {
      toast.error(
        `❌ Insufficient stock for "${data.product_name}" in "${data.store_name}". Available: ${data.available}, requested: ${data.requested ?? '?'}`,
        { position: 'top-center' }
      );

      // optional: update UI state to mark the product as problematic
      setItems(prev =>
        prev.map(it =>
          it.product_id === String(data.product_id)
            ? { ...it, _outOfStock: true, _available: data.available }
            : it
        )
      );

      setLoading(false);
      return; // stop here, don’t mark sale as completed
    }

    // fallback for other errors
    throw new Error(data.message || 'Failed to create sale');
  }

  // --- success flow
  localStorage.setItem('lastSale', JSON.stringify(data));

  setSaleData(data);
  setSaleCompleted(true);
  setReceiptEmail(selectedCustomer?.email ?? '');

  toast.success('✅ Sale completed', { position: 'top-center' });
  console.log('Sale response:', data);
} 
 catch (err: any) {
      console.error('Error finalizing sale:', err);
      toast.error(err.message || '❌ Failed to finalize sale', {position: 'top-center'});
    } finally {
      setLoading(false);
    }
  };

  


  const backToPOS = (routerPush: (path: string) => void) => {
    // preserve is_quick_sale and quick_meta as part of items when saving
    localStorage.setItem('currentSale', JSON.stringify({ items, customer: selectedCustomer, store_id: storeId }));
    router.push(`/dashboard`);
  };

  // expose everything needed by UI
  return {
    // state
    items,
    loading,
    payments,
    showPaymentDialog,
    paymentDialogDefaultAmount,
    globalIsPercentage,
    globalDiscountValue,
    selectedCustomer,
    storeId,

    // formatters & computed
    formatPrice,
    subTotal,
    itemDiscountTotal,
    globalDiscountAmount,
    totalDiscount,
    total,
    sumPayments,
    remainingAmount,
    saleCompleted,
    saleData,

  receiptEmail,
  setReceiptEmail,

    // handlers
    setShowPaymentDialog,
    setPaymentDialogDefaultAmount,
    addPayment,
    removePayment,
    updateQuantity,
    removeItem,
    applyGlobalDiscount,
    finalizeCharge,
    backToPOS,
    setSelectedCustomer,
    setStoreId,
    setGlobalDiscountValue,
    setGlobalIsPercentage,
    setPayments,

    // new helper to toggle/set quick-sale flag
    setItemQuickSale,
  } as const;
}
