// src/lib/format.ts
export const formatPrice = (value: number) =>
  `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
