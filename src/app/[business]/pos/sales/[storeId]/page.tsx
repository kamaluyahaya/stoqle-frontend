'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

import useProducts from '@/hooks/useProducts';
import useCustomers from '@/hooks/useCustomers';

// dialogs (same as your original imports; keep these components)
import DiscountDialog from '@/components/forms/dialog/discountDialog';
import QuickSaleDialog from '@/components/forms/dialog/quickSaleForm';
import BarcodeScannerModal from '@/components/product/scannerBarcode';
import SaveTicketDialog from '@/components/forms/dialog/dialogSaveTicket';
import OpenTicketDialog from '@/components/forms/dialog/dialogOpenTicket';
import CustomerForm from '@/components/forms/dialog/customerDialog';
import { toast } from 'sonner';
import { CartItem, Category, CurrentSale, Customer, Product, User } from '@/components/types';
import CartPanel from '@/components/product/cardPanel';
import ProductCard from '@/components/product/productCard';


const DEFAULT_STORE_ID = 'all-products';
export default function SalesPage() {
  const params = useParams();
  const router = useRouter();
  const storeid = params.storeId as string;
  const businessSlug = (params?.business as string) ?? 'default-slug';

  const { products, loading, fetchProducts } = useProducts();
  const { customers, fetchCustomers } = useCustomers();


  // const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<Product | null>(null);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [barcode, setBarcode] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


  const [categories, setCategories] = useState<Category[]>([]);
  // default to 'all' so all products show initially
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

  // product search state (new)
  const [productSearch, setProductSearch] = useState<string>('');

  // user
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // initial product load
  useEffect(() => {
    fetchProducts(storeid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeid]);

  // fetch categories (simple example)
useEffect(() => {
  (async () => {
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // normalize every category to have a consistent id string
        const normalized = data.map((c: any) => ({
          ...c,
          _normId: String(c.category_id ?? c.id ?? c._id ?? c.categoryId ?? ''),
        }));
        setCategories(normalized);
        setSelectedCategory('all');
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  })();
}, []);


  // barcode scanner handling
  useEffect(() => {
    if (!barcode) return;
    const matched = products.find((p) => p.barcode === barcode);
    if (matched) {
      addToCart(matched);
      toast.success(`✅ ${matched.name} added to cart via scan`);
    } else {
      toast.error(`❌ No product found with barcode: ${barcode}`);
    }
    setBarcode('');
  }, [barcode, products]);

  // customers already fetched by hook; expose manual refresh
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cart helpers
  const totalAmount = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.price * (curr.quantity || 1) - (curr.discount || 0), 0),
    [cartItems]
  );




// set cartItems typing
// updated addToCart — preserves/merges is_quick_sale and keeps variant_id
const addToCart = (product: Product, isQuickSale = false) => {
  setCartItems((prev) => {
    // 🔑 now check product_id + variant_id for uniqueness
    const idx = prev.findIndex(
      (it) =>
        it.product_id === product.product_id &&
        (it.variant_id ?? null) === (product.variant_id ?? null)
    );

    if (idx !== -1) {
      const updated = [...prev];
      const item = updated[idx];

      const mergedQuick = Math.max(
        item.is_quick_sale || 0,
        isQuickSale ? 1 : 0
      ) as 0 | 1;

      updated[idx] = {
        ...item,
        quantity: (item.quantity || 1) + 1,
        is_quick_sale: mergedQuick,
        variant_id: product.variant_id ?? item.variant_id ?? null, // 🔑 carry variant_id
      };
      return updated;
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        is_quick_sale: isQuickSale ? 1 : 0,
        variant_id: product.variant_id ?? null, // 🔑 ensure added
      };
      return [...prev, newItem];
    }
  });

  toast.success(`${product.name} added to cart`);
};

  // handleQuickCharge now uses addToCart and marks as quick sale
  const handleQuickCharge = (amount: number) => {
    const quickItem: Product = {
      product_id: uuidv4(),
      name: 'Quick Sale Item',
      price: amount,
      category_id: 0,
      barcode: '',
      variant_id: null, // 🔑 quick sale has no variant
      image: '',
    };

    addToCart(quickItem, true);
    toast.success(`Added Quick Sale Item: ₦${amount.toFixed(2)}`);
  };

  // handleCharge — CurrentSale.items can be CartItem[]
  const handleCharge = () => {
    if (cartItems.length === 0) return;

const customerPayload: Customer = selectedCustomer ?? {
  user_id: 'walk-in',
  customer_name: 'Walk-in customer',
  email: null,
  phone: null,
};

const storePayload = storeid ?? DEFAULT_STORE_ID;

const currentSale: CurrentSale = {
  items: cartItems.map((it) => ({
    ...it,
    variant_id: it.variant_id ?? null,
  })),
  customer: customerPayload,          // <-- full Customer object here
  store_id: storePayload,
  metadata: {
    savedAt: new Date().toISOString(),
    businessSlug,
  },
};

localStorage.setItem('currentSale', JSON.stringify(currentSale));
router.push(`/${businessSlug}/pos/checkout`);

}
  

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
    toast.info('Item removed from cart');
  };

  const handleIncreaseQuantity = (productId: string) => {
    setCartItems((prev) => prev.map((it) => (it.product_id === productId ? { ...it, quantity: (it.quantity || 1) + 1 } : it)));
  };

  const handleDecreaseQuantity = (productId: string) => {
    setCartItems((prev) => prev.map((it) => (it.product_id === productId ? { ...it, quantity: it.quantity && it.quantity > 1 ? it.quantity - 1 : 1 } : it)));
  };


  const handleClearSale = () => {
    setCartItems([]);
    toast.info('Sale cleared');
  };

  // Discounts
  const handleAddDiscount = (productId: string) => {
    const product = cartItems.find((i) => i.product_id === productId);
    if (!product) return;
    setSelectedProductForDiscount(product);
    setShowDiscountDialog(true);
  };

  const handleApplyDiscount = (value: number, isPercentage: boolean) => {
    const prod = selectedProductForDiscount;
    if (!prod) return;

    const qty = prod.quantity || 1;
    const originalTotal = prod.price * qty;

    if (isPercentage) {
      if (value <= 0 || value > 100) {
        toast.error('❌ Percentage must be between 0% and 100%');
        return;
      }
      const discountAmt = prod.price * (value / 100); // amount per unit
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === prod.product_id ? { ...item, discount: discountAmt * (item.quantity || 1), isDiscountPercentage: true } : item
        )
      );
    } else {
      if (value <= 0 || value > originalTotal) {
        toast.error(`❌ Discount can’t exceed ₦${originalTotal.toFixed(2)}`);
        return;
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === prod.product_id ? { ...item, discount: value, isDiscountPercentage: false } : item
        )
      );
    }

    setShowDiscountDialog(false);
    setSelectedProductForDiscount(null);
  };

  const handleClearDiscount = (productId: string) => {
    setCartItems((prev) => prev.map((item) => (item.product_id === productId ? { ...item, discount: 0, isDiscountPercentage: false } : item)));
  };

  // tickets
const handleSaveTicketFromDialog = (name: string) => {
  try {
    const userRaw = localStorage.getItem('user');
    const u = userRaw ? JSON.parse(userRaw) : null;
    const businessId = u?.business_id || null;

    const ticketsRaw = localStorage.getItem('savedTickets');
    const allTickets = ticketsRaw ? JSON.parse(ticketsRaw) : {};

    console.log(allTickets);

    const ticketId = uuidv4();
    const ticketTotal = cartItems.reduce(
      (acc, curr) => acc + curr.price * (curr.quantity || 1) - (curr.discount || 0),
      0
    );

    const newTicket = {
      id: ticketId,
      name,
      items: cartItems,
      total: ticketTotal,
      status: 'saved',
      createdAt: new Date().toISOString(),
      businessId,
    };

    // put ticket in the right business bucket
    const businessTickets = allTickets[businessId] || [];
    allTickets[businessId] = [newTicket, ...businessTickets];

    localStorage.setItem('savedTickets', JSON.stringify(allTickets));
    toast.success('✅ Ticket saved');
  } catch (err: any) {
    console.error(err);
    toast.error('❌ Failed to save ticket');
  }
};



  const handleOpenSavedTicket = (ticket: any) => {
    setCartItems(ticket.items || []);
    toast.success(`✅ Loaded ticket "${ticket.name || 'Untitled'}"`);
  };

  const getSavedTickets = () => {
  const userRaw = localStorage.getItem('user');
  const u = userRaw ? JSON.parse(userRaw) : null;
  const businessId = u?.business_id || null;

  const savedRaw = localStorage.getItem('savedTickets');
  const allTickets = savedRaw ? JSON.parse(savedRaw) : {};

  // safely return array for this business
  return allTickets[businessId] || [];
};


const [tickets, setTickets] = useState<any[]>([]);

useEffect(() => {
  getSavedTickets()
  // const ticketsForBusiness = getSavedTickets();
  // setTickets(ticketsForBusiness);
  setTickets(getSavedTickets());

}, []);
  // customer selection
const chooseCustomer = (c: Customer) => {
  // normalize to the same shape your checkout expects
  const normalized: Customer = {
    user_id: String(c.user_id),
    customer_name: c.customer_name ?? c.customer_name ?? 'Unnamed customer',
    email: c.email ?? null,
    phone: c.phone ?? null,
    // keep other Customer fields if needed
  } as Customer;

  setSelectedCustomer(normalized);
  setSelectedCustomerId(normalized.user_id);
  setCustomerSearch(normalized.customer_name || '');
  setShowCustomerDropdown(false);
};

  const openAddCustomer = () => setShowAddCustomerDialog(true);

  
  // ----------------------------
  // New: filter products by selected category and the search field
  // ----------------------------
 const filteredProducts = useMemo(() => {
    let list = Array.isArray(products) ? products.slice() : [];

    // filter by category only if a specific category is selected (not 'all')
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p: any) => {
        const prodCat = p.category_id ?? p.category_id?.category_id ?? null;
        return String(prodCat) === String(selectedCategory);
      });
    }

    // filter by search query if provided
    const q = productSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((p: any) => {
        const name = String(p.name ?? p.product_name ?? '').toLowerCase();
        const barcode = String(p.barcode ?? '').toLowerCase();
        const sku = String(p.sku ?? p.code ?? '').toLowerCase();
        return name.includes(q) || barcode.includes(q) || sku.includes(q);
      });
    }

    // --- SORT: ensure ascending order (by product name) ---
    // Default: alphabetical by `name` (falls back to `product_name`).
    // This keeps UI predictable. Change the comparator if you prefer sorting by price, SKU, etc.
    list.sort((a: any, b: any) => {
      const aName = String(a.name ?? a.product_name ?? '').toLowerCase();
      const bName = String(b.name ?? b.product_name ?? '').toLowerCase();
      return aName.localeCompare(bName, undefined, { numeric: true });
    });

    return list;
  }, [products, selectedCategory, productSearch]);

  useEffect(() => {
  if (products?.length) {
    console.log('sample product for debugging:', JSON.stringify(products[0], null, 2));
  }
}, [products]);

  return (
    <>
      <DiscountDialog
        show={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
        productName={selectedProductForDiscount?.name}
        initialValue={selectedProductForDiscount?.discount}
        initialIsPercentage={selectedProductForDiscount?.isDiscountPercentage}
        onApply={handleApplyDiscount}
        onClear={() => {
          if (selectedProductForDiscount) handleClearDiscount(selectedProductForDiscount.product_id);
        }}
      />

      <QuickSaleDialog show={showQuickSale} onClose={() => setShowQuickSale(false)} onCharge={handleQuickCharge} />

      {showScanner && (
        <BarcodeScannerModal
          onDetected={(code) => {
            setBarcode(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <SaveTicketDialog show={showSaveDialog} onClose={() => setShowSaveDialog(false)} onSave={handleSaveTicketFromDialog} suggestedName={`${new Date().toLocaleDateString()} - ${storeid}`} total={totalAmount} itemCount={cartItems.length} />

      <OpenTicketDialog show={showOpenDialog} onClose={() => setShowOpenDialog(false)} onOpenTicket={handleOpenSavedTicket} />

      <CustomerForm show={showAddCustomerDialog} onClose={() => setShowAddCustomerDialog(false)} editingCustomer={null} refreshCustomers={fetchCustomers} />

      <div className="space-y-8 p-2 md:p-12 sm:p-6 bg-gray-100 min-h-screen rounded-xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight text-center md:text-left">
              Point of Sales <span className="text-blue-500">Stores</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
            <button onClick={() => setShowScanner(true)} className="px-4 py-2 rounded-xl bg-black hover:bg-green-600 text-white transition w-full sm:w-auto">
              Scan Product
            </button>

            <button
              onClick={() => {
                if (cartItems.length === 0) setShowOpenDialog(true);
                else setShowSaveDialog(true);
              }}
              className="px-4 py-2 rounded-xl bg-black hover:bg-blue-600 text-white transition w-full sm:w-auto"
            >
              {cartItems.length === 0 ? 'Open Ticket' : 'Save Ticket'}
            </button>

            <button onClick={() => setShowQuickSale(true)} className="px-4 py-2 rounded-xl bg-black hover:bg-purple-600 text-white transition w-full sm:w-auto">
              Quick Sale
            </button>
          </div>
        </motion.div>

        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <nav className="overflow-x-auto">
            <ul className="flex gap-2 whitespace-nowrap">
              {/* All category button first */}
              <li key="all">
                <motion.button
                  onClick={() => setSelectedCategory('all')}
                  layout
                  className={`relative px-4 py-2 rounded-full font-semibold text-sm cursor-pointer ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  All
                </motion.button>
              </li>

              {categories.map((cat) => {
                const isActive = String(cat.category_id) === String(selectedCategory);
                return (
                  <li key={cat.category_id}>
                    <motion.button
                      onClick={() => setSelectedCategory(String(cat.category_id))}
                      layout
                      className={`relative px-4 py-2 rounded-full font-semibold text-sm cursor-pointer ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {cat.category_name}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Search field (full width now) */}
        <div className="mt-4 w-full">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by name, barcode or SKU..."
              className="w-full pl-10 pr-4 py-2 rounded-full shadow-sm border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-8 overflow-y-auto max-h-140 divide-y divide-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-600 col-span-full h-full">
                <svg className="w-8 h-8 animate-spin text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <p className="text-sm font-medium mt-3">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col bg-white rounded-2xl p-4 items-center justify-center text-gray-500 col-span-full h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2 3h8a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
                </svg>
                <p className="text-sm font-semibold mt-2">No products found for store ID: {storeid}.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center bg-white rounded-2xl p-4 justify-center text-gray-500 col-span-full h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <p className="text-sm font-semibold mt-2">No products match your selected category or search.</p>
              </div>
            ) : (
              filteredProducts.map((product, i) => <ProductCard key={product.product_id} product={product} index={i} onAdd={addToCart} />)
            )}
          </div>

          <CartPanel
  cartItems={cartItems}
  onRemove={handleRemoveItem}
  onIncrease={handleIncreaseQuantity}
  onDecrease={handleDecreaseQuantity}
  onAddDiscount={handleAddDiscount}
  onClearSale={handleClearSale}
  onCharge={handleCharge}
  customers={customers}
  customerSearch={customerSearch}
  setCustomerSearch={setCustomerSearch}
  showCustomerDropdown={showCustomerDropdown}
  setShowCustomerDropdown={setShowCustomerDropdown}
  chooseCustomer={chooseCustomer}
  openAddCustomer={openAddCustomer}
  selectedCustomerId={selectedCustomerId}
  selectedCustomer={selectedCustomer} // <-- add this
/>
        </div>
      </div>
    </>
  );
}
