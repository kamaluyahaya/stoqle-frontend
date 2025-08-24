'use client';
import React, { useState } from 'react';
import { CartItem, Customer } from '../types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Payment = { id: string | number; method: string; amount: number; reference?: string | null };

type Props = {
  items: CartItem[];
  payments: Payment[];
  sumPayments: number;
  remainingAmount: number;
  chargingLoading: boolean,
  total: number;
  subTotal: number;
  totalDiscount: number;
  // global discount controls (previously in SummaryPanel)
  globalDiscountValue: string;
  globalIsPercentage: boolean;
  saleCompleted?: boolean;
  saleData?: any;
  receiptEmail?: string;
  setReceiptEmail?: (s: string) => void;
  sendReceipt?: (email?: string) => Promise<void>;

  setShowGlobalDiscountDialog: (b: boolean) => void;
  clearGlobalDiscount: () => void;

  setShowPaymentDialog: (b: boolean) => void;
  setPaymentDialogDefaultAmount: (n: number) => void;
  addExactCashPayment: (amount: number) => void;
  removePayment: (id: string | number) => void;
  formatPrice: (v: number) => string;
  handleFinalizeCharge: () => void;
};

export default function PaymentsPanel({
  items,
  chargingLoading,
  payments,
  sumPayments,
  remainingAmount,
  total,
  subTotal,
  totalDiscount,
  globalDiscountValue,
  globalIsPercentage,
  saleCompleted = false,
  saleData = null,
  receiptEmail = '',
  setReceiptEmail,
  setShowGlobalDiscountDialog,
  clearGlobalDiscount,
  setShowPaymentDialog,
  setPaymentDialogDefaultAmount,
  addExactCashPayment,
  removePayment,
  formatPrice,
  handleFinalizeCharge,
}: Props) {
  const router = useRouter();

  // helper: create printable receipt HTML from saleData or items
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // Try to download PDF from backend, fallback to print window (user can save as PDF)
  const downloadPdfReceipt = async () => {
    try {
      const sale = saleData?.sale ?? saleData ?? null;
      const saleId = sale?.sale_id ?? sale?.id ?? sale?.reference_no;
      if (saleId) {
        // try backend PDF endpoint first (adjust endpoint if your API differs)
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
        // if backend PDF not found, continue to fallback
      }
    } catch (err) {
      console.warn('PDF fetch failed, falling back to printable window', err);
    }

    // Fallback: open printable HTML and instruct user to Save as PDF in print dialog
    // const html = generateReceiptHtml(saleData);
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
      alert('Unable to open new window for receipt. Please allow popups or try printing manually.');
      return;
    }
  }


  const sendReceipt = async (email?: string) => {
  const to = (email || receiptEmail ||  selectedCustomer?.email || '').trim();
  if (!to) {
    toast.error('No email address provided', {position: 'top-center'});
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    toast.error('Invalid email address', {position: 'top-center'});
    return;
  }

  try {
    setLoading(true);
    if (saleData && (saleData.sale.sale_id || saleData.sale.sale_id)) {
      const id = saleData.sale.sale_id ?? saleData.sale.sale_id;
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/${id}/email-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: to }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any));
        throw new Error(d.message || 'Failed to send receipt');
      }

      toast.success('Receipt sent to the provided email', {position: 'top-center'});
       setLoading(false);
    } else {
      // fallback when saleData/id isn't available — simulate success
      // toast.success('Receipt sent (simulated)', {position: 'top-center'});
    }
  } catch (err: any) {
    console.error('sendReceipt error', err);
    toast.error(err.message || 'Failed to send receipt', {position: 'top-center'});
  } finally {
    setLoading(false);
  }
};
   
 const [loading, setLoading] = useState(false);
 const [printingLoading, setPrintingLoading] = useState(false);
  // Open printable HTML and call print() so the user can print or save as PDF
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
    s.src = '/js/qz-tray.js';
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
    alert("No sale found to print");
    return;
  }

  try {
    setPrintingLoading(true);

    const token = JSON.parse(localStorage.getItem("token") || "null");
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/receipt-pdf`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ sale }),
    });

    const contentType = resp.headers.get("content-type") || "";

    if (!contentType.includes("application/pdf")) {
      const data = await resp.json();
      toast(data.message || "Server response received");
      return;
    }

    const arrayBuffer = await resp.arrayBuffer();
    const pdfBase64 = arrayBufferToBase64(arrayBuffer);

    // Load QZ Tray
    await loadQzScriptOnce();
    const qz = await waitForQz(5000);

    // QZ Tray security
    qz.security.setCertificatePromise(() =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qz/cert`).then((res) =>
        res.text()
      )
    );

    qz.security.setSignaturePromise(async (toSign: string): Promise<string> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qz/sign`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: toSign,
      });
      return response.text();
    });

    // Connect
    try {
      await qz.websocket.connect();
    } catch {
      throw new Error(
        "Could not connect to QZ Tray. Make sure it is installed, running, and trusted."
      );
    }

    try {
      // Get default printer
      const printerName = await qz.printers.getDefault();
      console.log("Default printer:", printerName);

      if (!printerName) {
        throw new Error("No default printer found. Please select a default printer.");
      }

      const config = qz.configs.create(printerName, {
        orientation: "portrait",
      });

      // Test print (optional, ensures printer works)
      await qz.print(config, [{ type: "raw", format: "plain", data: "Test print\n" }]);

      // Print PDF
      const printData = [{ type: "pdf", format: "base64", data: pdfBase64 }];
      await qz.print(config, printData);

      toast("Printed successfully to local printer");
    } finally {
      try {
        await qz.websocket.disconnect();
      } catch {}
    }
  } catch (err: any) {
    console.error("Print error:", err);
    alert("Error printing receipt: " + (err?.message || String(err)));
  } finally {
    setPrintingLoading(false);
  }
};




  
  // Navigate back to POS / dashboard and preserve currentSale so user can continue editing
  type SavedSale = {
  items: CartItem[];
  customer: {
    user_id?: string | number | null;
    customer_name?: string | null;
    email?: string | null;
  } | null;
  store_id?: string | number | null;
};

const goBackToSale = () => {
  const snapshot: SavedSale = {
    items,
    customer: null,
    store_id: undefined,
  };

  if (saleData?.sale) {
    snapshot.customer = {
      user_id: saleData.sale.customer_id ?? saleData.sale.customer?.user_id ?? null,
      customer_name: saleData.sale.customer_name ?? saleData.sale.customer?.customer_name ?? null,
      email: saleData.sale.customer_email ?? saleData.sale.customer?.email ?? null,
    };
    snapshot.store_id = saleData.sale.store ?? saleData.sale.store_id ?? undefined;
  }

  localStorage.setItem('currentSale', JSON.stringify(snapshot));
  router.push('/dashboard'); // or use backToPOS from your hook
};

  if (saleCompleted) {
    return (
      <div className="sticky top-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 w-full relative">
        {/* Download PDF icon button */}
        <button
          onClick={downloadPdfReceipt}
         className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
          title="Download PDF Receipt"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-4-4m4 4l4-4M4 20h16" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50">
            <svg
              className="w-8 h-8 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-lg font-semibold">Sale recorded</div>
          {saleData && (saleData.sale?.reference_no || saleData.sale?.sale_id) && (
            <div className="text-xs text-gray-500">
              Sale ID:{' '}
              <span className="font-medium text-gray-700">
                {saleData.sale?.reference_no ?? saleData.sale?.sale_id}
              </span>
            </div>
          )}

          {/* Email input + send button */}
          <div className="w-full max-w-sm mt-2">
            <div className="flex gap-2 items-center rounded-xl border border-gray-100 p-2 shadow-sm bg-white">
              <input
                className="flex-1 outline-none text-sm placeholder-gray-400"
                placeholder="Customer email (optional)"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail?.(e.target.value)}
                type="email"
              />
              <button
                onClick={() => sendReceipt?.(receiptEmail)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"
                  }`}
                >
                  {loading ? "Sending..." : "Send"}
              </button>
              
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Optional — email receipt to the customer
            </div>
          </div>

          {/* Back + Print buttons row */}
          <div className="w-full max-w-sm mt-2">
            <div className="flex justify-center gap-5">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-xl border border-gray-200 text-white text-sm hover:bg-gray-800 bg-black"
              >
                ← Back to Sale
              </button>
              <button
                onClick={printReceipt}
                disabled={printingLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                
                {printingLoading ? "🖨 Sending to Printer..." : "🖨 Print Receipt"}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-6 bg-white rounded-3xl shadow-xl p-6 w-full">

      <h3 className="text-lg font-semibold mb-3">Summary</h3>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Payments</label>

        {/* Global discount summary + clear (moved from SummaryPanel) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGlobalDiscountDialog(true)}
            className="text-sm text-blue-600 hover:underline"
            title="Edit global discount"
          >
            {globalDiscountValue && parseFloat(globalDiscountValue || '0') > 0
              ? globalIsPercentage
                ? `${globalDiscountValue}% (edit)`
                : `₦ ${parseFloat(globalDiscountValue).toLocaleString('en-NG', { minimumFractionDigits: 2 })} (edit)`
              : 'Add discount'}
          </button>

          <button
            onClick={() => clearGlobalDiscount()}
            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs text-gray-600"
            title="Clear global discount"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Compact Subtotal + Discount card */}
      <div className="mt-3">
        <div className="rounded-2xl p-3 bg-white border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">{formatPrice(subTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
            <span>General Discount</span>
            <span className="font-medium">-{formatPrice(totalDiscount)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold mt-3">
            <span>Amount Due</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Payments list + actions */}
      <div className="mt-3 space-y-2">
        <div className="flex flex-col gap-2">
          {payments.length === 0 ? (
            <div className="text-xs text-gray-400">No payments added yet. Add a payment to cover the total.</div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl p-3 bg-white border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center font-semibold text-sm text-gray-700">
                    {p.method === 'cash' ? '₦' : p.method === 'card' ? '💳' : '🏦'}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {p.method === 'cash' ? 'Cash' : p.method === 'card' ? 'ATM Card' : 'Bank transfer'}
                    </div>
                    {p.reference && <div className="text-xs text-gray-400">Ref: {p.reference}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-medium">{formatPrice(p.amount)}</div>
                  <button onClick={() => removePayment(p.id)} className="text-sm text-red-500">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl p-3 bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">Paid</div>
            <div className="text-sm font-semibold">{formatPrice(sumPayments)}</div>
          </div>

          <div className="rounded-xl p-4 bg-white border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500">Remaining</div>
                <div className={`text-lg font-semibold mt-1 ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatPrice(Math.max(0, remainingAmount))}
                </div>

                {remainingAmount > 0 ? (
                  <div className="text-xs text-red-500 mt-2">
                    Add payment to cover remaining amount to enable <span className="font-semibold">Charge</span>.
                  </div>
                ) : (
                  <div className="text-xs text-green-600 mt-2">Paid in full — ready to charge.</div>
                )}
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs text-gray-400">
                <div>Items: {items.length}</div>
              </div>
            </div>

            {remainingAmount > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setShowPaymentDialog(true);
                    setPaymentDialogDefaultAmount(remainingAmount > 0 ? remainingAmount : total);
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  + Add payment
                </button>

                <button
                  onClick={() => {
                    if (remainingAmount <= 0) return;
                    addExactCashPayment(Number(remainingAmount.toFixed(2)));
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Pay exact (cash)
                </button>
              </div>
            )}

            <div className="mt-3">
              <button
                onClick={() => handleFinalizeCharge()}
                disabled={chargingLoading}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition ${
                  remainingAmount > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {chargingLoading ? "Charging..." : "Charge"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
