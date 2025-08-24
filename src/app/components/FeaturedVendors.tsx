// FeaturedVendors.tsx

"use client"

import Link from "next/link"
import Image from "next/image"
import { Award, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import StoreModal from "./storeModal" // create a modal similar to ProductModal
import { ApiVendor } from "../lib/types"


// local card view model
interface VendorCard {
  id: number
  name: string
  slug: string
  image?: string | null
  badge?: string
  tagline?: string
}

export default function FeaturedVendors() {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const [vendors, setVendors] = useState<VendorCard[]>([])
  const [rawVendors, setRawVendors] = useState<ApiVendor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // modal state
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [vendorDetail, setVendorDetail] = useState<ApiVendor | null>(null)

  // Fetch vendors
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const fetchVendors = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("https://api.stoqle.com/api/vendors", {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json || !json.success) throw new Error("API returned unsuccessful response")

        const data: ApiVendor[] = json.data || []

        if (mounted) {
          setRawVendors(data)

          const mapped: VendorCard[] = data.map((v) => ({
            id: v.business_id,
            name: v.business_name || v.full_name,
            slug: v.business_slug || String(v.business_id),
            image: v.business_logo || v.profile_image || null,
            badge: v.status === "Active" ? "Top Rated" : undefined,
            tagline: v.business_category || "",
          }))

          setVendors(mapped)
        }
      } catch (err: any) {
        if (err.name === "AbortError") return
        setError(err.message || "Failed to load vendors")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchVendors()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  // scroll checks
  const checkScrollButtons = () => {
    if (!scrollRef.current) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const hasOverflow = scrollWidth > clientWidth + 1
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScrollButtons()
    const onResize = () => checkScrollButtons()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [vendors])

  // auto scroll
  useEffect(() => {
    if (!scrollRef.current) return

    const autoScroll = () => {
      if (!isHovered && scrollRef.current && vendors.length > 0) {
        const el = scrollRef.current
        const { scrollLeft, scrollWidth, clientWidth } = el
        const maxScroll = scrollWidth - clientWidth
        if (scrollLeft >= maxScroll - 0.5) {
          el.scrollTo({ left: 0, behavior: "auto" })
        } else {
          el.scrollBy({ left: 1, behavior: "auto" })
        }
      }
    }

    const interval = setInterval(autoScroll, 30)
    return () => clearInterval(interval)
  }, [isHovered, vendors])

  const scrollLeftAction = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const scrollRightAction = () => {
    if (scrollRef.current) {
      const el = scrollRef.current
      const { scrollLeft, scrollWidth, clientWidth } = el
      const maxScroll = scrollWidth - clientWidth
      if (scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "auto" })
        setTimeout(() => el.scrollBy({ left: 320, behavior: "smooth" }), 20)
      } else {
        el.scrollBy({ left: 320, behavior: "smooth" })
      }
      setTimeout(checkScrollButtons, 350)
    }
  }

  // modal helpers
  const openModal = (id: number) => {
    setSelectedId(id)
    const found = rawVendors.find((r) => r.business_id === id) || null
    setVendorDetail(found)
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setVendorDetail(null)
    setSelectedId(null)
  }

  return (
    <section className="px-0 py-16 bg-gray-50">
      <div className="mx">
            <h1 className="m-10 p-10 text-4xl sm:text-4xl font-bold text-gray-900 px-4 sm:px-0">
              Meet verified <span className="text-blue-500"> Vendors</span>
            </h1>
          </div>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scroll buttons */}
        <button
          onClick={scrollLeftAction}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center transition-all duration-200 ${
            canScrollLeft
              ? "hover:bg-slate-50 hover:shadow-xl text-slate-700"
              : "text-slate-300 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={scrollRightAction}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center transition-all duration-200 ${
            canScrollRight
              ? "hover:bg-slate-50 hover:shadow-xl text-slate-700"
              : "text-slate-300 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Loading and error states */}
        {loading && <div className="py-12 text-center">Loading vendors...</div>}
        {error && <div className="py-12 text-center text-red-600">{error}</div>}

        {!loading && !error && (
          <div
            ref={scrollRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 flex flex-col flex-shrink-0 w-80"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <Award className="w-3 h-3" />
                    {vendor.badge || ""}
                  </span>
                </div>

                <div className="relative overflow-hidden">
                  <Image
                    src={vendor.image || "/placeholder.svg"}
                    alt={vendor.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="font-bold text-sm lg:text-md text-slate-900 group-hover:text-blue-600 transition-colors">
                      {vendor.name}
                    </h3>
                  </div>

                  <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-1">
                    {vendor.tagline}
                  </p>

                  <button
                    onClick={() => openModal(vendor.id)}
                    className="text-sm lg:text-md w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-full transition duration-200 flex items-center justify-center gap-2 group-hover:gap-3 shadow-sm hover:shadow-md mt-auto"
                  >
                    Explore Store
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
          href="/vendors"
          className="inline-flex items-center gap-2 hover:gap-3 py-2 px-6 border border-gray-900 text-gray-900 text-center rounded-full transition-all hover:bg-white/80 transition-colors duration-200 backdrop-blur-md bg-white/60"
        >
          View All Vendors
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Modal with full vendor object (includes stores) */}
      <StoreModal vendor={vendorDetail} isOpen={open} onClose={closeModal} />
    </section>
  )
}
