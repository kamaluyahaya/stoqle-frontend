"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, User, Filter, Heart, X } from "lucide-react"
import ProductModal from "../components/ProductModal"
import NavbarElse from "../components/NavbarElse"
import FeaturedProducts from "../components/featuredProduct"
import Footer from "../components/Footer"

// ---------- Types ----------
interface ProductImage {
  image_id: number
  product_id: number
  file_url: string
  position: number
  created_at: string
}

interface ProductVariant {
  variant_id: number
  product_id: number
  name: string
  value: string
  barcode: string
  extra_price: string
  cost_price: string | null
  variant_quantity: number
  low_stock_alert: number
}

interface ApiProduct {
  product_id: number
  business_id: number
  product_name: string
  description: string | null
  price: string
  cost_price: string | null
  slug: string
  status: string
  has_variants: number
  created_at: string
  category_name: string
  business_name: string
  business_slug: string
  business_phone: string
  business_address: string
  business_status: string | null
  vendor_id: number
  vendor_name: string
  vendor_phone: string
  images: ProductImage[]
  variants: ProductVariant[]
}

// ---------- Mock / Config ----------
const API_PRODUCTS = "https://api.stoqle.com/api/products"

// ---------- Small utility components (typed) ----------
type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

const IconButton: React.FC<IconButtonProps> = ({ children, className = "", ...rest }) => {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-xl p-2 shadow-sm bg-white/60 backdrop-blur border border-gray-100 ${className}`}
    >
      {children}
    </button>
  )
}

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-gradient-to-r from-slate-50 to-white shadow-sm border border-gray-100">
      {children}
    </span>
  )
}

// ---------- Product Card ----------
const ProductCard: React.FC<{ p: ApiProduct; onOpen: (p: ApiProduct) => void }> = ({ p, onOpen }) => {
  const image = p.images?.[0]?.file_url || `https://picsum.photos/seed/stoqle-${p.product_id}/800/800`

  return (
    <motion.article
      layout
      whileHover={{ translateY: -6 }}
      className="group bg-white rounded-2xl p-4 shadow-md hover:shadow-xl border border-gray-100"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
        <img src={image} alt={p.product_name} className="object-cover w-full h-full" loading="lazy" />
        <div className="absolute top-3 left-3">
          {p.status === "active" && <Badge>Active</Badge>}
        </div>
        <button onClick={() => onOpen(p)} className="absolute inset-0" aria-label={`Open ${p.product_name} details`} />
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold text-slate-900 truncate">{p.product_name}</h3>
        <p className="text-[12px] text-slate-500 mt-1 truncate">{p.business_name}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">₦{Number(p.price).toLocaleString()}</div>
            <div className="text-[12px] text-slate-500">{p.category_name}</div>
          </div>

          <div className="flex gap-2 items-center">
            {/* <IconButton aria-label="Add to wishlist">
              <Heart size={16} />
            </IconButton>
            <IconButton aria-label="Open product details" onClick={() => onOpen(p)}>
              <ShoppingCart size={16} />
            </IconButton> */}
          </div>
        </div>
      </div>
    </motion.article>
  )
}


// ---------- Main page component (TypeScript, fetches from API) ----------
const StoqleMarketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [query, setQuery] = useState<string>("")
  const [selected, setSelected] = useState<ApiProduct | null>(null)
  const [cartCount, setCartCount] = useState<number>(0)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(API_PRODUCTS)
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
        const json = await res.json()
        const data: ApiProduct[] = json?.data || []
        if (!mounted) return
        setProducts(data)

        const cats = Array.from(new Set(data.map((d) => d.category_name || "Uncategorized")))
        setCategories(["All", ...cats])
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "Unknown error")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      mounted = false
    }
  }, [])

  const filtered = products.filter((p) => {
    return (
      (activeCategory === "All" || p.category_name === activeCategory) &&
      (query.trim() === "" || p.product_name.toLowerCase().includes(query.toLowerCase()) || (p.description || "").toLowerCase().includes(query.toLowerCase()))
    )
  })

    const [open, setOpen] = useState(false)

  function openProduct(p: ApiProduct) {
    setSelected(p)
  }

  

  function closeModal() {
    setSelected(null)
  }

  return (
    <>
    <div className="min-h-screen bg-white max-w-7xl mx-auto my-20 px-4">
            <NavbarElse />

             <div className="mb-6 text-center">

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 px-4 sm:px-0">
          Our <span className="text-blue-500">Products</span>
        </h1>
        
      </div>

            
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4">
  <div className="flex-1 flex items-center">
    <div className="flex items-center gap-3 rounded-3xl bg-white/60 backdrop-blur px-3 py-2 border border-gray-100 shadow-sm w-full">
      <Search size={16} className="text-slate-500" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands, categories"
        className="bg-transparent outline-none placeholder:text-slate-400 w-full text-sm"
      />
    </div>
  </div>
</header>


      <main className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / categories */}
        <aside className="hidden lg:block">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-6">
            <h4 className="text-sm font-semibold">Categories</h4>
            <div className="mt-4 flex flex-col gap-3">
              {(categories.length ? categories : ["All"]).map((c) => (
                <button key={c} onClick={() => setActiveCategory(c)} className={`text-sm text-left px-3 py-2 rounded-xl w-full ${activeCategory === c ? "bg-slate-900 text-white" : "bg-white/50"}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h5 className="text-xs text-slate-500">Price</h5>
              <div className="mt-3 flex gap-2">
                <input className="w-full rounded-lg p-3 border border-gray-100" placeholder="Min" />
                <input className="w-full rounded-lg p-3 border border-gray-100" placeholder="Max" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="lg:col-span-3">
          {/* Hero / featured */}
          <div className="bg-gradient-to-r from-white to-slate-50 rounded-3xl p-6 shadow-lg border border-gray-100 flex items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Discover premium products — crafted for modern living</h1>
              <p className="text-slate-600 mt-3">Browse curated collections and shop from trusted vendors across Nigeria and beyond.</p>

              <div className="mt-6 flex gap-3">
                <button className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-semibold shadow">Shop featured</button>
                <button className="px-4 py-3 rounded-2xl border border-gray-100">Explore categories</button>
              </div>
            </div>

            <div className="w-80 hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={products[0]?.images?.[0]?.file_url || `https://picsum.photos/seed/stoqle-featured/800/600`} alt="Featured" className="w-full h-56 object-cover" />
              </div>
            </div>
          </div>

          {/* Search for small screens */}
          <div className="mt-6 md:hidden">
            <div className="flex items-center gap-3 rounded-3xl bg-white/60 backdrop-blur px-3 py-2 border border-gray-100 shadow-sm">
              <Search size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="bg-transparent outline-none placeholder:text-slate-400 w-full text-sm" />
            </div>
          </div>

          {/* Products grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Popular right now</h3>
              <div className="text-sm text-slate-500">{loading ? "Loading..." : `${filtered.length} results`}</div>
            </div>

            {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-56" />
                  ))
                : filtered.map((p) => <ProductCard key={p.product_id} p={p} onOpen={openProduct} />)}
            </div>
          </div>

          {/* Pagination / load more */}
          <div className="mt-8 flex justify-center">
            <button className="px-6 py-3 rounded-2xl border border-gray-100">Load more</button>
          </div>
        </section>
      </main>


      {/* Product modal */}
      <ProductModal product={selected} isOpen={!!selected} onClose={closeModal} />


            


      <footer className="max-w-7xl mx-auto mt-12 text-center text-sm text-slate-500">© {new Date().getFullYear()} Stoqle — Crafted by KSOFT Technova</footer>
    </div>
    <FeaturedProducts />
          <Footer />
    </>
  )
}

export default StoqleMarketplace
