'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/forms/dialog/dialogForm';

interface Product {
  product_id: string;
  barcode?: string;
  name?: string;
  category_id?: string;
  price?: number;
  total_quantity?: number;
  status?: 'draft' | 'active';
}

interface Category {
  category_id: string;
  category_name: string;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const businessSlug = params?.business as string ?? 'default-slug';
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
const [deleting, setDeleting] = useState(false);






   

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
          // Check for unauthorized status
    if (res.status === 401 || data.message === 'Unauthorized') {
      localStorage.removeItem('token'); // clear token
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login'; // redirect to login
      return;
    }
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };
  
const fetchCategories = async () => {
  try {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
    setCategories(data);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Error loading categories');
  }
};

useEffect(() => {
  fetchProducts();
  fetchCategories();
}, []);

const getCategoryName = (category_id?: string) => {
  return categories.find(c => c.category_id === category_id)?.category_name || '-';
};

const handleDeleteProduct = async () => {
  if (!deletingProduct?.product_id) return;

  try {
    setDeleting(true);
    const token = JSON.parse(localStorage.getItem('token') || 'null');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${deletingProduct.product_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete');

    toast.success(`"${deletingProduct.name}" deleted successfully`, {position:'top-center'});
    setProducts(prev => prev.filter(p => p.product_id !== deletingProduct.product_id));
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Failed to delete product');
  } finally {
    setDeleting(false);
    setShowDeleteDialog(false);
    setDeletingProduct(null);
  }
};


  // Safely filter products by ensuring fields are strings
const filtered = useMemo(() => {
  return products.filter(p => {
    const name = p.name?.toLowerCase() || '';
    const sku = p.barcode?.toLowerCase() || '';
    const category = getCategoryName(p.category_id).toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || category.includes(term) || sku.includes(term);

    const isInStock = (p.total_quantity || 0) > 0;
    const matchesStock =
      stockFilter === 'all' ? true :
      stockFilter === 'in' ? isInStock :
      !isInStock;

    return matchesSearch && matchesStock;
  });
}, [products, categories, searchTerm, stockFilter]);


  return (
       <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100  min-h-screen rounded-xl">
      {/* Topbar */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
          Point of Sale 
        </h1>
        <span className="text-gray-500 text-sm">{currentDate}</span>
      </motion.div> */}
      <motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
>
  <h1 className="text-3xl font-semibold text-gray-900">
  Total ({filtered.length}) <span className="text-blue-500">Products</span>
</h1>

  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
    {/* Search Bar */}
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full rounded-xl pl-10 pr-4 py-2 bg-gray-100 placeholder-gray-400 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>

    {/* Mobile: Stock Dropdown */}
   {/* Mobile + Tablet: Stock Dropdown (shown on < lg) */}
<select
  value={stockFilter}
  onChange={e => setStockFilter(e.target.value as 'all' | 'in' | 'out')}
  className="block lg:hidden rounded-xl border border-gray-200 text-gray-600 bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
>
  <option value="all">All Stock</option>
  <option value="in">In Stock</option>
  <option value="out">Out of Stock</option>
</select>

{/* Desktop Only: Button Group (shown on ≥ lg) */}
<div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-xl px-1 py-1">
  {['all', 'in', 'out'].map(type => (
    <button
      key={type}
      onClick={() => setStockFilter(type as 'all' | 'in' | 'out')}
      className={`text-sm px-4 py-1.5 rounded-xl transition ${
        stockFilter === type
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {type === 'all' ? 'All' : type === 'in' ? 'In Stock' : 'Out of Stock'}
    </button>
  ))}
</div>


    {/* Create Product Button */}
    <button
      onClick={() => router.push(`/${businessSlug}/products/add`)}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition"
    >
      <Plus className="w-4 h-4" />
      Create Product
    </button>
  </div>
  <ConfirmDialog
  show={showDeleteDialog}
  onClose={() => {
    setShowDeleteDialog(false);
    setDeletingProduct(null);
  }}
  onConfirm={handleDeleteProduct}
  title={`Delete "${deletingProduct?.name}"?`}
  message="This will permanently remove the product from your inventory."
  confirmText="Delete Product"
  loading={deleting}
/>

</motion.div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty in Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
  {loading ? (
    <tr>
      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td>
    </tr>
  ) : filtered.length ? (
    <>
      {filtered.map((p, idx) => (
        <motion.tr
          key={p.product_id || idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="hover:bg-gray-50"
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.barcode || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getCategoryName(p.category_id)}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.total_quantity != null ? p.total_quantity : '0'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₦{p.price?.toLocaleString() || '-'}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status || '-'}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
            <button onClick={() => router.push(`/${businessSlug}/products/edit/${p.product_id}`)} className="p-1 rounded-full hover:bg-gray-100">
              <Edit2 className="w-4 h-4 text-blue-600" />
            </button>
           <button
  onClick={() => {
    setDeletingProduct(p);
    setShowDeleteDialog(true);
  }}
  className="p-1 rounded-full hover:bg-gray-100"
>
  <Trash2 className="w-4 h-4 text-red-600" />
</button>


          </td>
        </motion.tr>
      ))}

      {/* 🍎 Apple-like End of Products Message */}
      <tr>
        <td colSpan={8}>
          <motion.div
            className="flex items-center justify-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-full shadow-sm font-medium tracking-wide">
              ⬇️ End of Products
            </div>
          </motion.div>
        </td>
      </tr>
    </>
  ) : (
    <tr>
      <td colSpan={8}>
        <motion.div
          className="flex flex-col items-center justify-center py-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-4xl mb-3 text-gray-400">🛍️</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No Products Found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or adding a new product.</p>
        </motion.div>
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  );
}
