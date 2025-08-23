'use client';

import React, { JSX, useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/stateCard';
import SalesLineChart from '@/components/dashboard/salesLineChart';
import InventoryStatusChart from '@/components/dashboard/trafficPieChart';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type SalesSummary = {
  count: number;
  total: number;
};

type InventoryCounts = {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
};

type RecentLogin = {
  staff_id: number;
  full_name?: string | null;
  email?: string | null;
  profile_image?: string | null;
  last_login?: string | null;
};

type SalesPayload = {
  today?: SalesSummary;
  yesterday?: SalesSummary;
  last_7_days?: any;
    last_week_total: any;
  prev_week_total:any;
};

type DashboardDto = {
  meta?: { generated_at?: string };
  sales?: SalesPayload;
  active_customers_last_30_days?: number;
  inventory?: { counts?: InventoryCounts; sample_items?: any[]; sample_variants?: any[] };
  recent_logins?: RecentLogin[];
};

// Chart components may not export exact prop types. Cast to safe component type until you type them.
const SafeSalesLineChart = SalesLineChart as unknown as React.ComponentType<{ data?: any }>;
const SafeInventoryStatusChart = InventoryStatusChart as unknown as React.ComponentType<{ counts?: InventoryCounts }>;

export default function DashboardPage(): JSX.Element {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Unauthorized');
      // useRouter push works inside client components
      router.push('/login');
      return;
    }
    const ctrl = new AbortController();
    fetchData( ctrl.signal);
    return () => {
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData( signal?: AbortSignal): Promise<void> {
   const token = JSON.parse(localStorage.getItem('token') || 'null');
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/overview`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('dashboard fetch error', res.status, text);
        toast.error('Failed to load dashboard');
        return;
      }

      const json = (await res.json()) as DashboardDto;
      setDashboard(json);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // silent — component unmounted
        return;
      }
      console.error('fetchData error', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  // helpers
  const formatCurrency = (v: number | string | undefined): string => {
    const n = Number(v ?? 0);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 2,
    }).format(n);
  };

  const formatNumber = (v: number | string | undefined): string => {
    const n = Number(v ?? 0);
    return new Intl.NumberFormat().format(n);
  };

  const percentDiff = (today: number | string | undefined, yesterday: number | string | undefined): string => {
    const t = Number(today ?? 0);
    const y = Number(yesterday ?? 0);
    if (y === 0) {
      if (t === 0) return '0%';
      return '+∞%';
    }
    const diff = ((t - y) / Math.abs(y)) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  };

  const timeAgo = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    const ms = Date.now() - d.getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec} sec ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
    const days = Math.floor(hr / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // derive card values safely from backend
  const todayTotal = dashboard?.sales?.today?.total ?? 0;
  const yesterdayTotal = dashboard?.sales?.yesterday?.total ?? 0;
  const todayCount = dashboard?.sales?.today?.count ?? 0;
  const yesterdayCount = dashboard?.sales?.yesterday?.count ?? 0;
  const activeCustomers = dashboard?.active_customers_last_30_days ?? 0;
  const inventoryCounts: InventoryCounts = dashboard?.inventory?.counts ?? { in_stock: 0, low_stock: 0, out_of_stock: 0 };
  const recentLogins: RecentLogin[] = dashboard?.recent_logins ?? [];

  // fallback for Total Orders card: sum of today + yesterday counts
  const totalOrders = Number(todayCount) + Number(yesterdayCount);

  return (
    <div className="space-y-8 p-6 md:p-12 sm:p-6 bg-gray-100 min-h-screen rounded-xl">
      {/* Dashboard Heading */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Dashboard <span className="text-blue-500">Overview</span>
        </h1>
        <span className="text-gray-500 text-sm">{currentDate}</span>
      </motion.div>

      {/* KPI Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={formatCurrency(todayTotal)} diff={percentDiff(todayTotal, yesterdayTotal)} loading={loading} />
        <StatCard title="Yesterday's Sales" value={formatCurrency(yesterdayTotal)} diff={percentDiff(yesterdayTotal, /* day before yesterday not available */ 0)} loading={loading} />
        <StatCard title="Total Orders" value={formatNumber(totalOrders)} diff={percentDiff(totalOrders, yesterdayCount)} loading={loading} />
        <StatCard title="Active Customers" value={formatNumber(activeCustomers)} diff="+0.0%" loading={loading} />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        {/* Transaction Graph */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7 }}
  className="col-span-2 bg-white rounded-2xl p-6 shadow-lg"
>
  <h2 className="text-lg font-semibold mb-4">Transactions (Last 7 Days)</h2>

  <SafeSalesLineChart data={dashboard?.sales?.last_7_days ?? null} />

  {/* Last week totals */}
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="text-xs text-gray-500">Last week total</div>
      <div className="text-lg font-semibold">{formatCurrency(dashboard?.sales?.last_week_total ?? 0)}</div>
    </div>

    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="text-xs text-gray-500">Prev week total</div>
      <div className="text-lg font-semibold">{formatCurrency(dashboard?.sales?.prev_week_total ?? 0)}</div>
    </div>

    <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center">
      <div className="text-xs text-gray-500">Change vs prev week</div>
      <div
        className={`text-lg font-semibold ${
          (dashboard?.sales?.last_week_total ?? 0) >= (dashboard?.sales?.prev_week_total ?? 0) ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {percentDiff(dashboard?.sales?.last_week_total ?? 0, dashboard?.sales?.prev_week_total ?? 0)}
      </div>
    </div>
  </div>
</motion.div>


        {/* Inventory Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7 }} className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>

          <SafeInventoryStatusChart counts={inventoryCounts} />
          <div className="mt-4 text-sm text-gray-600">
            <div>In stock: {formatNumber(inventoryCounts.in_stock)}</div>
            <div>Low stock: {formatNumber(inventoryCounts.low_stock)}</div>
            <div>Out of stock: {formatNumber(inventoryCounts.out_of_stock)}</div>
          </div>
        </motion.div>
      </div>

      {/* Full-width Recent User Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.7 }} className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent User Activity</h2>

        <ul className="divide-y divide-gray-100 text-sm text-gray-700">
          {recentLogins.length === 0 && <li className="py-4 text-gray-500">No recent logins</li>}

          {recentLogins.map((u) => (
            <li key={u.staff_id} className="flex justify-between items-center py-3 hover:bg-gray-50 rounded-lg transition">
              <div>
                <p className="font-medium text-gray-900">{u.full_name || u.email}</p>
                <p className="text-gray-500 text-xs">{u.email} • last login {timeAgo(u.last_login)}</p>
              </div>
              <span className="text-gray-400 text-xs">{u.last_login ? new Date(u.last_login).toLocaleString() : ''}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
