'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

type InventoryCounts = {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
};

type Props = {
  counts?: InventoryCounts | null;
  height?: number;
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // green, amber, red

export default function InventoryPieChart({ counts = null, height = 300 }: Props) {
  const data = useMemo(() => {
    const c = counts ?? { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    return [
      { name: 'In stock', value: Number(c.in_stock ?? 0) },
      { name: 'Low stock', value: Number(c.low_stock ?? 0) },
      { name: 'Out of stock', value: Number(c.out_of_stock ?? 0) },
    ];
  }, [counts]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={4}
            label={(entry) => `${entry.name} (${entry.value})`}
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => [v, 'Items']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
