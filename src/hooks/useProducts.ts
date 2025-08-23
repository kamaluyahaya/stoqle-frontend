// src/hooks/useProducts.ts
'use client';
import { Product } from '@/components/types';
import { useEffect, useState } from 'react';

const DEFAULT_STORE_ID = 'all-products';

type UseProductsReturn = {
  products: Product[];
  loading: boolean;
  fetchProducts: (storeId?: string) => Promise<void>;
};

export default function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // helper: normalize possible created timestamp/date fields into milliseconds
  const extractTimestamp = (obj: any): number => {
    if (!obj) return 0;
    const candidates = [
      obj.created_at,
      obj.createdAt,
      obj.createdAtTimestamp,
      obj.created_at_ms,
      obj.createdAtMillis,
      obj.timestamp,
      obj.time,
    ];

    for (const c of candidates) {
      if (c == null) continue;
      // try parse as date string
      const asDate = Date.parse(String(c));
      if (!Number.isNaN(asDate)) return asDate;
      // try parse as number (unix ms or secs)
      const asNum = Number(c);
      if (!Number.isNaN(asNum)) {
        // if it looks like seconds (10-digit) convert to ms
        if (String(Math.trunc(asNum)).length <= 10) return asNum * 1000;
        return asNum;
      }
    }

    // fallback: try to use numeric part of product_id (useful when id increments)
    const pid = obj.product_id ?? obj.id ?? '';
    if (typeof pid === 'string') {
      const firstPart = pid.split?.('-')?.[0] ?? pid;
      const n = Number(firstPart);
      if (!Number.isNaN(n)) return n;
    } else if (typeof pid === 'number') {
      return pid;
    }

    return 0;
  };

  const fetchProducts = async (storeid?: string) => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');

      let apiUrl: string;
      if (storeid === DEFAULT_STORE_ID) {
        // fetch all business-wide products
        // include business id as a query param to personalize (if backend expects it)
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products/business/${parsedUser.business_id}`;
      } else {
        // include businessId query param to make request explicitly for this business/store
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products/me/details/${storeid}?businessId=${parsedUser.business_id}`;
      }

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 401 || data.message === 'Unauthorized') {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) throw new Error(data.message || 'Failed to fetch');

      // Build formatted products while preserving category_id, variant_id and adding business_id
      const formattedProducts: Product[] = (data.products || []).flatMap((p: any) => {
        // normalize category id from possible shapes on the API object
        const rawCategoryId = p.category_id ?? p.category?.category_id ?? p.categoryId ?? p.cat_id ?? null;
        const category_id = rawCategoryId != null ? String(rawCategoryId) : null;

        // determine business id preference: prefer logged-in user's business_id, fallback to product's
        const businessId = (parsedUser?.business_id ?? p.business_id ?? p.businessId ?? null) != null
          ? String(parsedUser?.business_id ?? p.business_id ?? p.businessId)
          : null;

        const makeProduct = (overrides: any = {}, originalObj?: any) => {
          const base = {
            product_id: String(overrides.product_id ?? p.product_id),
            parent_product_id: String(p.product_id ?? ''),
            name: overrides.name ?? p.name,
            barcode: overrides.barcode ?? p.barcode ?? null,
            price: Number(overrides.price ?? parseFloat(String(p.price || 0))) || 0,
            image: overrides.image ?? p.images?.[0]?.file_url ?? p.image ?? '',
            category_id,
            variant_id: overrides.variant_id ?? null,
            sku: overrides.sku ?? p.sku ?? p.code ?? null,
            has_variants: !!p.has_variants,
            business_id: businessId,
            // keep a created_at field if present so ordering can use it
            created_at: p.created_at ?? p.createdAt ?? null,
            // keep original raw payload for debugging if needed
            __raw: originalObj ?? p,
          };

          return base;
        };

        if (p.has_variants && Array.isArray(p.variants) && p.variants.length > 0) {
          return p.variants.map((v: any) => {
            const extra = parseFloat(String(v.extra_price ?? 0)) || 0;
            return makeProduct({
              product_id: `${p.product_id}-${v.variant_id}`,
              name: `${p.name} ${v.name ?? ''} ${v.value ?? ''}`.trim(),
              barcode: v.barcode ?? p.barcode ?? null,
              price: (parseFloat(String(p.price || 0)) || 0) + extra,
              image: v.image ?? p.images?.[0]?.file_url ?? '',
              variant_id: v.variant_id != null ? String(v.variant_id) : null,
              sku: v.sku ?? v.code ?? p.sku ?? null,
            }, { parent: p, variant: v });
          });
        } else {
          return [
            makeProduct({
              product_id: String(p.product_id),
              variant_id: null,
              name: p.name,
              price: parseFloat(String(p.price || 0)) || 0,
              barcode: p.barcode ?? null,
              image: p.images?.[0]?.file_url ?? p.image ?? '',
              sku: p.sku ?? p.code ?? null,
            }, p),
          ];
        }
      });

      // sort newest first using available timestamps (robust)
      formattedProducts.sort((a: any, b: any) => {
        // Prefer created_at field on the formatted product (__raw kept in case)
        const ta = extractTimestamp(a.__raw ?? a);
        const tb = extractTimestamp(b.__raw ?? b);
        return tb - ta; // newest first
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error('useProducts.fetchProducts error', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // no automatic fetch here — leave the caller to pass storeId (SalesPage already does)
  }, []);

  return { products, loading, fetchProducts };
}
