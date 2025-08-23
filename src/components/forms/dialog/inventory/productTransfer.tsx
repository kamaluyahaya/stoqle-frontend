'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/components/types/product';

type Store = {
  store_id: number | string;
  store_name?: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  visibleProducts: Product[];
  sourceStore?: Store | null;
  normalizeId: (id: number | string) => string;
  getQtyAtStore: (product: Product, store_id: number | string) => number;
  storeSummaryForProduct: (product: Product) => string;
  initialSelected?: Record<string, number>;
  onInstantSelect: (items: { product_id: number | string; quantity: number }[]) => void;
  onAddSelected: (items: { product_id: number | string; quantity: number }[]) => void;
};

export default function SelectProductsDialog({
  show,
  onClose,
  visibleProducts,
  sourceStore = null,
  normalizeId,
  getQtyAtStore,
  storeSummaryForProduct,
  initialSelected = {},
  onAddSelected,
  onInstantSelect,
}: Props) {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [dialogQtys, setDialogQtys] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (show) {
      setSelectedItems({ ...initialSelected });
      const seeded: Record<string, string> = {};
      Object.entries(initialSelected).forEach(([k, v]) => {
        seeded[k] = String(v);
      });
      setDialogQtys(seeded);
      setSearchQuery('');
    }
  }, [show, initialSelected]);

  const toggleSelectProduct = (pidKey: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[pidKey] !== undefined) {
        delete next[pidKey];
      } else {
        const cur = dialogQtys[pidKey];
        const qty = cur === '' || cur === undefined ? 1 : Number(cur);
        next[pidKey] = qty;
        setDialogQtys((d) => ({ ...d, [pidKey]: String(qty) }));
      }
      return next;
    });
  };

  const updateDialogQty = (pidKey: string, raw: string) => {
    if (raw === '') {
      setDialogQtys((prev) => ({ ...prev, [pidKey]: '' }));
      setSelectedItems((prev) => {
        if (prev[pidKey] !== undefined) {
          return { ...prev, [pidKey]: 0 };
        }
        return prev;
      });
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) return;
    setDialogQtys((prev) => ({ ...prev, [pidKey]: String(num) }));
    setSelectedItems((prev) => {
      if (prev[pidKey] !== undefined) {
        return { ...prev, [pidKey]: num };
      }
      return prev;
    });
  };

  const handleQtyChangeWithClamp = (product: Product, pidKey: string, raw: string) => {
    const available = sourceStore ? getQtyAtStore(product, sourceStore.store_id) : Infinity;
    if (raw === '') {
      updateDialogQty(pidKey, '');
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) return;
    if (sourceStore && num > available) {
      setDialogQtys((prev) => ({ ...prev, [pidKey]: String(available) }));
      setSelectedItems((prev) =>
        prev[pidKey] !== undefined ? { ...prev, [pidKey]: available } : prev
      );
    } else {
      updateDialogQty(pidKey, String(num));
    }
  };

  const addSelected = (shouldClose = true) => {
    const payload: { product_id: number | string; quantity: number }[] = [];
    for (const [pidKey, qty] of Object.entries(selectedItems)) {
      const product = visibleProducts.find((p) => normalizeId(p.product_id) === pidKey);
      if (!product) continue;
      const q = Number(dialogQtys[pidKey] ?? qty ?? 0) || 0;
      if (q <= 0) continue;
      payload.push({ product_id: product.product_id, quantity: q });
    }
    onAddSelected(payload);
    if (shouldClose) {
      onClose();
    }
  };

  // Filtered list
  const filteredProducts = visibleProducts.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.name ?? '').toLowerCase().includes(q) ||
      String(p.product_id).toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          // className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"

          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/95 p-6 rounded-3xl w-full max-w-3xl shadow-lg relative max-h-[90vh] flex flex-col"
            // className="bg-white/95 p-6 rounded-3xl w-full max-w-3xl shadow-lg relative max-h-[95vh] flex flex-col"

            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <h2 className="text-xl font-semibold mb-2">Select products to transfer</h2>
            {sourceStore && (
              <p className="text-sm text-gray-500 mb-4">
                Choose items from <strong>{sourceStore.store_name}</strong> to transfer.
              </p>
            )}

            {/* Search */}
            <div className="mb-4 sticky top-0 bg-white/95 z-10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-300 bg-gray-50"
              />
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-auto space-y-3 pr-1">
              {filteredProducts.length === 0 ? (
                <div className="text-sm text-gray-500">No matching products</div>
              ) : (
                filteredProducts.map((p) => {
                  const pid = normalizeId(p.product_id);
                  const availableInSource = sourceStore
                    ? getQtyAtStore(p, sourceStore.store_id)
                    : 0;
                  const checked = selectedItems[pid] !== undefined;

                  return (
                    <div
                      key={pid}
                      onClick={() => {
                        if (availableInSource <= 0) return;
                        toggleSelectProduct(pid);
                        const updatedPayload: { product_id: number | string; quantity: number }[] =
                          [];
                        const newSelected = { ...selectedItems };
                        if (checked) {
                          delete newSelected[pid];
                        } else {
                          const qty = dialogQtys[pid] ? Number(dialogQtys[pid]) : 1;
                          newSelected[pid] = qty;
                        }
                        for (const [idKey, qty] of Object.entries(newSelected)) {
                          const prod = visibleProducts.find(
                            (p) => normalizeId(p.product_id) === idKey
                          );
                          if (prod && qty > 0) {
                            updatedPayload.push({ product_id: prod.product_id, quantity: qty });
                          }
                        }
                        onInstantSelect(updatedPayload);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition ${
                        availableInSource <= 0
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : checked
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{p.name ?? 'Unnamed product'}</div>
                        <div className="text-xs text-gray-500">{storeSummaryForProduct(p)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all ${
                            checked
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {checked && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        {/* Qty input */}
                        <input
                          type="number"
                          min={0}
                          value={dialogQtys[pid] ?? ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleQtyChangeWithClamp(p, pid, e.target.value)}
                          className="w-20 rounded-xl px-2 py-1 border border-gray-200 focus:ring-2 focus:ring-blue-300"
                          placeholder="units"
                        />
                        {sourceStore && (
                          <div className="text-xs text-gray-500">
                            Available: {availableInSource}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => addSelected(true)}
                className="px-4 py-2 rounded-xl bg-gray-100"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
