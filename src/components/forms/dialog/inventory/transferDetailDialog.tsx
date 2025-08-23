'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, PackageX } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';
import { ApiTransfer } from '@/components/types/inventory';

/** Transfer item + ApiTransfer types (aligned with your panel) */
export type TransferItem = {
  product_id?: number | string;
  product_name?: string;
  qty?: number;
  quantity?: number;
  price?: string | number;
  category?: string;
  barcode?: string;
  receipt_date?: string;
};


type Props = {
  show: boolean;
  onClose: () => void;
  transfer?: ApiTransfer | null | undefined;
  onAcceptOrder?: (t?: ApiTransfer) => void;
  onHoldOrder?: (t?: ApiTransfer) => void;
  getStoreName?: (id?: number | string) => string;
  accepting?: boolean;
  holding?: boolean;
};

export default function TransferDetailsDialog({
  show,
  onClose,
  transfer,
  onAcceptOrder,
  onHoldOrder,
  getStoreName,
  accepting = false,
  holding = false,
}: Props) {
  if (!transfer) return null;

  function formatPrice(v?: string | number) {
    if (v == null || v === '') return '-';
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]+/g, ''));
    if (Number.isNaN(n)) return String(v);
    return `₦${n.toLocaleString()}`;
  }

  function formatDate(v?: string) {
    if (!v) return '-';
    try {
      return format(new Date(v), 'do MMM, yyyy hh:mma');
    } catch {
      return v;
    }
  }
function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-sm">{value ?? '-'}</span>
    </div>
  );
}


  const sourceName =
    (getStoreName ? getStoreName(transfer.source_store_id) : undefined) ??
    (transfer.source_store_id ? `#${transfer.source_store_id}` : '-');
  const destName =
    (getStoreName ? getStoreName(transfer.destination_store_id) : undefined) ??
    (transfer.destination_store_id ? `#${transfer.destination_store_id}` : '-');

  const status = (transfer.status ?? '').toLowerCase();
  const busy = accepting || holding;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white shadow hover:scale-105 transition-transform"
            >
              <X size={16} />
            </button>

            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Transfer #{transfer.transfer_id}
              </h2>
              <p className="text-sm text-gray-500">{transfer.transfer_type ?? '-'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <DetailRow label="Source Store" value={sourceName} />
  <DetailRow label="Destination Store" value={destName} />
  <DetailRow label="Ordered By" value={transfer.created_by_name ?? '-'} />

  <DetailRow
    label="Status"
    value={
      (() => {
        let statusLabel = "-";
        let statusColor = "bg-gray-100 text-gray-700";

        if (transfer.status === "pending") {
          statusLabel = "In transit";
          statusColor = "bg-blue-100 text-blue-700";
        } else if (transfer.status === "completed") {
          statusLabel = "Received";
          statusColor = "bg-green-100 text-green-700";
        } else if (transfer.status === "cancelled") {
          statusLabel = "Cancelled";
          statusColor = "bg-red-100 text-red-700";
        } else if (transfer.status) {
          statusLabel = transfer.status;
        }

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        );
      })()
    }
  />

  <DetailRow label="Transfer Date" value={formatDate(transfer.transfer_date ?? transfer.created_at)} />
  <DetailRow label="Received Date" value={formatDate(transfer.updated_at)} />
</div>


            <h3 className="mt-6 text-lg font-semibold">Items</h3>
            <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden">
              {transfer.items && transfer.items.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2">No.</th>
                      <th className="text-left px-4 py-2">Item</th>
                      <th className="text-left px-4 py-2">SKU</th>
                      <th className="text-left px-4 py-2">Category</th>
                      <th className="text-left px-4 py-2">Units Sent</th>
                      <th className="text-left px-4 py-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfer.items.map((it, i) => {
                      const qty = it.quantity ?? it.qty ?? 0;
                      return (
                        <tr key={i} className="odd:bg-white even:bg-gray-50">
                          <td className="px-4 py-2 align-top">{i + 1}</td>
                          <td className="px-4 py-2 align-top">{it.product_name ?? '-'}</td>
                          <td className="px-4 py-2 align-top">{it.barcode ?? '-'}</td>
                          <td className="px-4 py-2 align-top">{it.category ?? '-'}</td>
                          <td className="px-4 py-2 align-top">{typeof qty === 'number' ? qty.toLocaleString() : qty}</td>
                          <td className="px-4 py-2 align-top">{formatPrice(it.price)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50">
                  <PackageX size={40} className="text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">No items available</p>
                </div>
              )}
            </div>

            {/* Actions: only show for pending */}
            {status === 'pending' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => onAcceptOrder?.(transfer)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white transition ${
                    accepting ? 'bg-blue-600 cursor-wait' : 'bg-blue-500 hover:bg-blue-700'
                  }`}
                  disabled={busy}
                  aria-disabled={busy}
                >
                  {accepting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"></circle>
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                      </svg>
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <span>Accept Order</span>
                  )}
                </button>

                <button
                  onClick={() => onHoldOrder?.(transfer)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white transition ${
                    holding ? 'bg-black cursor-wait' : 'bg-black hover:bg-gray-800'
                  }`}
                  disabled={busy}
                  aria-disabled={busy}
                >
                  {holding ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"></circle>
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                      </svg>
                      <span>Holding...</span>
                    </>
                  ) : (
                    <span>Hold Order</span>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
