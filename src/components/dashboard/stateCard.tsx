'use client';

import { useEffect, useState } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  diff?: string;
  loading?: boolean;
};

export default function StatCard({ title, value, diff = '', loading = false }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  // normalize to string for parsing (preserve original for prefix/suffix)
  const valueStr = String(value ?? '');
  const prefixMatch = valueStr.match(/^[^\d\-\.\,]+/) ?? [];
  const suffixMatch = valueStr.match(/[^\d\-\.\,]+$/) ?? [];
  const prefix = prefixMatch[0] ?? '';
  const suffix = suffixMatch[0] ?? '';

  // parse numeric part (allow decimals and negative)
  const numericString = valueStr.replace(/[^0-9.-]/g, '') || '0';
  const target = Number(numericString);

  useEffect(() => {
    if (loading) {
      // while loading, don't run the number animation
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const absTarget = Math.abs(target);
    const steps = 50;
    const step = Math.max(1, Math.ceil(absTarget / steps));
    const sign = target < 0 ? -1 : 1;

    // if target is small decimal, animate using a fraction approach
    if (absTarget > 0 && absTarget < steps) {
      const increment = (target) / steps;
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayValue(Number((increment * i).toFixed(2)));
        if (i >= steps) {
          setDisplayValue(target);
          clearInterval(interval);
        }
      }, 10);
      return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      start += step;
      const current = Math.min(start, absTarget) * sign;
      setDisplayValue(current);
      if (Math.abs(start) >= absTarget) {
        setDisplayValue(target);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [valueStr, target, loading]);

  const formattedNumber = (() => {
    // keep decimals if original had them
    const hasDecimal = /\./.test(numericString);
    if (hasDecimal) {
      // show up to 2 decimals
      return displayValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return Math.round(displayValue).toLocaleString();
  })();

  return (
    <div className="relative bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-5 text-center hover:shadow-md transition duration-300">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent rounded-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>

        {loading ? (
          // skeleton
          <div className="mt-3 space-y-2">
            <div className="mx-auto h-8 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="mx-auto h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-semibold text-gray-900 mt-3">
              {prefix}
              {formattedNumber}
              {suffix}
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                diff.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {diff}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
