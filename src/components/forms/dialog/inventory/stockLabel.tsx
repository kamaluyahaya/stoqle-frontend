'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type Product = {
  product_id: number;
  name?: string | null;
  barcode?: string | null;
  price?: any;
  raw?: any;
  current_stock?: number; // Added current stock
};

export default function LabelPreviewDialog({
  show,
  onClose,
  products,
  showName = true,
  showSKU = true,
  showPrice = true,
  onPrint,
}: {
  show: boolean;
  onClose: () => void;
  products: Product[];
  showName?: boolean;
  showSKU?: boolean;
  showPrice?: boolean;
  onPrint: () => void;
}) {
  const formatPrice = (p: any) => {
    if (p == null || p === '') return '';
    const n = Number(p);
    if (Number.isFinite(n)) {
      return n.toLocaleString(undefined, {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      });
    }
    return String(p);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
        //   className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xl flex items-center justify-center p-6"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <motion.div
            className="relative max-w-4xl w-full bg-white rounded-[1.75rem] shadow-[0_8px_40px_rgba(0,0,0,0.1)] flex flex-col"
            
            style={{ maxHeight: '80vh' }} // Limit modal height
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-900">Label Preview</h2>
                <p className="text-sm text-gray-500 mt-1">How the printed label will appear</p>
              </div>
             <button
                           onClick={onClose}
                           className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
                         >
                           <X size={16} />
                         </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-400 py-10 text-sm">
                    No products selected
                  </div>
                ) : (
                  products.map((p) => (
                    <div
                      key={p.product_id}
                      className="border border-gray-200 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col justify-between h-36"
                    >
                      {showSKU && (
                        <div className="text-xs text-gray-400 mb-1">{p.barcode ?? ''}</div>
                      )}
                      {showName && (
                        <div className="font-medium text-sm truncate text-gray-900">{p.name}</div>
                      )}
                      {showPrice && (
                        <div className="text-base font-semibold text-gray-800">
                          {formatPrice(p.price ?? p.raw?.price)}
                        </div>
                      )}
                      {/* Current Stock */}
                      {p.current_stock != null && (
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: <span className="font-medium text-gray-700">{p.current_stock}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={onPrint}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
              >
                Print
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
