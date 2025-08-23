'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '@/components/types/product';
import { normalizeId, toApiId } from '@/lib/inventoryUtils';

/**
 * Local types to avoid implicit any
 */
type Adjustment = { qty: number | ''; reason: string };
type AdjustmentsMap = Record<string, Adjustment>;
type ActionMap = Record<string, 'addition' | 'subtraction'>;
type SelectedForStoreMap = Record<string, boolean>;

type AdjustmentFlowProps = {
  inventoryMode: 'addition' | 'subtraction' | null;
  productsTrackable: Product[];
  selectedForStore: SelectedForStoreMap;
  setSelectedForStore: React.Dispatch<React.SetStateAction<SelectedForStoreMap>>;
  adjustments: AdjustmentsMap;
  setAdjustments: React.Dispatch<React.SetStateAction<AdjustmentsMap>>;
  selectedAction: ActionMap;
  setSelectedAction: React.Dispatch<React.SetStateAction<ActionMap>>;
  storeSelectionStep: 1 | 2;
  setStoreSelectionStep: (n: 1 | 2) => void;
  selectedStore: any;
  fetchProducts: () => Promise<void>;
  fetchAdjustmentsHistory: () => Promise<void>;

  /**
   * NEW: called when user cancels the adjustment flow; parent should
   * reset any parent-owned state (selectedStore, activeTab, inventoryMode, etc).
   */
  onCancel: () => void;
};

export default function AdjustmentFlow({
  inventoryMode,
  productsTrackable,
  selectedForStore,
  setSelectedForStore,
  adjustments,
  setAdjustments,
  selectedAction,
  setSelectedAction,
  storeSelectionStep,
  setStoreSelectionStep,
  selectedStore,
  fetchProducts,
  fetchAdjustmentsHistory,
  onCancel
}: AdjustmentFlowProps) {
  const [submitting, setSubmitting] = useState(false);

  const toggleSelectProduct = (productId: string | number) => {
    const id = normalizeId(productId);

    setSelectedForStore((prev: SelectedForStoreMap) => {
      const next: SelectedForStoreMap = { ...prev, [id]: !prev[id] };

      if (next[id] && !adjustments[id]) {
        setAdjustments((prevA: AdjustmentsMap) => ({ ...prevA, [id]: { qty: '', reason: '' } }));
      } else if (!next[id]) {
        setAdjustments((prevA: AdjustmentsMap) => {
          const n: AdjustmentsMap = { ...prevA };
          delete n[id];
          return n;
        });
        setSelectedAction((prevA: ActionMap) => {
          const n: ActionMap = { ...prevA };
          delete n[id];
          return n;
        });
      }

      if (next[id]) {
        setSelectedAction((prev: ActionMap) => ({ ...prev, [id]: prev[id] ?? (inventoryMode ?? 'addition') }));
      }

      return next;
    });
  };

  const proceedToAdjustments = () => {
    const any = Object.values(selectedForStore).some(Boolean);
    if (!any) {
      toast.error('Select at least one product to proceed', { position: 'top-center' });
      return;
    }
    setStoreSelectionStep(2);
  };

  const updateAdjustment = (productId: string | number, field: 'qty' | 'reason', value: any) => {
    const id = normalizeId(productId);
    setAdjustments((prev: AdjustmentsMap) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { qty: '', reason: '' }), [field]: value }
    }));
  };

  const submitAdjustments = async () => {
    if (!selectedStore) {
      toast.error('No store selected', { position: 'top-center' });
      return;
    }

    const storeIdApi = toApiId(selectedStore.store_id ?? (selectedStore as any).id ?? '');
    const selectedIds = Object.entries(selectedForStore).filter(([, v]) => v).map(([k]) => k);

    const adjustmentsPayload = selectedIds.map((id) => {
      const prod = productsTrackable.find((p) => normalizeId(p.product_id) === id);
      const adj = adjustments[id] ?? { qty: 0, reason: '' };
      const qtyChange = Number(adj.qty ?? 0);
      const changeType = selectedAction[id] ?? inventoryMode ?? 'addition';

      return {
        product_id: toApiId(prod?.product_id ?? id),
        store_id: storeIdApi,
        change_type: changeType,
        quantity_change: qtyChange,
        reason: String(adj.reason ?? '').trim()
      };
    });

    // validation
    for (const p of adjustmentsPayload) {
      if (!p.quantity_change || p.quantity_change <= 0) {
        toast.error('Enter a valid quantity for all selected products', { position: 'top-center' });
        return;
      }
      if (!p.reason || p.reason.length < 3) {
        toast.error('Provide a short reason for each product', { position: 'top-center' });
        return;
      }
      if (p.change_type === 'subtraction') {
        const prod = productsTrackable.find(x => String(toApiId(x.product_id)) === String(p.product_id));
        if (prod && (prod.currentStock ?? 0) < p.quantity_change) {
          toast.error(`Remove quantity for "${prod.name}" exceeds current stock`, { position: 'top-center' });
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const token = JSON.parse(localStorage.getItem('token') || 'null');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/adjustments/batch`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ adjustments: adjustmentsPayload })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit adjustments');

      toast.success('Stock adjustment submitted', { position: 'top-center' });

      // optimistic update (simplified)
      await fetchProducts();
      await fetchAdjustmentsHistory();

      // reset UI (local)
      setSelectedForStore(() => ({}));
      setAdjustments(() => ({}));
      setSelectedAction(() => ({}));
      setStoreSelectionStep(1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit adjustments', { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {storeSelectionStep === 1 ? (
        <>
          <p className="text-sm text-gray-600 mb-4">Select products to {inventoryMode === 'subtraction' ? 'remove stock from' : 'add stock to'} the store</p>

          <div className="max-h-96 overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-3 py-2">Select</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Current Stock</th>
                  <th className="px-3 py-2">Stores</th>
                </tr>
              </thead>
              <tbody>
                {productsTrackable.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-sm text-gray-500">No trackable products</td></tr>
                ) : (
                  productsTrackable.map(p => {
                    const id = normalizeId(p.product_id);
                    return (
                      <tr key={id} className={`hover:bg-gray-50 ${selectedForStore[id] ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!selectedForStore[id]}
                            onChange={() => toggleSelectProduct(p.product_id)}
                          />
                        </td>
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2">{(p.currentStock ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2">{p.stores && p.stores.length ? p.stores.map(s => s.store_name ? `${s.store_name}(${s.quantity ?? 0})` : `#${s.store_id}(${s.quantity ?? 0})`).join(', ') : '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-gray-100"
              onClick={() => {
                // local resets (keeps UI clean)
                setSelectedForStore(() => ({}));
                setAdjustments(() => ({}));

                // notify parent to perform full cancel (switch tabs / clear store, etc)
                onCancel();
              }}
            >
              Cancel
            </button>
            <button className="px-5 py-2 rounded-lg bg-blue-600 text-white" onClick={proceedToAdjustments}>Proceed</button>
          </div>
        </>
      ) : (
        <>
        
          <p className="text-sm text-gray-500 mb-4 font-medium tracking-tight">
            Provide quantity and reason for each product ({inventoryMode === 'subtraction' ? 'Removing' : 'Adding'})
          </p>

          <div className="space-y-4 max-h-96 overflow-auto pr-1">
            {Object.entries(selectedForStore).filter(([, v]) => v).map(([prodId]) => {
              const prod = productsTrackable.find((p) => normalizeId(p.product_id) === prodId);
              if (!prod) return null;
              const adj = adjustments[prodId] ?? { qty: "", reason: "" };

              return (
                <div key={prodId} className="p-5 bg-white rounded-2xl shadow-sm flex gap-6 items-center border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 tracking-tight">{prod.name}</div>
                    <div className="text-xs text-gray-400">Current stock: {(prod.currentStock ?? 0).toLocaleString()}</div>
                  </div>

                  <div className="w-28 text-right">
                    <div className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${selectedAction[prodId] === 'subtraction' || inventoryMode === 'subtraction' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedAction[prodId] === 'subtraction' || inventoryMode === 'subtraction' ? 'Removing' : 'Adding'}
                    </div>
                  </div>

                  <div className="w-28">
                    <label className="text-xs block mb-1 text-gray-500">Units</label>
                    <input
                      type="number"
                      min={1}
                      value={adj.qty as any}
                      onChange={(e) => updateAdjustment(prodId, 'qty', e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full rounded-xl px-3 py-1.5 border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition-all duration-200"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs block mb-1 text-gray-500">Reason</label>
                    <input
                      type="text"
                      value={adj.reason}
                      onChange={(e) => updateAdjustment(prodId, 'reason', e.target.value)}
                      className="w-full rounded-xl px-3 py-1.5 border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition-all duration-200"
                      placeholder="Reason for stock adjustment"
                    />
                  </div>

                  <div>
                    <button
                      className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition-colors duration-200"
                      onClick={() => {
                        setSelectedForStore((prev: SelectedForStoreMap) => ({ ...prev, [prodId]: false }));
                        setAdjustments((prev: AdjustmentsMap) => {
                          const n = { ...prev };
                          delete n[prodId];
                          return n;
                        });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setStoreSelectionStep(1)}>Back</button>
            <button
              className={`px-5 py-2 rounded-lg ${inventoryMode === 'subtraction' ? 'bg-red-600' : 'bg-blue-600'} text-white`}
              onClick={submitAdjustments}
            >
              {inventoryMode === 'subtraction' ? 'Confirm Removal' : 'Confirm Addition'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
