'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  BarChart2,
  AlertTriangle,
  Download,
  Calendar as CalendarIcon,
  Share2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type LowStockItem = {
  product_id: number;
  product_name: string;
  store_id: number | null;
  quantity: number;
  low_stock_alert: number;
};

type SalesPoint = { date: string; sales: number };

type BestSeller = { product_id: number; name: string; sold: number };

type RecentOrder = {
  sale_id: number;
  reference_no: string;
  created_at: string;
  customer_id: string;
  customer_name: string;
  total: number;
  payment_status: string;
  store: string;
};

type InsightsResponse = {
  salesOverTime?: { date: string; sales: string }[];
  revenueByCategory?: { category_id: number; revenue: string }[];
  bestSellers?: { product_id: number; name: string; sold: string }[];
  recentOrders?: {
    sale_id: number;
    reference_no: string;
    created_at: string;
    customer_id: string;
    customer_name: string;
    total: string;
    payment_status: string;
    store: string;
  }[];
  lowStock?: LowStockItem[];
  customerMix?: { new: number; returning: number; total: number } | { new: string; returning: string; total: string };
};

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'];

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesData, setSalesData] = useState<SalesPoint[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<{ name: string; revenue: number }[]>([]);
  const [bestSellers, setBestSellers] = useState<{productId: number; product: string; sold: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<
    { id: string; date: string; customer: string; total: number; status: string }[]
  >([]);
  const [lowStock, setLowStock] = useState<{productId:number; sku: string; name: string; stock: number; store: string; store_id: number;}[]>([]);
  const [customerMix, setCustomerMix] = useState<{ new: number; returning: number; total: number } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

async function fetchInsights() {
  setLoading(true);
  setError(null);

  // safe token extraction (supports string or object shapes)
  let rawToken: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('token') || 'null');
      if (stored) {
        if (typeof stored === 'string') rawToken = stored;
        else rawToken =
          stored.token ??
          stored.accessToken ??
          stored.access_token ??
          stored.authToken ??
          // if token is nested like { access: { token: '...' } }
          (stored.access && stored.access.token) ??
          null;
      }
    } catch (e) {
      // if parsing fails, try raw string fallback
      const s = localStorage.getItem('token');
      if (s) rawToken = s;
    }
  }

  // base origin detection (use relative URLs in production)

  // build headers with token when available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (rawToken) {
    headers['Authorization'] = `Bearer ${rawToken}`;
    headers['x-access-token'] = rawToken; // optional: some backends expect this header
  }

  try {
    // prefer combined endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/insights`, { method: 'GET', headers, signal });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = (await res.json()) as { ok: boolean; data: InsightsResponse | any };
    if (!json?.ok) throw new Error('API returned ok: false');

    const payload = json.data as InsightsResponse;

        // parse salesOverTime
        if (payload.salesOverTime) {
          const sales = payload.salesOverTime.map((d) => ({
            date: formatDateLocal(d.date),
            sales: Number(parseFloat(d.sales || '0')),
          }));
          setSalesData(sales);
        } else {
          setSalesData([]);
        }

        // revenueByCategory -> we only have category_id and revenue; show category_id as name
        if (payload.revenueByCategory) {
          setRevenueByCategory(
            payload.revenueByCategory.map((c) => ({
              name: `Cat ${c.category_id}`,
              revenue: Number(parseFloat(c.revenue || '0')),
            }))
          );
        } else {
          setRevenueByCategory([]);
        }

        // bestSellers
       if (payload.bestSellers) {
  setBestSellers(
    payload.bestSellers.map((b) => ({
      productId: b.product_id,   // keep the id
      product: b.name,
      sold: Number(parseInt(b.sold || '0', 10)),
    }))
  );
} else {
  setBestSellers([]);
}

        // recentOrders
       if (payload.recentOrders) {
  setRecentOrders(
    payload.recentOrders.map((o) => ({
      id: o.reference_no,
      saleId: o.sale_id,          // keep numeric sale_id
      date: formatDateLocal(o.created_at),
      customer: o.customer_name,
      total: Number(parseFloat(o.total || '0')),
      status: o.payment_status,
    }))
  );
} else {
  setRecentOrders([]);
}


        // lowStock
       if (payload.lowStock) {
  setLowStock(
    payload.lowStock.map((l) => ({
      productId: l.product_id,
      storeId: l.store_id, // keep numeric or null
      sku: `P-${l.product_id}`,
      name: l.product_name,
      stock: Number(l.quantity ?? 0),
      store_id: l.store_id ?? 0,
      store: l.store_id === null ? 'All stores' : `Store ${l.store_id}`,
    }))
  );
} else {
  setLowStock([]);
}

        // customerMix
        if (payload.customerMix) {
          const cm = payload.customerMix as any;
          setCustomerMix({
            new: Number(cm.new || 0),
            returning: Number(cm.returning || 0),
            total: Number(cm.total || (Number(cm.new || 0) + Number(cm.returning || 0))),
          });
        } else {
          setCustomerMix(null);
        }
      } catch (err: any) {
    // fallback to separate endpoints (also include headers)
    try {
      const lsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/insights/low-stock`, { method: 'GET', headers, signal });
      if (lsRes.ok) {
        const js = await lsRes.json();
        if (js?.ok && Array.isArray(js.data)) {
          setLowStock(
            js.data.map((l: any) => ({
              sku: `P-${l.product_id}`,
              name: l.product_name,
              stock: Number(l.quantity ?? 0),
              store: l.store_id === null ? 'All stores' : `Store ${l.store_id}`,
            }))
          );
        }
      }

      const sRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/insights/sales`, { method: 'GET', headers, signal });
      if (sRes.ok) {
        const js = await sRes.json();
        if (js?.ok && Array.isArray(js.data)) {
          setSalesData(
            js.data.map((s: any) => ({
              date: formatDateLocal(s.date),
              sales: Number(parseFloat(s.sales || '0')),
            }))
          );
        }
      }

      setError(null);
    } catch (err2: any) {
      if (err2?.name === 'AbortError') return;
      setError(err2?.message || 'Failed to fetch insights.');
    }
  } finally {
    setLoading(false);
  }
}

    fetchInsights();

    return () => controller.abort();
  }, []);

  const totalSales = useMemo(() => salesData.reduce((s, r) => s + (r.sales || 0), 0), [salesData]);
  const totalOrders = useMemo(() => recentOrders.length, [recentOrders]);
  const avgOrderValue = Math.round(totalSales / Math.max(totalOrders, 1));

  function formatDateLocal(iso: string) {
    try {
      // produce YYYY-MM-DD in user's locale (keeps chart axis tidy)
      return new Date(iso).toLocaleDateString('en-CA');
    } catch {
      return iso?.slice?.(0, 10) ?? iso;
    }
  }

  function formatCurrency(n: number) {
    return `₦${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  const makeKey = (...parts: Array<string | number | null | undefined>) => parts.filter(p => p !== null && p !== undefined).join('-');


  return (
    <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100 min-h-screen rounded-xl">
      <div className="mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Insights</h1>
            <p className="text-sm text-slate-500 mt-1">Business overview — sales, inventory, and customer trends.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 p-2 rounded-xl shadow-sm border border-white/60">
              <CalendarIcon className="w-4 h-4 text-slate-600" />
              <select className="bg-transparent outline-none text-sm" aria-label="Select date range">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-white/60 hover:scale-[1.01] transition-transform">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>

              <button className="inline-flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-white/60 hover:scale-[1.01] transition-transform">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 p-6 bg-white/70 rounded-2xl border border-white/60 shadow-sm text-center">Loading insights…</div>
        ) : error ? (
          <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm text-red-700">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <StatCard icon={<DollarSign className="w-6 h-6 text-white" />} title="Total Sales" value={formatCurrency(totalSales)} subtitle="(selected range)" />

              <StatCard icon={<BarChart2 className="w-6 h-6 text-white" />} title="Orders" value={`${Math.max(totalOrders, 0)}`} subtitle="Recent orders" />

              <StatCard icon={<Package className="w-6 h-6 text-white" />} title="Avg Order Value" value={formatCurrency(avgOrderValue)} subtitle="Estimated" />

              <StatCard icon={<AlertTriangle className="w-6 h-6 text-white" />} title="Low Stock" value={`${lowStock.length}`} subtitle="Items below threshold" tone="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Sales Over Time</h3>
                      <p className="text-sm text-slate-500">Daily sales trend — tap points for details.</p>
                    </div>
                    <div className="text-sm text-slate-500">Range: custom</div>
                  </div>

                  <div className="w-full h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <h4 className="text-lg font-medium">Revenue by Category</h4>
                    <div className="w-full h-48 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueByCategory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v) => `₦${v / 1000}k`} />
                          <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#06B6D4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card>
                    <h4 className="text-lg font-medium">Best Selling Products</h4>
                    <ul className="mt-4 space-y-3">
                      {bestSellers.length ? (
  bestSellers.map((p) => (
    <li key={p.productId} className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{p.product}</div>
        <div className="text-xs text-slate-500">{p.sold} sold</div>
      </div>
      <div className="text-sm text-slate-700">{p.sold}</div>
    </li>
  ))
) : (
  <li className="text-sm text-slate-500">No best sellers data</li>
)}
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium">Customer Mix</h4>
                      <p className="text-sm text-slate-500">New vs Returning customers</p>
                    </div>
                    <div className="text-sm text-slate-500">Insights</div>
                  </div>

                  <div className="w-full h-52 mt-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            customerMix
                              ? [
                                  { name: 'New', value: customerMix.new },
                                  { name: 'Returning', value: customerMix.returning },
                                ]
                              : [
                                  { name: 'New', value: 1 },
                                  { name: 'Returning', value: 0 },
                                ]
                          }
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          paddingAngle={4}
                          cornerRadius={8}
                        >
                          <Cell fill="#4F46E5" />
                          <Cell fill="#06B6D4" />
                        </Pie>
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h4 className="text-lg font-medium">Low Inventory</h4>
                  <div className="mt-4">
                    <table className="w-full text-sm">
                      <thead className="text-slate-500 text-left">
                        <tr>
                          <th className="pb-2">SKU</th>
                          <th className="pb-2">Product</th>
                          <th className="pb-2">Stock</th>
                          <th className="pb-2">Store</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
  {lowStock.length ? (
    lowStock.map((i) => (
      <tr key={`${i.productId}-${i.store_id ?? 'all'}`} className="py-2">
        <td className="py-3 font-medium">{i.sku}</td>
        <td className="py-3">{i.name}</td>
        <td className="py-3">{i.stock}</td>
        <td className="py-3">{i.store}</td>
        <td className="py-3 text-right">
          <button className="text-sm px-3 py-1 rounded-lg bg-amber-100 text-amber-800">Reorder</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="py-4 text-sm text-slate-500">
        No low stock items
      </td>
    </tr>
  )}
</tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>

            <div className="mt-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Recent Orders</h3>
                    <p className="text-sm text-slate-500">Latest orders across your stores.</p>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-500 text-left">
                      <tr>
                        <th className="pb-3">Receipt</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentOrders.length ? (
                        recentOrders.map((o) => (
  <tr key={o.id ?? o.id} className="py-3">
    <td className="py-3 font-medium">{o.id}</td>
                            <td className="py-3">{o.date}</td>
                            <td className="py-3">{o.customer}</td>
                            <td className="py-3">{formatCurrency(o.total)}</td>
                            <td className="py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  o.status === 'paid' || o.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : o.status === 'pending' || o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-sm text-slate-500">
                            No recent orders
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Small presentational components ---
function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-4 shadow-md"
    >
      {children}
    </motion.div>
  );
}

function StatCard({ icon, title, value, subtitle, tone = 'indigo' }: { icon: React.ReactNode; title: string; value: string; subtitle?: string; tone?: string; }) {
  const bg = tone === 'amber' ? 'bg-amber-500' : 'bg-indigo-600';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-white/70 to-white/60 border border-white/60 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
        <div className="flex-1">
          <div className="text-xs text-slate-500">{title}</div>
          <div className="mt-1 text-xl font-semibold">{value}</div>
          {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
        </div>
      </div>
    </motion.div>
  );
}
