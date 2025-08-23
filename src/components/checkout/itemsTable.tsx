// ItemsTable.tsx (updated)
'use client';
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { CartItem } from '../types';

type Props = {
  items: CartItem[];
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  formatPrice: (v: number) => string;
  subTotal: number;
  /** Sum of item-level discounts only (NOT including global discount) */
  itemDiscountTotal: number;
  total: number;
  disabledControls?: boolean; // new: when true hide +/- and remove
  saleCompleted?: boolean; // new: show success banner
};

export default function ItemsTable({
  items,
  updateQuantity,
  removeItem,
  formatPrice,
  subTotal,
  itemDiscountTotal,
  total,
  disabledControls = false,
  saleCompleted = false,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-h-[600px] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <div className="text-sm text-gray-500">{items.length} item(s)</div>
        </div>

        {saleCompleted && (
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 px-3 py-2 text-green-800 font-medium shadow-sm">
              ✅ Sale successful
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No items to charge.</div>
      ) : (
        <>
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600 border-b border-gray-200">
                <th className="py-3 px-2 w-[44px]">#</th>
                <th className="py-3 px-2">ITEM</th>
                <th className="py-3 px-2 text-right">UNIT PRICE</th>
                <th className="py-3 px-2 text-center">QUANTITY</th>
                <th className="py-3 px-2 text-right">DISCOUNT</th>
                <th className="py-3 px-2 text-right">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it, idx) => {
                const qty = it.quantity ?? 1;
                const unit = it.price ?? 0;
                const lineOriginal = unit * qty;
                const itemDiscount = it.discount ?? 0;
                const lineTotal = Math.max(0, lineOriginal - itemDiscount);

                let discountLabel = 'N/A';
                if (itemDiscount > 0) {
                  if (it.isDiscountPercentage) {
                    const pct = lineOriginal > 0 ? (itemDiscount / lineOriginal) * 100 : 0;
                    discountLabel = `${pct.toFixed(2)}% (${formatPrice(itemDiscount)})`;
                  } else {
                    discountLabel = formatPrice(itemDiscount);
                  }
                }

                return (
                  <tr key={`${it.product_id ?? 'noid'}-${it.variant_id ?? 'novariant'}-${idx}`} className="border-b border-gray-200 align-top">
                    <td className="py-4 px-1 align-top text-sm text-gray-700 font-medium">{idx + 1}</td>
                    <td className="py-4 px-1 align-top">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-400">{it.barcode ?? ''}</div>
                      {it.variant_id && <div className="text-xs text-gray-400 mt-1">Variant: {it.variant_id}</div>}
                      {it.is_quick_sale ? <div className="text-xs text-indigo-600 mt-1">Quick sale</div> : null}
                    </td>
                    <td className="py-4 px-2 align-top text-right">{formatPrice(unit)}</td>
                    <td className="py-4 px-2 align-top text-center">
                      <div className="inline-flex items-center gap-2">
                        {disabledControls ? (
                          <div className="w-10 text-center text-sm font-medium">x {qty}</div>
                        ) : (
                          <>
                            {saleCompleted ? (
                          <div className="w-10 text-center text-sm font-medium">x {qty}</div>
                        ) : (
                          <>
                            <button
                              onClick={() => updateQuantity(it.product_id, -1)}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                              title="Decrease"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>

                            <div className="w-10 text-center text-sm font-medium">x {qty}</div>

                            <button
                              onClick={() => updateQuantity(it.product_id, +1)}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                              title="Increase"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 align-top text-right text-sm text-gray-700">{discountLabel}</td>
                    <td className="py-4 px-2 align-top text-right font-semibold">{formatPrice(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals block under table */}
          <div className="mt-6 max-w-md ml-auto space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Sub Total:</span>
              <span className="font-medium">{formatPrice(subTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Items Discount:</span>
              <span className="font-medium">{formatPrice(itemDiscountTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold mt-2">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}