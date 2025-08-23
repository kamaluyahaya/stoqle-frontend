'use client';

import { ProductDetails } from '@/components/types/product';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageX, X } from 'lucide-react';
import { format } from 'date-fns';
type Props = {
  show: boolean;
  onClose: () => void;
  product: ProductDetails;
};

export default function ProductDetailsDialog({ show, onClose, product }: Props) {

  function DetailRow({ label, value }: { label: string; value: string | number }) {
  let displayValue = value;

  // Add ₦ for price fields
  if (label.toLowerCase().includes('price') && typeof value === 'number') {
    displayValue = `₦${value.toLocaleString()}`;
  }

  // Format date
  if (label.toLowerCase().includes('last updated') && value) {
    const date = new Date(value);
    displayValue = format(date, 'do MMM, yyyy hh:mma').toWellFormed();
  }

  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{displayValue}</span>
    </div>
  );
}
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-xl relative overflow-hidden"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500">Product Details Overview</p>
            </div>

            {/* Product Info */}

            {/* Usage */}
            <div className="space-y-3">
              <DetailRow label="Total Quantity" value={product.totalQuantity} />
              <DetailRow label="Cost Price" value={product.costPrice} />
              <DetailRow label="Sale Price" value={product.salePrice} />
              <DetailRow label="Category" value={product.category} />
              <DetailRow label="Last Updated" value={product.lastUpdated} />
              <DetailRow label="SKU / Barcode" value={product.sku} />
            </div>

            {/* Store Details */}
            <h3 className="mt-6 text-lg font-semibold">Store Details</h3>
            <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden">
              {product.stores && product.stores.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2">Store</th>
                      <th className="text-left px-4 py-2">Qty</th>
                      <th className="text-left px-4 py-2">Reorder Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.stores.map((store, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        <td className="px-4 py-2">{store.store}</td>
                        <td className="px-4 py-2">{store.qty}</td>
                        <td className="px-4 py-2">{store.reorderLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50">
                  <PackageX size={40} className="text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">No stock data available</p>
                  <p className="text-gray-400 text-sm mt-1">Stock management is not enabled for this product.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
