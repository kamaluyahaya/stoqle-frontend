// FeaturedProducts.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import ProductModal from "./ProductModal"
import { ApiProduct, RawImage } from "../lib/types"


interface ProductCard {
  id: number
  name: string
  slug: string
  price: string
  costPrice?: string | null
  category?: string | null
  vendorName?: string | null
  vendorSlug?: string | null
  image?: string | null
  hasVariants?: boolean
  status?: string
}

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [products, setProducts] = useState<ProductCard[]>([])
  const [rawProducts, setRawProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // modal state
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [productDetail, setProductDetail] = useState<ApiProduct | null>(null)

  // helper to extract URL from API image entry whether it's a string or an object
  const extractImageUrl = (img?: RawImage | null) => {
    if (!img) return null
    if (typeof img === "string") {
      if (img.startsWith("http")) return img
      if (img.startsWith("/")) return `https://api.stoqle.com${img}`
      return img
    }
    // object
    const url = (img && (img as any).file_url) || null
    if (!url) return null
    if (url.startsWith("http")) return url
    if (url.startsWith("/")) return `https://api.stoqle.com${url}`
    return url
  }

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("https://api.stoqle.com/api/products", { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json || !json.success) throw new Error("API returned unsuccessful response")

        const data: ApiProduct[] = json.data || []

        // Save raw products (full objects) so we can open modal without another request
        if (mounted) setRawProducts(data)

        const mapped: ProductCard[] = data.map((p) => {
          const firstImage = p.images && p.images.length > 0 ? extractImageUrl(p.images[0]) : null
          return {
            id: p.product_id,
            name: p.product_name,
            slug: p.slug || String(p.product_id),
            price: p.price,
            costPrice: p.cost_price ?? null,
            category: p.category_name ?? null,
            vendorName:  p.business_name ?? null,
            vendorSlug: p.business_slug ?? null,
            image: firstImage,
            hasVariants: Boolean(p.has_variants && Number(p.has_variants) > 0),
            status: p.status
          }
        })

        if (mounted) {
          setProducts(mapped)
          // reset scroll to start
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ left: 0, behavior: "auto" })
              const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
              setCanScrollLeft(scrollLeft > 0)
              setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
            }
          }, 50)
        }
      } catch (err: any) {
        if (err.name === "AbortError") return
        setError(err.message || "Failed to load products")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  const duplicatedProducts = [...products, ...products]

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const onResize = () => checkScrollButtons()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [products])

  useEffect(() => {
    const autoScroll = () => {
      if (!isHovered && scrollRef.current && products.length > 0) {
        const { scrollLeft } = scrollRef.current
        const cardWidth = 320 + 24
        if (scrollLeft <= 0) {
          scrollRef.current.scrollTo({ left: products.length * cardWidth, behavior: "auto" })
        } else {
          scrollRef.current.scrollBy({ left: -1, behavior: "auto" })
        }
      }
    }

    const interval = setInterval(autoScroll, 30)
    return () => clearInterval(interval)
  }, [isHovered, products])

  const scrollLeftAction = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const scrollRightAction = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const formatCurrency = (value?: string | null) => {
    if (!value) return ""
    const num = Number(value)
    if (Number.isNaN(num)) return value
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(num)
  }

  // modal helpers — now pick product from rawProducts instead of fetching
  const openModal = (id: number) => {
    setSelectedId(id)
    const found = rawProducts.find((r) => r.product_id === id) || null
    setProductDetail(found)
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setProductDetail(null)
    setSelectedId(null)
  }

  return (
        
    <section className="space-y-8 mt-20 bg-gray-100 min-h-screen rounded-xl">
              <div className="max-w-7xl mx-auto px-4">

          <div className="mx-7xl">
        <h1 className="p-10 text-4xl sm:text-6xl font-bold text-gray-900 px-4 sm:px-0">
          Featured <span className="text-blue-500">Product</span>
        </h1>
      </div>
      </div>


      <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <button
          onClick={scrollLeftAction}
          disabled={!canScrollLeft}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center transition-all duration-200 ${
            canScrollLeft ? "hover:scale-105 text-slate-700" : "text-slate-300 cursor-not-allowed"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={scrollRightAction}
          disabled={!canScrollRight}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center transition-all duration-200 ${
            canScrollRight ? "hover:scale-105 text-slate-700" : "text-slate-300 cursor-not-allowed"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {loading && <div className="py-12 text-center">Loading products...</div>}
        {error && <div className="py-12 text-center text-red-600">{error}</div>}

        {!loading && !error && (
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {duplicatedProducts.map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                className="group relative bg-white rounded-3xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 flex flex-col flex-shrink-0 w-80"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <Tag className="w-3 h-3" />
                    {p.category || "Product"}
                  </span>
                </div>

                <div className="relative overflow-hidden bg-white">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={400}
                      height={240}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src="/placeholder-product.svg"
                      alt={p.name}
                      width={400}
                      height={240}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/12 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm lg:text-md text-slate-900 group-hover:text-slate-700 transition-colors">{p.name}</h3>
                  </div>

                  <p className="text-slate-600 text-sm mb-4">
                    {p.vendorName ? (
                      <Link href={`/vendors/${p.vendorSlug || "#"}`} className="text-xs hover:underline">
                        {p.vendorName}
                      </Link>
                    ) : (
                      <span className="text-xs">{p.vendorName || "Unknown vendor"}</span>
                    )}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-lg font-semibold">{formatCurrency(p.price)}</span>
                      {p.costPrice && Number(p.costPrice) > 0 && (
                        <span className="text-sm line-through text-slate-400">{formatCurrency(p.costPrice)}</span>
                      )}
                    </div>
                    {p.hasVariants && <p className="text-xs text-slate-500 mt-1">Has variants</p>}
                    {p.status && <p className="text-xs text-slate-400 mt-1">Status: {p.status}</p>}
                  </div>

                  <button
                    onClick={() => openModal(p.id)}
                    className="text-sm lg:text-md w-full bg-slate-900 hover:bg-black text-white font-medium py-3 px-4 rounded-full transition duration-200 flex items-center justify-center gap-2 group-hover:gap-3 shadow-sm hover:shadow-md mt-auto"
                  >
                    View Product
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-2">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 hover:gap-3 py-2 px-6 border border-gray-900 text-gray-900 text-center rounded-full transition-all hover:bg-white/80 transition-colors duration-200 backdrop-blur-md bg-white/60"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* pass the full product object (productDetail) to the modal so it doesn't need to fetch */}
      <ProductModal product={productDetail} isOpen={open} onClose={closeModal} />
    </section>
  )
}
