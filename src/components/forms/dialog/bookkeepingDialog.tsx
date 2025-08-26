'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface SaleItem {
  sale_item_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

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


interface TransactionsResponse {
  sales: Transaction[];
}

interface ReceiptModalProps {
  selected: null | {
    sale_id?: string;
    receipt_no?: string;
    date?: string;
    payment_date?: string;
    transaction_type?: string;
    price?: number;
    total?: number;
    payment_method?: string;
    customer?: string | null;
    sold_by?: string;
    store_name?: string;
    items?: SaleItem[];
    subtotal?: number;
    discount?: number;
    sales_type?: string;
    payment_log?: { payment_method?: string; amount_received?: number; payment_reference?: string | null };
  };
  onClose: () => void;
  formatDate: (d?: string) => string;
  formatCurrency: (n?: number) => string;
}

export default function ReceiptModal({ selected, onClose, formatDate, formatCurrency }: ReceiptModalProps) {
     const [printingLoading, setPrintingLoading] = useState(false);
    const [saleData, setSaleData] = useState<any>(null);
      const [loading, setLoading] = useState(true);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (selected) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, onClose]);


  // Replace your fetchTransactions + useEffect section with this

const fetchTransactions = async (saleId?: string | number) => {
  if (!saleId) {
    setSaleData(null);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    // token stored as raw string in localStorage usually, so don't JSON.parse
  const token = JSON.parse(localStorage.getItem("token") || "null");
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookkeeping/transactions/${saleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Helpful debug logs
    console.log('[ReceiptModal] fetch status', res.status);

    // if (res.status === 401) {
    //   toast.error('Session expired. Please login again.');
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    //   return;
    // }

    if (!res.ok) {
      // try to parse JSON message or fallback to text
      let errBody: any = null;
      try { errBody = await res.json(); } catch { errBody = await res.text().catch(() => null); }
      console.error('[ReceiptModal] fetch error body', errBody);
      throw new Error(errBody?.message || errBody || `Failed to fetch transactions (${res.status})`);
    }

    const data = await res.json();
    console.log('[ReceiptModal] fetch data', data);

    // normalize common shapes: { sale }, { sales: [...] }, raw sale object, etc.
    let normalized: any = null;
    if (data.sale) normalized = data.sale;
    else if (Array.isArray(data.sales) && data.sales.length) normalized = data.sales[0];
    else if (data.sales && !Array.isArray(data.sales)) normalized = data.sales;
    else normalized = data;

    setSaleData(normalized);
  } catch (err: any) {
    console.error('[ReceiptModal] fetchTransactions error', err);
    toast.error(err?.message || 'Failed to fetch transactions');
    setSaleData(null);
  } finally {
    setLoading(false);
  }
};

// ensure fetch runs when modal selection opens/changes
useEffect(() => {
  // fetch only when selected has a sale_id or receipt id
  const saleId = selected?.sale_id ?? selected?.receipt_no ?? selected?.sale_id;
  fetchTransactions(saleId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selected]);

  
// paste into your component file (React + Next.js)
// Replace your existing printReceipt with this function and include the helper functions below.

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

function loadQzScriptOnce(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in browser'));
    // already loaded
    if ((window as any).qz) return resolve();

    // avoid adding duplicate script tags
    if (document.querySelector('script[data-qz="true"]')) {
      // wait until window.qz appears
      const waitFor = () => {
        if ((window as any).qz) return resolve();
        setTimeout(() => {
          if ((window as any).qz) resolve();
          else waitFor();
        }, 100);
      };
      return waitFor();
    }

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://unpkg.com/qz-tray/qz-tray.js';
    s.setAttribute('data-qz', 'true');
    s.onload = () => {
      // qz may still initialize; wait a short time
      const start = Date.now();
      const maxWait = 5000;
      const poll = () => {
        if ((window as any).qz) return resolve();
        if (Date.now() - start > maxWait) return resolve(); // resolve anyway; connection will fail later if missing
        setTimeout(poll, 100);
      };
      poll();
    };
    s.onerror = () => reject(new Error('Failed to load qz-tray.js'));
    document.body.appendChild(s);
  });
}

async function waitForQz(timeout = 5000) {
  const start = Date.now();
  while (!(window as any).qz) {
    if (Date.now() - start > timeout) throw new Error('qz not available');
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, 100));
  }
  return (window as any).qz;
}

const printReceipt = async () => {
  const sale = saleData?.sale ?? saleData ?? null;
  const saleId = sale?.sale_id ?? sale?.id ?? sale?.reference_no;

  if (!saleId) {
    alert('No sale found to print');
    return;
  }

  try {
    setPrintingLoading(true);

    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/receipt-pdf`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ sale }),
    });

    // If server prints on the server and returns JSON:
    const contentType = resp.headers.get('content-type') || '';

    if (contentType.includes('application/pdf')) {
      // Server returned a PDF -> print locally via QZ Tray
      const arrayBuffer = await resp.arrayBuffer();
      const pdfBase64 = arrayBufferToBase64(arrayBuffer);

      // Load QZ script (idempotent)
      await loadQzScriptOnce();

      // Wait for window.qz to exist (short timeout)
      const qz = await waitForQz(5000);

      // connect
      try {
        await qz.websocket.connect();
      } catch (err) {
        // If connect fails, provide helpful message
        throw new Error('Could not connect to QZ Tray. Make sure QZ Tray is installed and running, and that you trusted the connection prompt.');
      }

      try {
        // choose printer (default); you can replace with qz.printers.find("Your Printer Name")
        const printerName = await qz.printers.getDefault();
        const config = qz.configs.create(printerName);

        // Print the PDF (base64)
        const printData = [{ type: 'pdf', format: 'base64', data: pdfBase64 }];
        await qz.print(config, printData);

        toast('Printed successfully to local printer');
      } finally {
        try { await qz.websocket.disconnect(); } catch (e) { /* ignore */ }
      }

    } else {
      // Assume JSON response (your current server-side printing)
      const data = await resp.json();
      toast(data.message || 'Server response received');
    }
  } catch (err: any) {
    console.error('Print error:', err);
    alert('Error printing receipt: ' + (err?.message || String(err)));
  } finally {
    setPrintingLoading(false);
  }
};

  const downloadPdfReceipt = async () => {
          setLoading(true);
    try {
      const saleId = selected?.sale_id;
      if (saleId) {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/reciept/sales/${saleId}/receipt`;

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/pdf',
          },
        });

        if (res.ok) {
          const blob = await res.blob();
          const filename = `receipt-${saleId}.pdf`;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(link.href);
          return;
        }
      }
    } catch (err) {
      console.warn('PDF fetch failed, falling back to print window', err);
      
    }finally{
                  setLoading(false);
    }

    // fallback
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (w) {
      w.document.write('<h3>Receipt Preview</h3><p>Please use browser print dialog to save as PDF.</p>');
      w.document.close();
      w.print();
    } else {
      alert('Unable to open receipt window. Please allow popups.');
    }
  };

  const handleSystemPrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden={!selected}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-4xl shadow-lg relative my-10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
            >
              <X size={16} />
            </button>

        {/* Header */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">Transaction details</h1>
          <p className="text-sm text-gray-500 mt-1">Receipt {selected.receipt_no}</p>
        </div>

        {/* Scrollable body */}
        <div className="px-6 overflow-y-auto max-h-[70vh]">
          {/* Transaction grid */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <div className="text-xs text-gray-400">Date</div>
              <div className="font-medium text-gray-900">
                {formatDate(selected.date ?? selected.payment_date)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Amount</div>
              <div className="font-medium text-green-700">
                {formatCurrency(selected.total ?? selected.price)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Payment</div>
              <div className="font-medium text-gray-900">{selected.payment_method}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Type</div>
              <div className="font-medium text-gray-900 capitalize">{selected.transaction_type}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400">Customer</div>
              <div className="font-medium text-gray-900">{selected.customer ?? 'N/A'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400">Sold by</div>
              <div className="font-medium text-gray-900">{selected.sold_by ?? selected.store_name}</div>
            </div>
          </div>

          {/* Order details */}
          <div className="mt-6">
            <div className="text-sm text-gray-500">Order details</div>
            <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white p-1">
              {selected.items?.length ? (
                selected.items.map((it: SaleItem) => (
                  <div
                    key={it.sale_item_id}
                    className="flex items-center justify-between p-3"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{it.product_name}</div>
                      <div className="text-xs text-gray-400">Qty: {it.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(it.unit_price)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(it.line_total)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500">No items</div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-400">Subtotal</div>
              <div className="font-medium text-gray-900">
                {formatCurrency(selected.subtotal ?? selected.price ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Discount</div>
              <div className="font-medium text-gray-900">
                {formatCurrency(selected.discount ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total</div>
              <div className="font-medium text-gray-900">
                {formatCurrency(selected.total ?? selected.price ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Sales type</div>
              <div className="font-medium text-gray-900">{selected.sales_type ?? 'N/A'}</div>
            </div>
          </div>

          {/* Store & payment log */}
          <div className="mt-4 text-sm text-gray-600">
            <div className="text-xs text-gray-400">Store</div>
            <div className="font-medium text-gray-900">{selected.store_name ?? 'N/A'}</div>

            <div className="mt-3 text-xs text-gray-400">Payment log</div>
            <div className="mt-1">
              <div className="text-sm text-gray-900">
                {selected.payment_log?.payment_method ?? selected.payment_method}
              </div>
              <div className="text-xs text-gray-400">
                Amount received: {formatCurrency(selected.payment_log?.amount_received ?? selected.total ?? selected.price ?? 0)}
              </div>
              <div className="text-xs text-gray-400">
                Reference: {selected.payment_log?.payment_reference ?? 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer (always visible inside modal) */}
       <div className="border-t border-gray-100 p-4 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={downloadPdfReceipt}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
               {loading ? "Downloading..." : "Download PDF"}
              </button>
              <button
                onClick={printReceipt}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition"
              >
                {printingLoading ? "🖨 Sending to Printer..." : "🖨 Reprint Receipt"}
              </button>
              <button
                onClick={handleSystemPrint}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                System Print
              </button>
            </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

  );
}


