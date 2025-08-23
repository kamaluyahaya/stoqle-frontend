// src/components/CartPanel.tsx
'use client';
import React, { useMemo } from 'react';
import { ShoppingCart, PlusCircle, MinusCircle, Tag, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { Customer, Product } from '../types';

type Props = {
  cartItems: Product[];
  selectedCustomerId?: string | number;
  selectedCustomer: Customer | null;
  onRemove: (productId: string) => void;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onAddDiscount: (productId: string) => void;
  onClearSale: () => void;
  onCharge: () => void;
  customers: Customer[];
  customerSearch: string;
  setCustomerSearch: (s: string) => void;
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (b: boolean) => void;
  chooseCustomer: (c: Customer) => void;
  openAddCustomer: () => void;
};

export default function CartPanel({
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  onAddDiscount,
  onClearSale,
  onCharge,
  customers,
  customerSearch,
  setCustomerSearch,
  showCustomerDropdown,
  setShowCustomerDropdown,
  chooseCustomer,
  openAddCustomer,
  selectedCustomerId,
  selectedCustomer, // <-- add this
}: Props) {
  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (acc, curr) => acc + curr.price * (curr.quantity || 1) - (curr.discount || 0),
        0
      ),
    [cartItems]
  );

  function getInitials(name?: string) {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  }

  return (
    <div className="sticky top-10 bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 max-h-[80vh] overflow-y-auto w-full">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" /> Cart ({cartItems.length})
      </h2>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">Customer</label>
        <div className="mt-2 relative">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="relative">
                <input
  type="text"
  placeholder="Search customer or choose walk-in"
  value={selectedCustomer ? (selectedCustomer.customer_name ?? '') : customerSearch}
  onChange={(e) => {
    // if the user types while a customer is selected we should clear selection
    if (selectedCustomer) {
      // clear selection so typing becomes a new search
      // call chooseCustomer with walk-in? or communicate to parent to clear
      // simpler: clear the selection UI state here by invoking setCustomerSearch and show dropdown
    }
    setCustomerSearch(e.target.value);
    setShowCustomerDropdown(true);
  }}
  onFocus={() => {
    if (selectedCustomerId) setCustomerSearch('');
    setShowCustomerDropdown(true);
  }}
  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300"
/>



                {showCustomerDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-56 overflow-auto">
                    <button
                      onClick={() =>
                        chooseCustomer({
                          user_id: 'walk-in',
                          customer_name: 'Walk-in customer',
                        } as Customer)
                      }
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                        WI
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Walk-in customer</div>
                        <div className="text-xs text-gray-400">No contact info</div>
                      </div>
                    </button>

                    <div className="border-t border-gray-100" />

                    {customers.length > 0 ? (
                      customers.map((c) => (
                        <button
                          key={c.user_id}
                          onClick={() => chooseCustomer(c)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                            {getInitials(c.customer_name)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{c.customer_name || '-'}</div>
                            <div className="text-xs text-gray-400">{c.email ?? c.phone ?? ''}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No customers</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={openAddCustomer}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              + New
            </button>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-sm mt-4 justify-center text-center">No items in cart.</p>
      ) : (
        <div className="mt-5 border border-gray-200 rounded-xl bg-white flex flex-col ">
          <ul className="overflow-y-auto max-h-80 divide-y divide-gray-100">
            {cartItems.map((item, idx) => {
              const originalPrice = item.price * (item.quantity || 1);
              const discountedPrice = originalPrice - (item.discount || 0);

              return (
                <li key={idx} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{formatPrice(discountedPrice)}</span>
                      <button onClick={() => onRemove(item.product_id)} className="text-red-500 hover:text-red-700">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{item.quantity} × {formatPrice(item.price)}</span>
                    {item.discount && <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>}
                  </div>

                  <div className="flex justify-between items-center">
                    <button className="flex items-center text-blue-500 text-sm hover:underline gap-1" onClick={() => onAddDiscount(item.product_id)}>
                      <Tag className="w-4 h-4" /> Add discount
                    </button>

                    <div className="flex items-center gap-2">
                      <button onClick={() => onDecrease(item.product_id)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                        <MinusCircle className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => onIncrease(item.product_id)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                        <PlusCircle className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="p-4 border-t border-gray-200 justify-center text-center">
            <button onClick={onClearSale} className=" rounded-full justify-center text-red-500 font-semibold transition">
              Clear Sale
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={onCharge}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg transition"
          disabled={cartItems.length === 0}
        >
          Charge {formatPrice(totalAmount)}
        </button>
      </div>
    </div>
  );
}
