'use client';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Product } from '@/components/types/product';

export default function AllProductsView({
  filtered,
  loading,
  totalProducts,
  totalStock,
  openProductDetails,
  handleAddStore,
  handleRemoveStore,
  formatCustomDate,
  setSearchTerm
}: {
  filtered: Product[];
  loading: boolean;
  totalProducts: number;
  totalStock: number;
  openProductDetails: (p: Product) => void;
  handleAddStore: (p: Product) => void;
  handleRemoveStore: (p: Product) => void;
  formatCustomDate: (d: any) => string;
  setSearchTerm: (s: string) => void;
}) {
  const renderCurrentStockCell = (item: Product) => {
    const total = Number(item.currentStock ?? 0);
    const low = Number(item.raw?.low_stock_alert ?? item.raw?.low_stock_alert ?? 0); // overall low fallback (if present on raw)
    const isOut = total <= 0;
    const isLow = !isOut && low > 0 && total <= low;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{total.toLocaleString()}</span>
        {/* {isOut ? (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-100">Out</span>
        ) : isLow ? (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-100">Low</span>
        ) : null} */}
      </div>
    );
  };

  const renderStoreRow = (s: { store_id: number; store_name?: string; quantity: number; low_stock_alert: number }, item: Product) => {
    const qty = Number(s.quantity ?? 0);
    const low = Number(s.low_stock_alert ?? 0);

    const isOut = qty <= 0;
    const isLow = !isOut && low > 0 && qty <= low;

    return (
      <div key={s.store_id} className="flex items-center justify-between gap-2 w-full">
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {s.store_name ? s.store_name : `#${s.store_id}`}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            {qty.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOut ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-100">
              Out of stock
            </span>
          ) : isLow ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-100">
              Low stock
            </span>
          ) : (
            <span className="">
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto px-4 sm:px-0 mb-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search products..."
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl pl-12 pr-4 py-3 bg-white placeholder-gray-400 text-gray-900 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </motion.div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-4">
        <div className="flex gap-6 mb-3">
          <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{totalProducts}</span>
            <span className="text-gray-500 uppercase text-sm tracking-wide mt-1">Total Products</span>
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{totalStock}</span>
            <span className="text-gray-500 uppercase text-sm tracking-wide mt-1">Total Stock Managed</span>
          </div>
        </div>

          <table className="min-w-full rounded-2xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-lg border border-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">Store(s)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider uppercase">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 tracking-wider uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length ? (
                filtered.map((item, idx) => (
                  <motion.tr
                    key={String(item.product_id) ?? idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => openProductDetails(item)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name ?? "-"}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {renderCurrentStockCell(item)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 space-y-3">
                      {item.stores && item.stores.length ? item.stores.map(s => (
                        <div key={s.store_id} className="mb-2">
                          {renderStoreRow(s, item)}
                        </div>
                      )) : '-'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">{formatCustomDate(item.last_updated ?? item.raw?.updated_at)}</td>

                    <td className="px-6 py-4 text-right flex items-center gap-2 justify-end">
                      {item.raw?.track_stock === 1 && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleAddStore(item); }} className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition">Add Stock</button>
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveStore(item); }} className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition">Remove Stock</button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-12 text-center"><div className="text-4xl mb-2 text-gray-300">📦</div><p className="text-gray-500 text-sm">No inventory items found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
    </>
  );
}
