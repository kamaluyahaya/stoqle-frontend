'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Product, StoreInfo } from '@/components/types/product';
import { normalizeId, toApiId } from '@/lib/inventoryUtils';
import SelectProductsDialog from '../forms/dialog/inventory/productTransfer';
import { ArrowLeft } from 'lucide-react';
import TransferDetailsDialog from '../forms/dialog/inventory/transferDetailDialog';
import { ApiTransfer } from '../types/inventory';

type TransferItem = {
  product_id?: number | string;
  product_name?: string;
  qty?: number;
  quantity?: number;
  price: string;
  category: string;
  barcode: string;
  receipt_date: string;

};


export default function InventoryTransferPanel({
  productsTrackable,
  fetchProducts,
}: {
  productsTrackable: Product[];
  fetchProducts: () => Promise<void>;
}) {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [sourceStore, setSourceStore] = useState<StoreInfo | null>(null);
  const [destinationStore, setDestinationStore] = useState<StoreInfo | null>(null);
  const [transferDate, setTransferDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [transferType, setTransferType] = useState<'inbound' | 'outbound' | 'internal'>('inbound');
  const [accepting, setAccepting] = useState(false);
  const [holding, setHolding] = useState(false);
  const [creatingTransfer, setCreatingTransfer] = useState(false);
  

  // dialog state
  const [showDialog, setShowDialog] = useState(false);

  // selected items for create
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  // transfers list from API (matches your sample: { transfers: [...] })
  const [transfers, setTransfers] = useState<ApiTransfer[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  // selected transfer detail
  const [selectedTransfer, setSelectedTransfer] = useState<ApiTransfer | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // show create panel toggle
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // --- load stores ---
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

  // --- fetch transfers (expects { transfers: [...] } or direct array) ---
  const fetchTransfers = async () => {
    setLoadingTransfers(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/transfers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch transfers');
      const list: ApiTransfer[] = Array.isArray(data) ? data : data.transfers ?? [];
      setTransfers(list);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not load transfers', { position: 'top-center' });
      setTransfers([]);
    } finally {
      setLoadingTransfers(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  // --- helper to resolve store name ---
  const getStoreName = (storeId?: number | string) => {
    if (!storeId) return `#${storeId ?? '-'}`;
    const s = stores.find(st => String(st.store_id) === String(storeId));
    return s?.store_name ?? `#${storeId}`;
  };

  // --- product helpers ---
  const visibleProducts = useMemo(() => productsTrackable ?? [], [productsTrackable]);
  const getQtyAtStore = (product: Product, storeId: string | number | undefined) => {
    if (!product?.stores?.length) return 0;
    const s = product.stores.find(st => String(st.store_id) === String(storeId));
    return Number(s?.quantity ?? 0);
  };

  // dialog qty reset
  const [dialogQtys, setDialogQtys] = useState<Record<string, string>>({});
  useEffect(() => {
    if (showDialog) {
      const init: Record<string, string> = {};
      for (const p of visibleProducts) init[normalizeId(p.product_id)] = '';
      setDialogQtys(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog]);

  // add items from dialog
  const handleAddSelectedFromDialog = (items: { product_id: number | string; quantity: number }[]) => {
    if (!sourceStore) {
      toast.error('Select source store first', { position: 'top-center' });
      return;
    }
    for (const it of items) {
      const prod = visibleProducts.find(p => String(toApiId(p.product_id)) === String(it.product_id) || String(normalizeId(p.product_id)) === String(it.product_id));
      if (!prod) {
        toast.error(`Product ${it.product_id} not found`, { position: 'top-center' });
        return;
      }
      const available = getQtyAtStore(prod, sourceStore.store_id);
      if (it.quantity <= 0) {
        toast.error(`Enter a quantity for "${prod.name}"`, { position: 'top-center' });
        return;
      }
      if (it.quantity > available) {
        toast.error(`"${prod.name}" has only ${available} units at ${sourceStore.store_name || 'source'}`, { position: 'top-center' });
        return;
      }
    }

    setSelectedItems(prev => {
      const next = { ...prev };
      for (const it of items) next[normalizeId(it.product_id)] = it.quantity;
      return next;
    });

    setShowDialog(false);
    toast.success('Items added to transfer', { position: 'top-center' });
  };

  // remove item
  const removeSelectedItem = (prodId: string) => {
    setSelectedItems(prev => {
      const n = { ...prev };
      delete n[prodId];
      return n;
    });
  };

  // submit transfer (POST) - resilient to multiple response shapes
  const submitTransfer = async () => {
  if (!sourceStore || !destinationStore) {
    toast.error('Select both source and destination stores', { position: 'top-center' });
    return;
  }
  if (String(sourceStore.store_id) === String(destinationStore.store_id)) {
    toast.error('Source and destination cannot be the same', { position: 'top-center' });
    return;
  }

  const itemsPayload = Object.entries(selectedItems).map(([prodId, qty]) => {
    const prod = visibleProducts.find(p => normalizeId(p.product_id) === prodId);
    return { product_id: toApiId(prod?.product_id ?? prodId), quantity: qty };
  });
  if (itemsPayload.length === 0) {
    toast.error('Add at least one product to transfer', { position: 'top-center' });
    return;
  }

  try {
    setCreatingTransfer(true); // start loader

    const payload = {
      source_store_id: toApiId(sourceStore.store_id),
      destination_store_id: toApiId(destinationStore.store_id),
      transfer_date: transferDate,
      transfer_type: transferType,
      notes: null,
      items: itemsPayload,
    };
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/transfers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create transfer');

    toast.success('Inventory transfer created', { position: 'top-center' });

    await fetchProducts();
    await fetchTransfers();

    setShowCreatePanel(false);

    const created: ApiTransfer | null = data.transfer ?? (data.transfer_id ? { ...data } as ApiTransfer : data ?? null);
    const createdId = created?.transfer_id ?? data.transfer_id ?? null;
    if (createdId) {
      await openTransferModalById(createdId);
    }

    setSelectedItems({});
    setDialogQtys({});
    setSourceStore(null);
    setDestinationStore(null);
    setTransferDate(new Date().toISOString().slice(0, 10));
    setTransferType('inbound');
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Failed to create transfer', { position: 'top-center' });
  } finally {
    setCreatingTransfer(false); // stop loader
  }
};


  // open transfer modal by id (tries to fetch detail endpoint)
  const openTransferModalById = async (transferId: number | string) => {
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/transfers/${transferId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // backend might return { transfer: { ... }, items: [...] } or the transfer itself
        const detail: ApiTransfer = data.transfer ?? data;
        // if store names not included, map ids to names for display convenience
        setSelectedTransfer(detail);
        setShowTransferModal(true);
      } else {
        // fallback: open the list item we already have
        const existing = transfers.find(t => String(t.transfer_id) === String(transferId));
        if (existing) {
          setSelectedTransfer(existing);
          setShowTransferModal(true);
        } else {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch transfer detail');
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not load transfer details', { position: 'top-center' });
    }
  };

  // open when user clicks view (tries to fetch detail first for up-to-date items/notes)
  const openTransferModal = (t: ApiTransfer) => {
    // prefer to fetch detail via id for latest items / notes
    openTransferModalById(t.transfer_id);
    // setSelectedTransfer(t.transfer_id);
    // setShowTransferModal(true);

  };

  // Render helpers
  // const renderStoreOptions = (excludeId?: string | number) => {
  //   const list = !excludeId ? stores : stores.filter(s => String(s.store_id) !== String(excludeId));
  //   if (loadingStores) return <option>Loading...</option>;
  //   return list.map(s => <option key={s.store_id} value={s.store_id}>{s.store_name ?? `#${s.store_id}`}</option>);
  // };
  

    // helper to display per-product store summary string
  const storeSummaryForProduct = (p: Product) => {
    if (!p.stores || !p.stores.length) return '-';
    return p.stores.map(s => `${s.store_name ?? `#${s.store_id}`}: ${Number(s.quantity ?? 0).toLocaleString()} units`).join(' - ');
  };

  // Render helper: options excluding a given id
  const renderStoreOptions = (excludeId?: string | number) => {
    const list = !excludeId ? stores : stores.filter(s => String(s.store_id) !== String(excludeId));
    if (loadingStores) return <option>Loading...</option>;
    return list.map(s => (
      <option key={s.store_id} value={s.store_id}>{s.store_name ?? `#${s.store_id}`}</option>
    ));
  };

  const [searchTerm, setSearchTerm] = useState("");

const filteredTransfers = useMemo(() => {
  if (!searchTerm.trim()) return transfers;
  const term = searchTerm.toLowerCase();
  return transfers.filter((t) =>
    String(t.transfer_id).includes(term) ||
    (t.transfer_type && t.transfer_type.toLowerCase().includes(term)) ||
    (getStoreName(t.source_store_id) || "").toLowerCase().includes(term) ||
    (getStoreName(t.destination_store_id) || "").toLowerCase().includes(term)
  );
}, [searchTerm, transfers]);

const acceptOrder = async (t?: ApiTransfer) => {
  if (!t) {
    toast.error('No transfer selected', { position: 'top-center' });
    return;
  }
  if ((t.status ?? '').toLowerCase() === 'completed') {
    toast.info('Transfer already completed', { position: 'top-center' });
    return;
  }

  setAccepting(true);
  try {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/transfers/${t.transfer_id}/complete`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || `Failed to complete transfer (${res.status})`);
    }

    toast.success('Transfer marked as completed', { position: 'top-center' });

    const updatedTransfer: ApiTransfer | null = data.transfer ?? data ?? null;

    if (updatedTransfer && updatedTransfer.transfer_id) {
      setSelectedTransfer(updatedTransfer);
    } else {
      setSelectedTransfer(prev => (prev ? { ...prev, status: 'completed', updated_at: new Date().toISOString() } : prev));
    }

    await fetchTransfers();
    await fetchProducts?.();

    setShowTransferModal(false);
  } catch (err: any) {
    console.error('acceptOrder error', err);
    toast.error(err?.message || 'Could not accept transfer', { position: 'top-center' });
  } finally {
    setAccepting(false);
  }
};

const holdOrder = async (t?: ApiTransfer) => {
  if (!t) {
    toast.error('No transfer selected', { position: 'top-center' });
    return;
  }

  // guard: if already on-hold/completed
  const st = (t.status ?? '').toLowerCase();
  if (st === 'completed') {
    toast.info('Transfer already completed', { position: 'top-center' });
    return;
  }
  if (st === 'on_hold' || st === 'held' || st === 'hold') {
    toast.info('Transfer already on hold', { position: 'top-center' });
    return;
  }

  setHolding(true);
  try {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    // assumed endpoint - change if your API expects different path/method
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/transfers/${t.transfer_id}/cancel`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ reason: '...' }) // include if your API requires a payload
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || `Failed to put transfer on hold (${res.status})`);
    }

    toast.success('Transfer placed on hold', { position: 'top-center' });

    const updatedTransfer: ApiTransfer | null = data.transfer ?? data ?? null;

    if (updatedTransfer && updatedTransfer.transfer_id) {
      // use returned detail if present
      setSelectedTransfer(updatedTransfer);
    } else {
      // fallback — update locally (use the string your system uses for hold)
      setSelectedTransfer(prev => (prev ? { ...prev, status: 'on_hold', updated_at: new Date().toISOString() } : prev));
    }

    // refresh list (keeps UI consistent)
    await fetchTransfers();
    await fetchProducts?.();

    // keep modal open so user sees updated status; close if you prefer:
    // setShowTransferModal(false);
  } catch (err: any) {
    console.error('holdOrder error', err);
    toast.error(err?.message || 'Could not place transfer on hold', { position: 'top-center' });
  } finally {
    setHolding(false);
  }
};


  // convert backend transfer_type to something shown; keep raw if unknown
  const niceType = (t?: string) => (t ? String(t) : '-');

  return (
  <>
    

    {/* create panel - shown only when user clicks Create Transfer */}
    {showCreatePanel ? (
      <div className="bg-white backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-6">
        <div className="mb-4">
              <button
                onClick={() => setShowCreatePanel(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
        <div className="flex items-center justify-between mb-4">
          
          <div className="flex items-center gap-4">
            {/* user-provided back button */}
            

            <div>
              <h2 className="text-xl font-semibold">Inventory Transfer</h2>
              <p className="text-sm text-gray-500">Move stock between stores</p>
            </div>
          </div>

          <div className="flex gap-3">
  <button
    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition
      ${Object.keys(selectedItems).length === 0 || creatingTransfer
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700'}`}
    disabled={Object.keys(selectedItems).length === 0 || creatingTransfer}
    onClick={submitTransfer}
  >
    {creatingTransfer && (
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    )}
    {creatingTransfer ? 'Creating...' : 'Create Transfer'}
  </button>
</div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Source Store</label>
            <select
              className="w-full rounded-xl px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm"
              value={sourceStore?.store_id ?? ''}
              onChange={(e) => {
                const s = stores.find(st => String(st.store_id) === String(e.target.value));
                setSourceStore(s ?? null);
                // clear selected items when switching store to avoid stale validation
                setSelectedItems({});
                // if destination was same as new source, clear it
                if (s && String(destinationStore?.store_id) === String(s.store_id)) setDestinationStore(null);
              }}
            >
              <option value="">Select store</option>
              {renderStoreOptions(destinationStore?.store_id)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Destination Store</label>
            <select
              className="w-full rounded-xl px-3 py-2 border border-gray-200 bg-white/80 backdrop-blur-sm"
              value={destinationStore?.store_id ?? ''}
              onChange={(e) => {
                const s = stores.find(st => String(st.store_id) === String(e.target.value));
                setDestinationStore(s ?? null);
                // if source was same as new destination, clear it
                if (s && String(sourceStore?.store_id) === String(s.store_id)) setSourceStore(null);
              }}
            >
              <option value="">Select store</option>
              {renderStoreOptions(sourceStore?.store_id)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Transfer Date</label>
            <input
              type="date"
              className="w-full rounded-xl px-3 py-2 border border-gray-200 bg-white/80"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
            />
          </div>
        </div>

       <div className="mb-4 flex flex-col gap-2">
  <label className="text-xs text-gray-500 font-medium">Transfer Type</label>
  <div className="flex gap-3">
    {['inbound', 'outbound', 'internal'].map((type) => {
      const label = type === 'inbound' ? 'Incoming' : type === 'outbound' ? 'Outgoing' : 'Internal';
      const isSelected = transferType === type;
      return (
        <button
          key={type}
          type="button"
          onClick={() => setTransferType(type as 'inbound' | 'outbound' | 'internal')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {label}
        </button>
      );
    })}
  </div>
</div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Items to transfer</div>
            <div>
              <button
                className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm"
                onClick={() => {
                  if (!sourceStore) {
                    toast.error('Choose a source store first', { position: 'top-center' });
                    return;
                  }
                  setShowDialog(true);
                }}
              >
                Add items
              </button>
            </div>
          </div>

          {Object.keys(selectedItems).length === 0 ? (
            <div className="mt-4 text-sm text-gray-500">No items added yet</div>
          ) : (
            <div className="mt-4 space-y-3">
              {Object.entries(selectedItems).map(([prodId, qty]) => {
                const prod = visibleProducts.find(p => normalizeId(p.product_id) === prodId);
                if (!prod) return null;
                return (
                  <div key={prodId} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{prod.name}</div>
                      <div className="text-xs text-gray-400">{storeSummaryForProduct(prod)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm">{qty.toLocaleString()}</div>
                      <button className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-sm" onClick={() => removeSelectedItem(prodId)}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    ) : null}

    {/* Transfers list - default. Hidden while create panel is open */}
{!showCreatePanel && (
  <div
    id="transfers-list"
    className="bg-white backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-6 transition-all duration-300"
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Inventory Transfer Records</h3>
        <p className="text-sm text-gray-500 mt-1">
          All transfers fetched from the API
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium shadow-sm hover:shadow-md transition"
          onClick={fetchTransfers}
        >
          Refresh
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm hover:shadow-lg transition"
          onClick={() => {
            setShowCreatePanel(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Create Transfer
        </button>
      </div>
    </div>

    {/* Search bar */}
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search by Transfer ID, type, or store..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner placeholder:text-gray-400 transition"
      />
    </div>

    {/* Transfer list */}
    {loadingTransfers ? (
      <div className="text-sm text-gray-500">Loading transfers...</div>
    ) : filteredTransfers.length === 0 ? (
      <div className="text-sm text-gray-500">No transfers found</div>
    ) : (
      <div className="space-y-4">
        {filteredTransfers.map((t) => {
          let statusLabel = "-";
          let statusColor = "bg-gray-100 text-gray-700";

          if (t.status === "pending") {
            statusLabel = "In transit";
            statusColor = "bg-blue-100 text-blue-700";
          } else if (t.status === "completed") {
            statusLabel = "Received";
            statusColor = "bg-green-100 text-green-700";
          } else if (t.status === "cancelled") {
            statusLabel = "Cancelled";
            statusColor = "bg-red-100 text-red-700";
          } else if (t.status) {
            statusLabel = t.status;
          }

          return (
            <div
              key={t.transfer_id}
              className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
              onClick={() => openTransferModal(t)}
            >
              <div>
  <div className="font-medium text-gray-900">
    #{t.transfer_id} · {t.transfer_type === 'inbound' ? 'Incoming Transfer' : t.transfer_type === 'outbound' ? 'Outgoing Transfer' : t.transfer_type}
  </div>
  <div className="text-xs text-gray-400 mt-1">
    {t.transfer_date
      ? new Date(t.transfer_date).toLocaleString()
      : t.created_at
      ? new Date(t.created_at).toLocaleString()
      : "-"}
    {" · "}
    {getStoreName(t.source_store_id)} → {getStoreName(t.destination_store_id)}
  </div>
</div>


              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor} backdrop-blur-sm`}
                >
                  {statusLabel}
                </span>
                <button
                  className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 text-sm shadow-sm hover:shadow-md transition"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent double-trigger
                    openTransferModal(t);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}
<TransferDetailsDialog
  show={showTransferModal}
  onClose={() => setShowTransferModal(false)}
  transfer={selectedTransfer}
  getStoreName={(id) => getStoreName(id)}
  onAcceptOrder={acceptOrder}
  onHoldOrder={holdOrder}
  accepting={accepting}
  holding={holding}
/>
<SelectProductsDialog
      show={showDialog}
      onClose={() => setShowDialog(false)}
      visibleProducts={visibleProducts}
      sourceStore={sourceStore}
      normalizeId={normalizeId}
      getQtyAtStore={getQtyAtStore}
      storeSummaryForProduct={(p: Product) =>
        p.stores?.map(s => `${s.store_name ?? `#${s.store_id}`}: ${Number(s.quantity ?? 0).toLocaleString()} units`).join(' - ') ?? '-'
      }
      initialSelected={selectedItems}
      onInstantSelect={(items) => {
        // reuse validation-less instant select behaviour
        setSelectedItems(prev => {
          const next = { ...prev };
          for (const it of items) next[normalizeId(it.product_id)] = it.quantity;
          return next;
        });
      }}
      onAddSelected={handleAddSelectedFromDialog}
    />
  </>
);
}