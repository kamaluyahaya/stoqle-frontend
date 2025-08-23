'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  Calendar,
  CreditCard,
  Mail,
  X,
  Minus,
} from 'lucide-react';
import CustomerForm from '@/components/forms/dialog/customerDialog';
import useCustomers from '@/hooks/useCustomers';
import { Customer, Product } from '@/components/types';
import { ProductDetails, StoreInfo } from '@/components/types/product';
import { toast } from 'sonner';

// --- Simple small modal component included so this file is standalone ---
function Modal({ show, onClose, title, children, width = 'max-w-2xl' }: any) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`relative z-10 ${width} w-full mx-4 bg-white rounded-2xl shadow-2xl p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div>{children}</div>
      </motion.div>
    </div>
  );
}

// --- Helpers ---
const formatCurrency = (v: number) => {
  if (Number.isNaN(v) || !isFinite(v)) return '0.00';
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Types ---
// type Customer = { id: string; name: string; email?: string; phone?: string; address?: string };
type Item = { id: string; name: string; qty: number; price: number; amount: number };

export default function InvoicePage() {
  // Customers (in a real app you'd fetch these)


  // Product library (sample)
  // const [library, setLibrary] = useState<Item[]>([
  //   { id: 'p1', name: 'Premium Paint 5L', qty: 1, price: 45000, amount: 45000 },
  //   { id: 'p2', name: 'Labour - Painter (per day)', qty: 1, price: 25000, amount: 25000 },
  //   { id: 'p3', name: 'Brush Set', qty: 1, price: 3000, amount: 3000 },
  // ]);

  // Form states
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Invoice details (same row layout)
  const [store, setStore] = useState('Main Store');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [discountType, setDiscountType] = useState<'none' | 'amount' | 'percent'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [terms, setTerms] = useState<'after' | 'before'>('after');
  const [dueDate, setDueDate] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Items
  const [items, setItems] = useState<Item[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addMode, setAddMode] = useState<'oneoff' | 'library' | null>(null);

  // One-off inputs
  const [oneName, setOneName] = useState('');
  const [oneQty, setOneQty] = useState<number>(1);
  const [onePrice, setOnePrice] = useState<number>(0);

  // Library search
  const [libSearch, setLibSearch] = useState('');

  // Payment and notes
  const [payBank, setPayBank] = useState(false);
  const [payOnline, setPayOnline] = useState(false);
  const [notes, setNotes] = useState('');
  

  // Send invoice modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [mailFrom, setMailFrom] = useState('invoices@ksofttechnova.com');
  const [mailTo, setMailTo] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendCopy, setSendCopy] = useState(false);
    const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
 const { customers, fetchCustomers } = useCustomers();


 

   const [customerSearch, setCustomerSearch] = useState('');
   const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
   const [selectedCustomerId, setSelectedCustomerId] = useState<string | number>('');
   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);
    const [stores, setStores] = useState<StoreInfo[]>([]);
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
      const [sourceStore, setSourceStore] = useState<StoreInfo | null>(null);
        const [loading, setLoading] = useState(false);
          const [products, setProducts] = useState<Product[]>([]);

      const openAddCustomer = () => setShowAddCustomerDialog(true);
  // Computations
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);

  // ---------- modify Item type (add productId) ----------
type Item = { id: string; name: string; qty: number; price: number; amount: number; productId?: string | number };

// ---------- helpers to find available stock (defensive to many shapes) ----------
function availableStockForProduct(product: any, storeId?: string | number): number | null {
  // try common shapes:
  // 1) product.quantity, product.qty, product.stock, product.available
  const tryNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // direct fields
  const direct =
    tryNum(product.quantity) ??
    tryNum(product.qty) ??
    tryNum(product.stock) ??
    tryNum(product.available) ??
    tryNum(product.available_qty) ??
    tryNum(product.availableQuantity) ??
    null;

  if (direct !== null) return direct;

  // store-specific array e.g. product.stocks = [{store_id, quantity}, ...]
  if (Array.isArray(product.stocks) && storeId != null) {
    const s = product.stocks.find((x: any) => String(x.store_id) === String(storeId) || String(x.storeId) === String(storeId));
    if (s) return tryNum(s.quantity) ?? tryNum(s.qty) ?? tryNum(s.stock) ?? null;
  }

  // sometimes products have store_qtys keyed by store id: product.store_quantities = { "<id>": qty }
  if (product.store_quantities && storeId != null) {
    const val = product.store_quantities[String(storeId)] ?? product.store_quantities[Number(storeId)];
    return tryNum(val);
  }

  // variant: product.stock_by_store = [{storeId, qty}]
  if (Array.isArray(product.stock_by_store) && storeId != null) {
    const s = product.stock_by_store.find((x: any) => String(x.storeId) === String(storeId));
    if (s) return tryNum(s.qty) ?? tryNum(s.quantity) ?? null;
  }

  // can't determine -> return null meaning "unknown"
  return null;
}

function findProductInProducts(productId: string | number) {
  return products.find(p => String(p.product_id) === String(productId) || String((p as any).id) === String(productId));
}

// ---------- updated addFromLibrary (checks store + merges if exists) ----------
function addFromLibrary(product: Product) {
  // require source store
  if (!sourceStore) {
    toast.error('Select a source store first.');
    return;
  }

  const productId = product.product_id ?? (product as any).id ?? (product as any).productId;
  const price = Number(product.price ?? (product as any).sell_price ?? (product as any).unit_price ?? 0) || 0;
  const name = product.name ?? (product as any).product_name ?? 'Unnamed product';

  // get available stock for this product in the selected store
  const available = availableStockForProduct(product, sourceStore?.store_id);
  // if available is a number and is zero => no stock
  if (available !== null && available <= 0) {
    toast.error(`"${name}" is out of stock in ${sourceStore.store_name || 'selected store'}.`);
    return;
  }

  // check if item already exists (prefer productId match, fallback to name)
  const existingIndex = items.findIndex(it => {
    if (it.productId && productId) return String(it.productId) === String(productId);
    return it.name === name; // fallback
  });

  if (existingIndex !== -1) {
    const existing = items[existingIndex];
    const desiredQty = existing.qty + 1;

    // If we can determine available stock, enforce it
    if (available !== null && desiredQty > available) {
      toast.error(`Cannot increase "${name}" to ${desiredQty}. Only ${available} available in ${sourceStore.store_name || 'selected store'}.`);
      return;
    }

    // update qty only
    setItems(prev => prev.map((it, idx) =>
      idx === existingIndex ? { ...it, qty: desiredQty, amount: desiredQty * it.price } : it
    ));
    toast.success(`Increased "${name}" quantity to ${desiredQty}.`);
    setShowAddItemModal(false);
    return;
  }

  // new item
  // If we can determine available stock, ensure at least qty 1 available
  if (available !== null && 1 > available) {
    toast.error(`"${name}" is out of stock in ${sourceStore.store_name || 'selected store'}.`);
    return;
  }

  const it: Item = {
    id: `i_${productId ?? Date.now()}_${Date.now()}`,
    name,
    qty: 1,
    price,
    amount: 1 * price,
    productId: productId ?? undefined,
  };

  setItems(prev => [...prev, it]);
  setShowAddItemModal(false);
  toast.success(`Added "${name}" to invoice.`);
}

// ---------- updated increment / decrement (check stock on increment) ----------
function incrementQty(id: string) {
  setItems(prev => {
    return prev.map(it => {
      if (it.id !== id) return it;

      // if item references a productId and we have a selected source store, verify stock
      const prodId = (it as any).productId;
      if (prodId && sourceStore) {
        const prod = findProductInProducts(prodId);
        const available = prod ? availableStockForProduct(prod, sourceStore.store_id) : null;
        const newQty = it.qty + 1;
        if (available !== null && newQty > available) {
          toast.error(`Cannot increase "${it.name}". Only ${available} available in ${sourceStore.store_name || 'selected store'}.`);
          return it; // don't change
        }
      }

      // allow increment for one-off items or unknown stock
      const newQty = it.qty + 1;
      return { ...it, qty: newQty, amount: newQty * it.price };
    });
  });
}

function decrementQty(id: string) {
  setItems(prev =>
    prev.map(it =>
      it.id === id
        ? (() => {
            const newQty = Math.max(0, it.qty - 1);
            return { ...it, qty: newQty, amount: newQty * it.price };
          })()
        : it
    )
  );
}


  const discountAmount = useMemo(() => {
    if (discountType === 'none') return 0;
    if (discountType === 'amount') return Math.min(discountValue || 0, subtotal);
    return (discountValue || 0) / 100 * subtotal;
  }, [discountType, discountValue, subtotal]);
  const total = Math.max(subtotal - discountAmount, 0);

  useEffect(() => {
    // update default mailTo when customer selected
    setMailTo(selectedCustomer?.email || '');
  }, [selectedCustomer]);

  useEffect(() => {
    setMessageBody(templateMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, discountAmount, total, selectedCustomer]);

  function templateMessage() {
    const toName = selectedCustomer?.customer_name || 'Customer';
    return `Hi, ${toName}.\nPlease find attached invoice for a subtotal of ${formatCurrency(subtotal)}.\nYou have received a discount of ${formatCurrency(discountAmount)}.\nYour invoice total is ${formatCurrency(total)}.\nThank you.\n\nKSOFTTechnova`;
  }

  // --- Actions ---
  function openAddItem() {
    setAddMode(null);
    setOneName('');
    setOneQty(1);
    setOnePrice(0);
    setLibSearch('');
    setShowAddItemModal(true);
  }

  function addOneOff() {
    if (!oneName.trim()) return alert('Enter product name');
    const amt = oneQty * onePrice;
    const it: Item = { id: `i_${Date.now()}`, name: oneName, qty: oneQty, price: onePrice, amount: amt };
    setItems(prev => [...prev, it]);
    setShowAddItemModal(false);
  }



  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

    useEffect(() => {
      const fetchStores = async () => {
        setLoadingStores(true);
        try {
          const token = JSON.parse(localStorage.getItem('token') || 'null');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to fetch stores');
          setStores(Array.isArray(data) ? data : []);
        } catch (err: any) {
          console.error(err);
          toast.error(err.message || 'Could not load stores', { position: 'top-center' });
          setStores([]);
        } finally {
          setLoadingStores(false);
        }
      };
  
      fetchStores();
    }, []);

      const [destinationStore, setDestinationStore] = useState<StoreInfo | null>(null);
  function saveInvoice() {
    // In a real app you would POST to your API. Here we just log and toast.
    const payload = {
      customer: selectedCustomer,
      invoiceDate,
      store,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      total,
      terms,
      dueDate,
      paymentMethods: { bank: payBank, online: payOnline },
      notes,
    };
    console.log('Save Invoice', payload);
    alert('Invoice saved (demo)');
  }

  function openSendModal() {
    if (!selectedCustomer) return alert('Select a customer first');
    setMessageBody(templateMessage());
    setMailTo(selectedCustomer.email || '');
    setShowSendModal(true);
  }


    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
            // Check for unauthorized status
      if (res.status === 401 || data.message === 'Unauthorized') {
        localStorage.removeItem('token'); // clear token
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login'; // redirect to login
        return;
      }
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        setProducts(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

  function sendInvoice() {
    const mailPayload = { from: mailFrom, to: mailTo, body: messageBody, ccMyself: sendCopy };
    console.log('Sending mail:', mailPayload);
    alert('Invoice emailed (demo)');
    setShowSendModal(false);
  }

    useEffect(() => {
      fetchCustomers();
      fetchProducts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



      const renderStoreOptions = (excludeId?: string | number) => {
    const list = !excludeId ? stores : stores.filter(s => String(s.store_id) !== String(excludeId));
    if (loadingStores) return <option>Loading...</option>;
    return list.map(s => (
      <option key={s.store_id} value={s.store_id}>{s.store_name ?? `#${s.store_id}`}</option>
    ));
  };

  // inside component (replace your current input/dropdown block)
const containerRef = useRef<HTMLDivElement | null>(null);

// ensure chooseCustomer normalizes and sets all related states:
const chooseCustomer = (c: Customer) => {
  const normalized: Customer = {
    user_id: String(c.user_id),
    customer_name: c.customer_name ?? 'Unnamed customer',
    email: c.email ?? null,
    phone: c.phone ?? null,
  } as Customer;

  setSelectedCustomer(normalized);
  setSelectedCustomerId(normalized.user_id);
  setCustomerSearch(normalized.customer_name || '');
  setShowCustomerDropdown(false);
};




useEffect(() => {
  function handler(e: PointerEvent) {
    const el = containerRef.current;
    if (!el) return;
    if (!el.contains(e.target as Node)) setShowCustomerDropdown(false);
  }

  document.addEventListener('pointerdown', handler);
  return () => document.removeEventListener('pointerdown', handler);
}, []);
  // --- Simple customer add form ---
  function CustomerAddForm({ onClose }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    function create() {
      if (!name.trim()) return alert('Enter customer name');
      const c: Customer = { user_id: `c_${Date.now()}`, customer_name: name, email, phone };
    //   setCustomers(prev => [c, ...prev]);
      setSelectedCustomer(c);
      onClose();
    }


    

    return (
      <div className="space-y-3">
        <label className="block text-sm text-gray-600">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3" />
        <label className="block text-sm text-gray-600">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3" />
        <label className="block text-sm text-gray-600">Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3" />
        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-2xl border border-gray-200">Cancel</button>
          <button onClick={create} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Create & Select</button>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gray-50 p-6 md:p-12">
    <>
                <CustomerForm show={showAddCustomerDialog} onClose={() => setShowAddCustomerDialog(false)} editingCustomer={null} refreshCustomers={fetchCustomers} />

        <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100  min-h-screen rounded-xl">

            
      <div className=" space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Create <span className="text-blue-500">Invoice</span></h1>
            <p className="text-sm text-gray-500 mt-1">Create and send finanacial invoice</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => alert('Preview (demo)')} className="rounded-2xl px-4 py-2 border border-gray-200">Preview</button>
            <button onClick={saveInvoice} className="rounded-2xl px-4 py-2 bg-gray-900 text-white">Save Invoice</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Customer */
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Customer</h3>
              <button  onClick={openAddCustomer} className="flex items-center gap-2 text-sm text-blue-600">
                <Plus className="w-4 h-4" /> Add / Select
              </button>
            </div>

            <div className="space-y-3">
             <div className="relative" ref={containerRef}>
  <input
    value={selectedCustomer ? selectedCustomer.customer_name : customerSearch}
    onFocus={() => {
      setShowCustomerDropdown(true);
      if (selectedCustomer) setCustomerSearch('');
    }}
    onChange={e => {
      setCustomerSearch(e.target.value);
      if (selectedCustomer) setSelectedCustomer(null);
    }}
    placeholder="Search customers or select..."
    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2"
  />
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

  {showCustomerDropdown && (
    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
      {customers.filter(c =>
        c.customer_name.toLowerCase().includes((customerSearch || '').toLowerCase())
      ).length ? (
        customers
          .filter(c =>
            c.customer_name.toLowerCase().includes((customerSearch || '').toLowerCase())
          )
          .map(c => (
            // use onPointerDown so it fires before focus/blur and works on touch
            <button
              key={c.user_id}
              onPointerDown={(e) => {
                // prevent default isn't strictly necessary, but keeps focus behavior consistent
                e.preventDefault();
                chooseCustomer(c);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 flex justify-between items-center"
              type="button"
            >
              <div>
                <div className="font-medium">{c.customer_name}</div>
                <div className="text-xs text-gray-500">
                  {c.email || c.phone || c.address}
                </div>
              </div>
              <div className="text-sm text-gray-400">Select</div>
            </button>
          ))
      ) : (
        <div className="p-3 text-gray-500">No customers found.</div>
      )}
    </div>
  )}
</div>

              {/* small summary chip for selected customer (now shown inline instead of full block) */}
              {selectedCustomer && (
                <div className="mt-2 inline-flex items-center gap-3 rounded-full bg-blue-50 px-4 py-2 border border-blue-100">
                  <div className="text-sm font-medium">{selectedCustomer.customer_name}</div>
                  <div className="text-xs text-gray-500">{selectedCustomer.email}</div>
                  <button onClick={() => setSelectedCustomer(null)} className="ml-3 text-sm text-blue-600">Change</button>
                </div>
              )}
            </div>
          </div>
}
          {/* Section 2: Invoice Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Invoice Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Select Store</label>
                <select
              className="w-full rounded-xl border border-gray-200 p-3 " 
              value={sourceStore?.store_id ?? ''}
              onChange={(e) => {
                const s = stores.find(st => String(st.store_id) === String(e.target.value));
                setSourceStore(s ?? null);
                // clear selected items when switching store to avoid stale validation
                setSelectedItems({});
                // if destination was same as new source, clear it
              }}
            >
              <option value="">Select store</option>
              {renderStoreOptions(destinationStore?.store_id)}
            </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Invoice Date</label>
                <div className="relative">
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 pr-10" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

             <div>
                <label className="text-sm text-gray-600">Discount Type</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 p-3"
                >
                  <option value="none">None</option>
                  <option value="amount">Amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Discount Value</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={e => setDiscountValue(Number(e.target.value))}
                  disabled={discountType === "none"}   // ✅ disable when "none"
                  className={`w-full rounded-xl border p-3 ${
                    discountType === "none"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Terms</label>
                <select value={terms} onChange={e => setTerms(e.target.value as any)} className="w-full rounded-xl border border-gray-200 p-3">
                  <option value="after">Pay after fulfilment</option>
                  <option value="before">Pay before fulfilment</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3" />
              </div>
            </div>
          </div>
        </div>


    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Products & Services</h3>
        <div className="flex items-center gap-3">
          <button onClick={openAddItem} className="flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2">
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? items.map(it => (
              <tr key={it.id} className="">
                <td className="py-3 px-6">{it.name}</td>

                {/* Quantity with minus / value / plus */}
                <td className="py-3 px-6">
                  <div className="inline-flex items-center gap-2 border rounded-lg px-2 py-1">
                    <button
                      onClick={() => decrementQty(it.id)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                      aria-label={`Decrease quantity of ${it.name}`}
                      disabled={it.qty <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-10 text-center font-medium">
                      {it.qty}
                    </span>

                    <button
                      onClick={() => incrementQty(it.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label={`Increase quantity of ${it.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                <td className="py-3 px-6">{formatCurrency(it.price)}</td>

                {/* recompute amount from qty * price */}
                <td className="py-3 px-6">{formatCurrency(it.qty * it.price)}</td>

                {/* Actions: only delete (edit icon removed) */}
                <td className="py-3 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-2 rounded-md hover:bg-gray-100"
                      onClick={() => removeItem(it.id)}
                      aria-label={`Remove ${it.name}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">No items added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 flex flex-col md:flex-row justify-end gap-4">
        <div className="w-full md:w-96 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between mb-2 text-sm text-gray-600">
            <div>Subtotal</div>
            <div>{formatCurrency(subtotal)}</div>
          </div>
          <div className="flex justify-between mb-2 text-sm text-gray-600">
            <div>Discount</div>
            <div>- {formatCurrency(discountAmount)}</div>
          </div>
          <div className="flex justify-between mt-4 pt-3 border-t font-semibold text-gray-900">
            <div>Total</div>
            <div>{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
    </div>
  



        {/* Payment method and notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">Preferred Payment Method</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={payBank} onChange={e => setPayBank(e.target.checked)} />
                <span>Bank Transfer</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={payOnline} onChange={e => setPayOnline(e.target.checked)} />
                <span>Online Transfer</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-3">Notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-2xl border border-gray-200 p-3 min-h-[120px]" placeholder="Add invoice notes..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button onClick={openSendModal} className="px-4 py-2 rounded-2xl bg-blue-600 text-white flex items-center gap-2"><Mail className="w-4 h-4"/> Send Invoice</button>
          <button onClick={saveInvoice} className="px-4 py-2 rounded-2xl border border-gray-200">Save Invoice</button>
        </div>
      </div>

      {/* --- Customer Modal --- */}
      <Modal show={showCustomerModal} onClose={() => setShowCustomerModal(false)} title="Add / Create Customer">
        <CustomerAddForm onClose={() => setShowCustomerModal(false)} />
      </Modal>

      {/* --- Add Item modal (choice) --- */}
      <Modal show={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Add New Item">
        {!addMode ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="font-medium">Choose how to add the item</div>
              <div className="text-sm text-gray-500">One-off item or pick from your product library</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAddMode('oneoff')} className="flex-1 rounded-2xl border border-gray-200 p-3">One-off item</button>
              <button onClick={() => setAddMode('library')} className="flex-1 rounded-2xl border border-gray-200 p-3">Add from library</button>
            </div>
          </div>
        ) : addMode === 'oneoff' ? (
          <div className="space-y-3">
            <label className="text-sm text-gray-600">Product name</label>
            <input className="w-full rounded-xl border border-gray-200 p-3" value={oneName} onChange={e => setOneName(e.target.value)} />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <input type="number" min={1} value={oneQty} onChange={e => setOneQty(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 p-3" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Price</label>
                <input type="number" value={onePrice} onChange={e => setOnePrice(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 p-3" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Amount</label>
                <div className="w-full rounded-xl border border-gray-200 p-3">{formatCurrency(oneQty * onePrice)}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setAddMode(null)} className="px-4 py-2 rounded-2xl border">Back</button>
              <button onClick={addOneOff} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Add to invoice</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search library..." className="w-full rounded-xl border border-gray-200 pl-10 p-3" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y">
              {products
  .filter(p => ((p.name ?? (p as any).product_name) || '').toLowerCase().includes(libSearch.toLowerCase()))
  .map(p => {
    const displayName = p.name ?? (p as any).product_name ?? 'Unnamed product';
    const displayPrice = Number(p.price ?? (p as any).sell_price ?? 0) || 0;
    return (
      <div key={p.product_id} className="p-3 hover:bg-gray-50 rounded-xl flex justify-between items-center cursor-pointer" onClick={() => addFromLibrary(p)}>
        <div>
          <div className="font-medium">{displayName}</div>
          <div className="text-xs text-gray-500">{formatCurrency(displayPrice)}</div>
        </div>
        <div className="text-sm text-gray-400">Add</div>
      </div>
    );
  })}
              {!products.length && <div className="p-3 text-gray-500">No products in library</div>}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setAddMode(null)} className="px-4 py-2 rounded-2xl border">Back</button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- Send Invoice Modal --- */}
      <Modal show={showSendModal} onClose={() => setShowSendModal(false)} title="Send Invoice">
        <div className="space-y-3">
          <label className="text-sm text-gray-600">From</label>
          <input value={mailFrom} onChange={e => setMailFrom(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3" />

          <label className="text-sm text-gray-600">To</label>
          <input value={mailTo} onChange={e => setMailTo(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3" />

          <label className="text-sm text-gray-600">Message</label>
          <textarea value={messageBody} onChange={e => setMessageBody(e.target.value)} className="w-full rounded-2xl border border-gray-200 p-3 min-h-[140px]" />

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={sendCopy} onChange={e => setSendCopy(e.target.checked)} /> Send a copy to myself
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button onClick={() => setShowSendModal(false)} className="px-4 py-2 rounded-2xl border">Cancel</button>
            <button onClick={sendInvoice} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Send</button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
}
