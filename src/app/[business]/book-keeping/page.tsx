'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ReceiptModal from '@/components/forms/dialog/bookkeepingDialog';

interface SaleItem { sale_item_id: number; product_name: string; unit_price: number; quantity: number; line_total: number; }

interface Transaction {
  date: string;
  receipt_no: string;
  transaction_type: string;
  price: number;
  total?: number;
  payment_method: string;
  customer: string;
  sold_by: string;
  store_name?: string;
  items?: SaleItem[];
  subtotal?: number;
  discount?: number;
  sales_type?: string;
  payment_log?: { payment_method?: string; amount_received?: number; payment_reference?: string | null };
}

interface Meta {
  generated_at?: string;
  count?: number;
  total_price?: number;
}

interface TransactionsResponse {
  meta?: Meta;
  summary?: { count?: number; total?: number };
  data: Transaction[];
}

export default function BookkeepingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [summary, setSummary] = useState<{ count?: number; total?: number } | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'refund'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'card'>('all');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      if (!token) throw new Error('Unauthorized');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookkeeping/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to fetch transactions');
      }

      const data: TransactionsResponse = await res.json();
      setTransactions(data.data || []);
      setMeta(data.meta || null);
      setSummary(data.summary || null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);



  
  

const filtered = useMemo(() => {
  const q = search.toLowerCase().trim();
  return transactions.filter(t => {
    if (typeFilter !== 'all' && t.transaction_type !== typeFilter) return false;
    if (methodFilter !== 'all' && t.payment_method !== methodFilter) return false;
    if (!q) return true;

    const receipt = (t.receipt_no || '').toLowerCase();
    const customer = (t.customer || '').toLowerCase();
    const soldBy = (t.sold_by || '').toLowerCase();
    const method = (t.payment_method || '').toLowerCase();

    return receipt.includes(q) || customer.includes(q) || soldBy.includes(q) || method.includes(q);
  });
}, [transactions, search, typeFilter, methodFilter]);

  const total = useMemo(() => filtered.reduce((s, r) => s + (r.price || 0), 0), [filtered]);

  const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch (e) {
    return String(iso);
  }
};

// accept optional param (amount?: number) to match ReceiptModalProps
const formatCurrency = (amount?: number) => {
  if (amount == null) return "₦0";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `₦${Number(amount).toLocaleString()}`;
  }
};




const downloadCSV = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const businessName = user?.business_name || "My Business";

  // Apple-like clean headers
  const headers = [
    "Date",
    "Receipt No",
    "Transaction Type",
    "Customer",
    "Sold By",
    "Payment Method",
    "Amount (₦)"
  ];

  // Map transactions into CSV rows
  const rows = transactions.map(t => [
    `"${formatDate(t.date)}"`,
    `"${t.receipt_no}"`,
    `"${t.transaction_type}"`,
    `"${(t.customer || "").replace(/"/g, '""')}"`, 
    `"${(t.sold_by || "").replace(/"/g, '""')}"`,
    `"${t.payment_method}"`,
    `"${t.price}"`,
  ].join(","));

  // Build CSV content
  const csvContent = [
    `"${businessName}"`,                              // Business name row
    `"Generated: ${new Date().toLocaleString()}"`,    // Timestamp row
    "",                                               // Blank line for spacing
    headers.join(","),                                // Column headers
    ...rows                                           // Data rows
  ].join("\r\n"); // ✅ Excel-friendly line breaks

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${businessName.replace(/\s+/g, "_")}_Bookkeeping_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100  min-h-screen rounded-xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Book <span className="text-blue-500">Keeping</span></h1>
            <p className="text-sm text-gray-500 mt-1">Transactions & financial summary for your business</p>
          </div>

          <div className="flex gap-3 items-center w-full md:w-auto">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-lg font-semibold text-gray-900">{summary?.count ?? transactions.length} txns</div>
              <div className="h-6 w-px bg-gray-100 mx-3" />
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-lg font-semibold text-green-600">{formatCurrency(summary?.total ?? (meta?.total_price ?? transactions.reduce((s, t) => s + (t.price || 0), 0)))}</div>
            </div>

            <button onClick={downloadCSV} className="hidden sm:inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md">
              <Download className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-center mb-4">
          <div className="relative flex-1">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by receipt, customer, sold by or payment..." className="w-full rounded-xl pl-10 pr-4 py-2 bg-white border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="all">All types</option>
              <option value="sale">Sales</option>
              <option value="refund">Refunds</option>
            </select>

            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value as any)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="all">All methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>

            <button onClick={() => { setSearch(''); setTypeFilter('all'); setMethodFilter('all'); }} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">Reset</button>
          </div>
        </div>

         <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sold by</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

             <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading transactions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No transactions found</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.receipt_no} >
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(t.date)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.receipt_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{t.transaction_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.sold_by}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.payment_method}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(t.price)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button onClick={() => setSelected(t)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 bg-white">
                        <Eye className="w-4 h-4 text-gray-600" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="bg-white rounded-2xl px-6 py-3 shadow-sm flex items-center gap-6">
            <div className="text-sm text-gray-500">Total records</div>
            <div className="text-lg font-semibold text-gray-900">{summary?.count ?? transactions.length}</div>
            <div className="h-6 w-px bg-gray-100 mx-3" />
            <div className="text-sm text-gray-500">Total amount</div>
            <div className="text-lg font-semibold text-green-600">{formatCurrency(total)}</div>
          </div>
        </div>

        <ReceiptModal
        selected={selected}
        onClose={() => setSelected(null)}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      </motion.div>
    </div>
  );
}
