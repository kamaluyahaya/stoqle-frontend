"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { X, Phone, Store, Building2 } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"

/**
 * Replace these local types with your shared `ApiVendor`/store types if you have them.
 * I kept them minimal so the component is self-contained.
 */
interface ApiStore {
  store_id: number
  store_name: string
  store_logo?: string | null
  store_slug?: string | null
  total_products?: number
}

interface ApiVendor {
  business_id: number
  business_name: string
  business_logo?: string | null
  business_slug?: string | null
  profile_image?: string | null
  business_category?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  business_address?: string | null
  status?: string | null
  stores?: ApiStore[]
}

interface StoreModalProps {
  vendor: ApiVendor | null
  isOpen: boolean
  onClose: () => void
}

export default function StoreModal({ vendor, isOpen, onClose }: StoreModalProps) {
  // track which logos failed to load (header and stores)
  const [failedLogoIds, setFailedLogoIds] = useState<Set<string>>(new Set())

  // keyboard escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen || !vendor) return null

  // utilities
  const markLogoFailed = (id: string) =>
    setFailedLogoIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })

  const trimOrNull = (s?: string | null) => {
    if (!s) return null
    const t = s.trim()
    return t === "" ? null : t
  }

  const getInitial = (name?: string | null) => {
    const n = trimOrNull(name)
    if (!n) return "?"
    return n.charAt(0).toUpperCase()
  }

  // phone cleaning: remove non-digits
  const cleanPhone = (raw?: string | null) => {
    const s = trimOrNull(raw)
    if (!s) return null
    const digits = s.replace(/\D/g, "")
    return digits || null
  }

  // prefer vendor.phone (if present), fallback to vendor.email only as display (not phone)
  const phoneDigits = cleanPhone(vendor.phone ?? null)
  const hasPhone = Boolean(phoneDigits)

const handleWhatsAppContact = () => {
  if (!phoneDigits) return; // guarantees not null here

  let number = phoneDigits.trim()


  if (number.startsWith("+234")) {
    number = number.replace("+234", "234");
  } else if (number.startsWith("0")) {
    number = "234" + number.slice(1);
  } else if (!number.startsWith("234")) {
    // fallback, in case the number is totally off
    console.warn("Invalid number format:", number);
    return;
  }

  const message = `Hi! I’m interested in ${vendor.business_name}. Could you share more details?`;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};


  // Header logo: choose business_logo -> profile_image -> fallback initials
  const headerLogoKey = `header:${vendor.business_id}`
  const headerLogoSrc = trimOrNull(vendor.business_logo) ?? trimOrNull(vendor.profile_image) ?? null
  const showHeaderImage = headerLogoSrc && !failedLogoIds.has(headerLogoKey)

  return (
    <AnimatePresence>
          {isOpen && (
          <motion.div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-lg overflow-y-auto" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-4xl w-full max-w-7xl shadow-lg relative mx-auto my-8 p-5"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
        >
          <X size={16} />
        </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3">
              <div
                  className="relative w-65 h-53  overflow-hidden flex items-center justify-center"
                  aria-hidden={false}
                >
                  {showHeaderImage ? (
                    <Image
                      src={headerLogoSrc!}
                      alt={vendor.business_name}
                      fill
                      className="object-cover"
                      onError={() => markLogoFailed(headerLogoKey)}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-full h-full text-2xl font-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(240,242,247,1) 0%, rgba(230,233,240,1) 100%)",
                        color: "#0f172a",
                      }}
                      aria-label={`Business avatar for ${vendor.business_name}`}
                    >
                      {getInitial(vendor.business_name)}
                    </div>
                  )}
                </div>

              <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold text-slate-900 mb-4 tracking-tight">{vendor.business_name}</h2>
              <p className="text-sm text-slate-500">{vendor.business_category ?? "Vendor"}</p>
            </div>

            {/* Content */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Info */}
              <section className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Store size={18} />
                  Business Information
                </h3>

                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <p>
                    <span className="font-medium">Owner:</span> {vendor.full_name ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {vendor.email ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Business address:</span> {vendor.business_address ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Business Phone:</span> {vendor.phone ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        vendor.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {vendor.status ?? "Unknown"}
                    </span>
                  </p>
                </div>
              </section>

              {/* Stores */}
              {/* Stores */}
<section className="rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
    <Building2 size={18} />
    Stores
  </h3>

  <div className="mt-3 space-y-3">
    {vendor.stores && vendor.stores.length > 0 ? (
      vendor.stores.map((s) => {
        const key = `store:${s.store_id}`
        const logo = trimOrNull(s.store_logo) ?? null
        const showImage = Boolean(logo) && !failedLogoIds.has(key)

        return (
          <div
            key={s.store_id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:border-slate-200 transition"
          >
            {/* Logo */}
            <div className="relative w-12 h-12 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
              {showImage ? (
                <Image
                  src={logo!}
                  alt={s.store_name}
                  fill
                  className="object-cover"
                  onError={() => markLogoFailed(key)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-sm font-semibold"
                  aria-label={`Store avatar for ${s.store_name}`}
                  style={{
                    background: "linear-gradient(135deg,#fbfbfd,#f3f6fa)",
                    color: "#0f172a",
                  }}
                >
                  {getInitial(s.store_name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{s.store_name}</h4>
              <p className="text-xs text-slate-500">{s.total_products ?? 0} products</p>
            </div>

            {/* Explore Button */}
            <Link
              href={`/vendors/${vendor.business_slug}/${s.store_slug}`}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-slate-700 hover:bg-slate-50 transition"
            >
              Explore
            </Link>
          </div>
        )
      })
    ) : (
      <p className="text-sm text-slate-500">No stores available</p>
    )}
  </div>
</section>

            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                onClick={handleWhatsAppContact}
                disabled={!hasPhone}
                className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 font-medium shadow-sm transition ${
                  hasPhone
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                aria-disabled={!hasPhone}
              >
                <FaWhatsapp size={18} />
                {hasPhone ? "Contact on WhatsApp" : "WhatsApp unavailable"}
              </button>

              {hasPhone ? (
                <a
                  href={`tel:${phoneDigits}`}
                  className="w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 font-medium shadow-sm bg-black from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                >
                  <Phone size={18} />
                  Call Vendor
                </a>
              ) : (
                <div className="w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 font-medium shadow-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                  <Phone size={18} />
                  Call unavailable
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
