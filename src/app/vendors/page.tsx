"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Phone, MapPin, Building, Users, X, ChevronDown, ChevronUp } from "lucide-react"
import NavbarElse from "../components/NavbarElse"
import Footer from "../components/Footer"
import Link from "next/link"
import StoreModal from "../components/storeModal"
import { ApiVendor } from "../lib/types"
import FeaturedVendors from "../components/FeaturedVendors"

// ---------- Types ----------
interface Store {
  store_id: number
  store_name: string
  store_slug: string
  store_logo: string | null
  description: string
  is_default: number
  total_products: number
}

interface Vendor {
  staff_id: number
  full_name: string
  email: string
  profile_image: string | null
  status: string
  business_id: number
  business_name: string
  business_slug: string
  business_category: string
  business_logo: string | null
  business_address: string
  phone: string
  stores: Store[]
}

// ---------- Config ----------
const API_VENDORS = "https://api.stoqle.com/api/vendors"

// ---------- Small UI helpers ----------
const Badge: React.FC<{ children: React.ReactNode; tone?: "neutral" | "success" | "danger" }> = ({ children, tone = "neutral" }) => {
  const bg = tone === "success" ? "bg-green-50 text-green-700" : tone === "danger" ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-700"
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${bg} border border-gray-100`}>{children}</span>
}

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
  <button {...rest} className="inline-flex items-center justify-center rounded-lg p-2 bg-white/60 backdrop-blur border border-gray-100 shadow-sm">
    {children}
  </button>
)

// ---------- Vendor Card ----------
const VendorCard: React.FC<{ v: Vendor; onOpenStores: (v: Vendor) => void }> = ({ v, onOpenStores }) => {
  const logo = v.business_logo || `https://picsum.photos/seed/vendor-${v.business_id}/600/400`
  return (
    <motion.article whileHover={{ translateY: -6 }} className="group bg-white rounded-2xl p-4 shadow-md hover:shadow-xl border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          <img src={logo} alt={v.business_name} className="object-cover w-full h-full" loading="lazy" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{v.business_name}</h3>
          <p className="text-xs text-slate-500 truncate mt-1">{v.business_category}</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="text-xs text-slate-600">Owned by <span className="font-medium">{v.full_name}</span></div>
            <Badge tone={v.status.toLowerCase() === "active" ? "success" : "danger"}>{v.status}</Badge>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2"><MapPin size={14} /> <span className="truncate">{v.business_address || "No address provided"}</span></div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* <button
            onClick={() => onOpenStores(v)}
            
          >
            View
          </button>   */}
                  
          <button onClick={() => onOpenStores(v)} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm">Stores ({v.stores?.length || 0})</button>
        </div>
      </div>
    </motion.article>
  )
}

// ---------- Stores panel ----------
const StoresPanel: React.FC<{ vendor: Vendor; onClose: () => void }> = ({ vendor, onClose }) => {
  return (
    <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="fixed right-6 top-20 w-96 max-w-full h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-auto p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{vendor.business_name}</h3>
          <p className="text-xs text-slate-500 mt-1">{vendor.business_category} • {vendor.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton onClick={onClose} aria-label="Close stores panel"><X size={16} /></IconButton>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium">Stores</h4>
        <div className="mt-3 space-y-3">
          {vendor.stores?.length ? vendor.stores.map((s) => (
            <div key={s.store_id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center text-xs">{s.store_logo ? <img src={s.store_logo} alt={s.store_name} className="object-cover w-full h-full" /> : <Building size={18} />}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{s.store_name}</div>
                <div className="text-xs text-slate-500">{s.total_products} products • {s.is_default ? "Default" : ""}</div>
              </div>

              <div>
                <div>
                  <Link
                    href={`/vendors/${vendor.business_slug}/${s.store_slug}`}
                    className="text-sm px-3 py-2 rounded-lg border border-gray-100"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          )) : <div className="text-xs text-slate-500">No stores found for this vendor.</div>}
        </div>
      </div>
    </motion.aside>
  )
}

// ---------- Main page ----------
const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [query, setQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  
  const [vendorDetail, setVendorDetail] = useState<ApiVendor | null>(null)
  useEffect(() => {
    let mounted = true
    async function fetchVendors() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(API_VENDORS)
        if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.status}`)
        const json = await res.json()
        const data: Vendor[] = json?.data || []
        if (!mounted) return
        setVendors(data)
        const cats = Array.from(new Set(data.map((d) => d.business_category || "Other")))
        setCategories(["All", ...cats])
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "Unknown error")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchVendors()

    return () => {
      mounted = false
    }
  }, [])

  const filtered = vendors.filter((v) => {
    return (
      (activeCategory === "All" || v.business_category === activeCategory) &&
      (query.trim() === "" || v.business_name.toLowerCase().includes(query.toLowerCase()) || v.full_name.toLowerCase().includes(query.toLowerCase()))
    )
  })

  return (
    <>
    <div className="min-h-screen bg-white max-w-7xl mx-auto my-20 px-4">
      <NavbarElse />

      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 px-4 sm:px-0">Vendors on <span className="text-blue-500">Stoqle</span></h1>
        <p className="text-sm text-slate-500 mt-2">Browse businesses and their stores. Search by name, category or owner.</p>
      </div>

      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4">
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-3 rounded-3xl bg-white/60 backdrop-blur px-3 py-2 border border-gray-100 shadow-sm w-full">
            <Search size={16} className="text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vendors, owners, categories" className="bg-transparent outline-none placeholder:text-slate-400 w-full text-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
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
              <h5 className="text-xs text-slate-500">Filter</h5>
              <div className="mt-3 flex gap-2">
                <button className="w-full rounded-lg p-3 border border-gray-100">Active</button>
                <button className="w-full rounded-lg p-3 border border-gray-100">Inactive</button>
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vendors</h3>
              <div className="text-sm text-slate-500">{loading ? "Loading..." : `${filtered.length} results`}</div>
            </div>

            {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-40" />
                  ))
                : filtered.map((v) => <VendorCard key={v.business_id} v={v} onOpenStores={(vendor) => setSelectedVendor(vendor)} />)}
            </div>

           
          </div>
        </section>
      </main>

      <AnimatePresence>{selectedVendor && <StoresPanel vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}</AnimatePresence>

     
    </div>


          <FeaturedVendors />

                <Footer />
    </>
  )
}

export default VendorsPage
