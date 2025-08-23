'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type DayPoint = {
  date: string;      // e.g. "2025-08-18" or "18 Aug"
  total: number;
  count?: number;
};

type Props = {
  data?: any | null;
  height?: number;
};

function formatCurrencyNGN(v: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(v);
}

/**
 * Normalizes different backend shapes into an array of { date, total, count }.
 * Accepts:
 * - array [{ date: '2025-08-18', total: 123, count: 2 }, ...]
 * - object { '2025-08-12': { total: 12, count: 1 }, ... }
 * - null/undefined -> generates last 7 days with zeroes
 */
function normalize(data: any): DayPoint[] {
  if (!data) {
    // fallback: last 7 days zeros
    const out: DayPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        total: 0,
        count: 0,
      });
    }
    return out;
  }

  // If array already
  if (Array.isArray(data)) {
    // Map items to ensure fields exist
    return data.map((r: any) => {
      const rawDate = r.date ?? r.label ?? r.day ?? r.x ?? '';
      const label = rawDate
        ? new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : String(r.date ?? r.label ?? '');
      return {
        date: label,
        total: Number(r.total ?? r.amount ?? r.sales ?? 0),
        count: r.count != null ? Number(r.count) : undefined,
      };
    });
  }

  // If it's an object keyed by date
  if (typeof data === 'object') {
    const keys = Object.keys(data).sort();
    return keys.map((k) => {
      const val = data[k];
      const label = (() => {
        const d = new Date(k);
        if (!isNaN(d.getTime())) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return k;
      })();
      return {
        date: label,
        total: Number(val?.total ?? val?.amount ?? val?.sales ?? 0),
        count: val?.count != null ? Number(val.count) : undefined,
      };
    });
  }

  // fallback
  return normalize(null);
}

export default function SalesLineChart({ data = null, height = 300 }: Props) {
  const chartData = useMemo(() => normalize(data), [data]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v)} />
          <Tooltip
            formatter={(value: any, name: string) => {
              if (name === 'total') return [formatCurrencyNGN(Number(value)), 'Sales'];
              if (name === 'count') return [Number(value), 'Orders'];
              return [value, name];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="total" name="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="count" name="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
