import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type Counts = { in_stock?: number; low_stock?: number; out_of_stock?: number; reserved?: number };
type Entry = { name: string; value: number };

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function InventoryStatusChart({
  counts,
  data,
}: {
  counts?: Counts;
  data?: Entry[];
}) {
  // normalize input: prefer explicit data, else build from counts, else fallback sample
  const normalized: Entry[] =
    data && data.length
      ? data
      : counts
      ? [
          { name: 'In Stock', value: counts.in_stock ?? 0 },
          { name: 'Low Stock', value: counts.low_stock ?? 0 },
          { name: 'Out of Stock', value: counts.out_of_stock ?? 0 },
          { name: 'Reserved', value: counts.reserved ?? 0 },
        ]
      : [
          { name: 'In Stock', value: 500 },
          { name: 'Low Stock', value: 120 },
          { name: 'Out of Stock', value: 50 },
          { name: 'Reserved', value: 80 },
        ];

  const total = normalized.reduce((s, e) => s + (e.value || 0), 0);
  if (total === 0)
    return (
      <div className="bg-white/50 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/30">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Inventory Status</h2>
        <div className="py-8 text-center text-sm text-gray-500">No inventory data</div>
      </div>
    );

  return (
    <div className="bg-white/50 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/30">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Inventory Status</h2>

      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={normalized}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={4}
                label={(entry) =>
                  `${entry.name} ${Math.round(((entry.value as number) / total) * 100)}%`
                }
              >
                {normalized.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                formatter={(val: any) => `${val} items`}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 mt-6 md:mt-0 md:ml-6 text-sm">
          {normalized.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <div className="text-gray-700">{entry.name}</div>
                <div className="text-xs text-gray-500">
                  {entry.value} • {Math.round((entry.value / total) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
