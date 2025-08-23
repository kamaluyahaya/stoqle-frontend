'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LabelPreviewDialog from '../forms/dialog/inventory/stockLabel';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Stock Label Page — lists inventory, lets user pick products and print labels with toggle settings
export default function StockLabelPage() {
  // products state
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  // label toggles
  const [showPrice, setShowPrice] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

const filteredProducts = products.filter((p) =>
  p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  p.raw?.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
);

  // ui
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // helper to format price nicely (assumes price as string/number in raw.price)
  const formatPrice = (p: any) => {
    if (p == null || p === '') return '-';
    const n = Number(p);
    if (Number.isFinite(n)) return n.toLocaleString(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
    return String(p);
  };

  // fetch products (maps API response into a consistent shape)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/inventory/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.status === 401 || data?.message === 'Unauthorized') {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) throw new Error(data?.message || 'Failed to fetch products');

      const mapped = Array.isArray(data) ? data.map((p: any) => {
        const raw = { ...(p.raw ?? {}), track_stock: p.raw?.track_stock ?? p.track_stock ?? p.trackStock ?? p.track ?? 0 };
        return {
          product_id: p.product_id,
          barcode: p.barcode ?? raw?.barcode ?? null,
          name: p.name ?? raw?.name ?? null,
          category_id: raw?.category_id ?? null,
          price: raw?.price ?? null,
          currentStock: Number(p.currentStock ?? 0),
          stores: Array.isArray(p.stores) ? p.stores : [],
          last_updated: p.last_updated ?? raw?.updated_at ?? null,
          image: p.image ?? null,
          raw,
        };
      }) : [];

      setProducts(mapped);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // selection helpers
  const toggleProduct = (id: number) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedIds = Object.entries(selected).filter(([_, v]) => v).map(([k]) => Number(k));

  useEffect(() => {
    // if selectAll toggled, set all products
    if (selectAll) {
      const all: Record<number, boolean> = {};
      products.forEach(p => { all[p.product_id] = true; });
      setSelected(all);
    } else if (!selectAll) {
      // when unchecking selectAll clear selection
      setSelected({});
    }
  }, [selectAll, products]);

  const onPreview = () => {
    if (selectedIds.length === 0) {
      toast('Select at least one product to preview labels');
      return;
    }
    setPreviewOpen(true);
  };

type User = {
  full_name: string;
  email: string;
  role: string;
  profile_image: string;
  business_name: string;
  business_slug?: string;
};

const onPrintSelection = () => {
  if (selectedIds.length === 0) {
    toast.warning('Select at least one product to print', {position: 'top-center'});
    return;
  }

  // get business name from stored user
  let businessName = 'Your Business Name';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u: User = JSON.parse(raw);
      if (u?.business_name) businessName = u.business_name;
    }
  } catch (err) {
    // ignore parse errors, fallback will be used
    console.warn('Failed to parse stored user for business name', err);
  }

  const printedAt = new Date().toLocaleString();

  const labelsHtml = selectedIds
    .map((id) => {
      const p = products.find((x) => x.product_id === id);
      if (!p) return '';
      const priceText = showPrice ? formatPrice(p.price ?? p.raw?.price) : '';
      const skuText = showSKU ? (p.barcode ?? '') : '';
      const nameText = showName ? (p.name ?? '') : '';

      const esc = (s = '') =>
        String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      return `
        <div class="label">
          <div class="label-top">
            <div class="sku">${esc(skuText)}</div>
          </div>
          <div class="label-mid">
            <div class="name">${esc(nameText)}</div>
          </div>
          <div class="label-bottom">
            <div class="price">${esc(priceText)}</div>
          </div>
        </div>
      `;
    })
    .join('\n');

  const style = `
    <style>
      :root{
        --bg:#ffffff;
        --muted:#6b7280;
        --text:#0f172a;
        --card-border:#e6e9ee;
        --apple-gray:#f8fafc;
      }
      html,body{height:100%; margin:0; padding:0; -webkit-print-color-adjust:exact; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:var(--text);}
      body { background: var(--apple-gray); padding:18px; box-sizing:border-box; }

      .print-header {
        width:100%;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:4px;
        margin-bottom:18px;
      }
      .biz {
        font-weight:600;
        font-size:20px;
        letter-spacing: -0.2px;
        color: #111827;
      }
      .meta {
        font-size:12px;
        color:var(--muted);
      }
      .divider {
        width:100%;
        height:1px;
        background:linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02));
        margin:12px 0;
      }

      .labels {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 14px;
        align-items: start;
      }

      .label {
        background: var(--bg);
        border: 1px solid var(--card-border);
        border-radius: 10px;
        padding: 10px;
        box-sizing: border-box;
        height: 92px;
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        box-shadow: 0 6px 18px rgba(15,23,42,0.04);
      }
      .label-top { font-size:10px; color:var(--muted); }
      .label-mid .name { font-weight:600; font-size:13px; color:var(--text); line-height:1.1; max-height:34px; overflow:hidden; text-overflow:ellipsis; }
      .label-bottom .price { font-size:12px; color:var(--text); }

      .print-footer { margin-top:18px; font-size:11px; color:var(--muted); text-align:center; }

      @media print {
        body { background: white; padding:12px; }
        .print-header { page-break-after: avoid; }
        .label { break-inside: avoid; page-break-inside: avoid; }
        .labels { gap: 10px; }
      }
    </style>
  `;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Labels — ${businessName}</title>
    ${style}
  </head>
  <body>
    <div class="print-header">
      <div class="biz">${businessName}</div>
      <div class="meta">Printed: ${printedAt}</div>
    </div>

    <div class="divider" />

    <div class="labels">
      ${labelsHtml}
    </div>

    <div class="print-footer">Generated by your Inventory App — ${businessName}</div>
  </body>
</html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      try {
        w.focus();
        w.print();
        w.close();
      } catch (err) {
        toast.error('Print blocked by browser popup settings — allow popups to print');
      }
    }, 600);
  } else {
    toast.error('Unable to open print window — please allow popups');
  }
};


  const onSaveSettings = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // replace with real API call if you want to persist settings
      await new Promise(r => setTimeout(r, 600));
      toast.success('Label settings saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen rounded-3xl p-6 bg-gradient-to-b from-white/60 via-white/40 to-white/20">
      <div className="">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Stock Label Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Select products and generate printable labels.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onPreview} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm hover:shadow transition">Preview</button>
            <button onClick={onPrintSelection} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700">Print Selected</button>
          </div>
        </div>

        {/* settings + mini-preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-4">
            <div className="text-sm text-gray-600 mb-3">Label Settings</div>
            <div className="flex gap-3 flex-wrap">
              <TogglePill label="Show Name" enabled={showName} onToggle={() => setShowName(s => !s)} />
              <TogglePill label="Show SKU" enabled={showSKU} onToggle={() => setShowSKU(s => !s)} />
              <TogglePill label="Show Price" enabled={showPrice} onToggle={() => setShowPrice(s => !s)} />
            </div>
            <div className="mt-3 text-xs text-gray-500">Tip: Use the preview button to inspect labels before printing.</div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">Live Label Preview</div>
            <div className="w-52 h-32 rounded-lg border border-gray-200 p-3 flex flex-col justify-between bg-white shadow-sm">
              <div className="text-xs text-gray-400">{showSKU ? (products[0]?.barcode ?? 'PCS-00123') : ''}</div>
              <div className="font-semibold text-sm truncate">{showName ? (products[0]?.name ?? 'Premium Cotton Shirt') : ' '}</div>
              <div className="text-sm text-gray-700">{showPrice ? formatPrice(products[0]?.price ?? products[0]?.raw?.price ?? '₦12,500') : ''}</div>
            </div>
          </div>
        </div>

        <div className="mb-4 relative">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto px-4 sm:px-0 mb-3">
        <div className="relative w-full">
          <input type="text" placeholder="Search products..." onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl pl-12 pr-4 py-3 bg-white placeholder-gray-400 text-gray-900 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </motion.div>
  
</div>

        {/* products table */}
        <div className="bg-white/40 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Products</div>
              <div className="text-2xl font-semibold text-gray-900">{products.length}</div>
              {selectedIds.length > 0 && (
                <div className="ml-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{selectedIds.length} selected</div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm select-none">
                <input type="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)} className="h-5 w-5 rounded-md accent-blue-600 ring-1 ring-gray-100 shadow-sm" />
                <span className="text-sm text-gray-600">Select all</span>
              </label>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl">
            <table className="min-w-full">
              <thead className="bg-white/60 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-3 text-left text-xs text-gray-500">Select</th>
                  <th className="px-5 py-3 text-left text-xs text-gray-500">Product</th>
                  <th className="px-5 py-3 text-left text-xs text-gray-500">SKU</th>
                  <th className="px-5 py-3 text-left text-xs text-gray-500">Price</th>
                  <th className="px-5 py-3 text-left text-xs text-gray-500">Stock</th>
                  <th className="px-5 py-3 text-left text-xs text-gray-500">Stores</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No products found</td></tr>
                ) : (
                 filteredProducts.map((p: any) => (
                    <tr
                      key={p.product_id}
                      onClick={() => toggleProduct(p.product_id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProduct(p.product_id); } }}
                      tabIndex={0}
                      role="button"
                      className={`transition cursor-pointer ${selected[p.product_id] ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-white hover:shadow-sm'}`}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={!!selected[p.product_id]}
                          onChange={() => toggleProduct(p.product_id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5 rounded-md accent-blue-600 ring-1 ring-gray-100 shadow-sm"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 shadow-inner">
                            {/* image fallback */}
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{p.name ?? '-'}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.raw?.category_name ?? ''}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">{p.barcode ?? '-'}</td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        <div className="font-medium">{formatPrice(p.price ?? p.raw?.price)}</div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">{Number(p.currentStock ?? 0).toLocaleString()}</td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-2">
                          {p.stores?.length ? p.stores.map((s: any) => (
                            <div key={s.store_id} className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700 font-medium">
                              {s.store_name ?? `#${s.store_id}`} <span className="text-gray-400">({Number(s.quantity ?? 0).toLocaleString()})</span>
                            </div>
                          )) : <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list (applified) */}
          <div className="md:hidden grid gap-3">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : products.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No products found</div>
            ) : (
              products.map((p: any) => (
                <div
                  key={p.product_id}
                  onClick={() => toggleProduct(p.product_id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProduct(p.product_id); } }}
                  tabIndex={0}
                  role="button"
                  className={`flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition ${selected[p.product_id] ? 'ring-2 ring-blue-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selected[p.product_id]}
                      onChange={() => toggleProduct(p.product_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 rounded-md accent-blue-600"
                    />
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : '📦'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{p.name ?? '-'}</div>
                      <div className="text-xs text-gray-400">{p.barcode ?? '-'}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{Number(p.currentStock ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{formatPrice(p.price ?? p.raw?.price)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <LabelPreviewDialog
  show={previewOpen}
  onClose={() => setPreviewOpen(false)}
  products={products.filter((p:any) => selected[p.product_id])}
  showName={showName}
  showSKU={showSKU}
  showPrice={showPrice}
  onPrint={onPrintSelection}
/>
    </div>

  );
}

function TogglePill({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-2 rounded-full text-sm font-medium transition-shadow transition-colors duration-200 flex items-center gap-2 ${enabled ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
      aria-pressed={enabled}
    >
      <span className={`w-3 h-3 rounded-full ${enabled ? 'bg-white' : 'bg-gray-300'}`} />
      <span>{label}</span>
    </button>
  );
}
