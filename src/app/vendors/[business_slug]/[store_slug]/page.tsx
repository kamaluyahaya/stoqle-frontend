"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, X, Phone, MapPin, Building2 } from "lucide-react";
import NavbarElse from "@/app/components/NavbarElse";
import Footer from "@/app/components/Footer";
import ProductModal from "@/app/components/productModelView"; // keep your existing ProductModal
import { Product } from "@/components/types";
import { ApiProduct, ApiStore, ApiVendor } from "@/app/lib/types";
import VendorModal from "@/app/components/vendorModal";
import FeaturedVendors from "@/app/components/FeaturedVendors";

function getImageUrl(img?: string | { file_url?: string } | null): string | undefined {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return (img.file_url || (img as any).url) ?? undefined;
}

// Small store/vendor types
interface StoreSmall {
  store_id: number;
  store_name: string;
  store_slug: string;
  store_logo: string | null;
  description: string;
  is_default: number;
  total_products?: number;
}
interface Vendor {
  staff_id: number;
  full_name: string;
  email: string;
  profile_image: string | null;
  status: string;
  business_id: number;
  business_name: string;
  business_slug: string;
  business_category: string;
  business_logo: string | null;
  business_address: string;
  phone: string;
  stores: StoreSmall[];
}
interface StoreApiResponse { success: boolean; data: { store: any; vendor: Vendor } }

const API_STORE_BY_SLUG = "https://api.stoqle.com/api/stores"; // append /:slug

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-50 border border-gray-100">
    {children}
  </span>
);

// Product card is clickable and opens product modal
const ProductCard: React.FC<{ p: ApiProduct; onClick: (p: ApiProduct) => void }> = ({ p, onClick }) => {
  const firstImageRaw = (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : undefined;
  const imageUrl = getImageUrl(firstImageRaw) || (p as any).image_url || undefined;

  const priceNumber = typeof p.price === "string" ? parseFloat(p.price as string) || 0 : (p.price as number) ?? 0;
  const initial = (p.product_name || "P").trim().charAt(0).toUpperCase();

  return (
    <button
      onClick={() => onClick(p)}
      className="text-left bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md focus:shadow-md transform-gpu hover:-translate-y-0.5 transition-all"
      aria-label={`Open ${p.product_name} details`}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={p.product_name} className="object-cover w-full h-full" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-3xl sm:text-4xl font-semibold text-slate-600 select-none">{initial}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm font-semibold truncate">{p.product_name}</div>
        <div className="text-xs text-slate-500">{p.category_name || "—"}</div>
        <div className="mt-2 text-sm font-semibold">₦{Number(priceNumber).toLocaleString()}</div>
      </div>
    </button>
  );
};

// ---------- Main page component ----------
// NOTE: accept `props: any` to avoid Next's generated PageProps name collision.
export default function StorePageClient(props: any) {
  const router = useRouter();
  const hookParams = useParams();

  // If Next passes params via props (server->client), prefer them; otherwise use useParams hook.
  const paramsFromProps = props?.params ?? null;
  const params = paramsFromProps && Object.keys(paramsFromProps).length ? paramsFromProps : hookParams ?? {};

  const resolvedBusinessSlug =
    props?.businessSlug ?? params.business_slug ?? params.business ?? params.businessSlug;
  const resolvedStoreSlug =
    props?.storeSlug ?? params.store_slug ?? params.store ?? params.storeSlug;

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // modal states
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);

  const [vendor, setVendor] = useState<ApiVendor | null>(null);
  const [store, setStore] = useState<ApiStore | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadFromStoreEndpoint(storeSlugToUse?: string) {
      setLoading(true);
      setError(null);

      try {
        if (!storeSlugToUse) throw new Error("Missing store slug");

        const url = `${API_STORE_BY_SLUG}/${encodeURIComponent(storeSlugToUse)}`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Store endpoint returned ${res.status}`);
        }

        const json: StoreApiResponse = await res.json();
        if (!mounted) return;

        if (!json?.success || !json?.data) {
          throw new Error("Invalid store response");
        }

        const { store: storeData, vendor: vendorData } = json.data;
        const normalizedProducts: ApiProduct[] = (storeData.products || []).map((p: any) => {
          const rawImages: any[] = Array.isArray(p.images)
            ? p.images.map((ri: any) => (typeof ri === "string" ? { file_url: ri } : ri))
            : [];
          if ((!rawImages || rawImages.length === 0) && p.image_url) {
            rawImages.push({ file_url: p.image_url });
          }
          return {
            ...p,
            images: rawImages,
          } as ApiProduct;
        });

        if (vendorData) {
          const normalizedStores: ApiStore[] = (vendorData.stores || []).map((s: any) => ({
            store_id: s.store_id,
            store_name: s.store_name,
            store_slug: s.store_slug,
            store_logo: s.store_logo ?? null,
            description: s.description ?? "",
            is_default: s.is_default ?? 0,
            total_products: typeof s.total_products === "number" ? s.total_products : Number(s.total_products ?? 0),
          }));

          setVendor({
            ...vendorData,
            stores: normalizedStores,
          } as ApiVendor);
        } else {
          setVendor(null);
        }

        setStore({
          store_id: storeData.store_id,
          store_name: storeData.store_name,
          store_slug: storeData.store_slug,
          store_logo: (storeData as any).logo_url ?? null,
          description: storeData.description ?? "",
          is_default: storeData.is_default ?? 0,
          total_products: normalizedProducts.length,
        } as ApiStore);

        setProducts(normalizedProducts);
      } catch (err: any) {
        if (controller.signal.aborted) return;
        console.error("store endpoint error:", err);
        setError(err?.message ?? "Failed to load store");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!resolvedStoreSlug) {
      setError("Missing store slug");
      setLoading(false);
    } else {
      loadFromStoreEndpoint(resolvedStoreSlug);
    }

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedStoreSlug]);

  const filtered = products.filter((p) => (query.trim() === "" ? true : p.product_name?.toLowerCase().includes(query.toLowerCase())));

  function openVendorModal() {
    setVendorModalOpen(true);
  }
  function closeVendorModal() {
    setVendorModalOpen(false);
  }

  function openProductModal(product: ApiProduct) {
    setSelectedProduct(product);
    setProductModalOpen(true);
  }
  function closeProductModal() {
    setSelectedProduct(null);
    setProductModalOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-white max-w-7xl mx-auto my-20 px-4">
        <NavbarElse />

        <div className="mt-6 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-white/60">
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold truncate">{store?.store_name || vendor?.business_name || "Store"}</h1>
              <p className="text-sm text-slate-500 mt-1">{vendor?.business_category} • {vendor?.phone}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge>{vendor?.status ?? "—"}</Badge>
              <a href={`tel:${vendor?.phone || ""}`} className="text-sm px-4 py-2 rounded-lg border border-gray-100">Call</a>
              <button onClick={() => setIsOpen(true)} className="text-sm px-4 py-2 rounded-lg border border-gray-100">View vendor</button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-50">
              <img
                src={store?.store_logo || vendor?.business_logo || `https://picsum.photos/seed/store-${vendor?.business_id || "anon"}/800/600`}
                alt={store?.store_name || vendor?.business_name}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm text-slate-600">{store?.description || vendor?.business_address || "No description or address provided."}</p>
            </div>
          </div>
        </div>

        <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4">
          <div className="flex-1 flex items-center">
            <div className="flex items-center gap-3 rounded-3xl bg-white/60 backdrop-blur px-3 py-2 border border-gray-100 shadow-sm w-full">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search this store"
                className="bg-transparent outline-none placeholder:text-slate-400 w-full text-sm"
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Products</h2>
            <div className="text-sm text-slate-500">{loading ? "Loading..." : `${filtered.length} results`}</div>
          </div>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-56" />
              ))
            ) : filtered.length ? (
              filtered.map((p) => <ProductCard key={p.product_id} p={p} onClick={openProductModal} />)
            ) : (
              <div className="text-sm text-slate-500">No products found for this store.</div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button className="px-6 py-3 rounded-2xl border border-gray-100">Load more</button>
          </div>
        </main>

        <VendorModal vendor={vendor} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <ProductModal product={selectedProduct} vendor={vendor} isOpen={productModalOpen} onClose={closeProductModal} />

        <footer className="max-w-7xl mx-auto mt-12 text-center text-sm text-slate-500">© {new Date().getFullYear()} Stoqle — Crafted by KSOFT Technova</footer>
      </div>

      <FeaturedVendors />

      <Footer />
    </>
  );
}
