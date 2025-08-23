"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { X, Phone, Store, User, Package } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"
import { ApiProduct } from "../lib/types"
import { AnimatePresence, motion } from "framer-motion"
import OrderForm from "./OrderForm"


interface RawImage {
  file_url?: string
  [key: string]: any
}


interface Vendor {
  vendor_id?: number | null
  businessName?: string | null
  vendorName?: string | null
  phone?: string | null
  description?: string | null
  isVerified?: boolean
  rating?: number | null
}

interface ProductModalProps {
  product: ApiProduct | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [vendor, setVendor] = useState<Vendor | null>(null)

  // helper to normalize image url
  const extractImageUrl = (img?: RawImage | string | null) => {
    if (!img) return null
    if (typeof img === "string") {
      if (img.startsWith("http")) return img
      if (img.startsWith("/")) return `https://api.stoqle.com${img}`
      return img
    }
    const url = (img as RawImage).file_url || (img as any).fileUrl || null
    if (!url) return null
    if (url.startsWith("http")) return url
    if (url.startsWith("/")) return `https://api.stoqle.com${url}`
    return url
  }


    useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }

  if (isOpen) {
    document.addEventListener("keydown", handleEscape)
    // ❌ REMOVE this line so browser scrollbar remains
    // document.body.style.overflow = "hidden"
  }

  return () => {
    document.removeEventListener("keydown", handleEscape)
    document.body.style.overflow = "unset"
  }
}, [isOpen, onClose])


  useEffect(() => {
    // when product changes, reset UI states
    setSelectedImageIndex(0)
    setShowOrderForm(false)

    // if vendor info exists on product, normalise into vendor state for easier consumption
    if (product) {
      setVendor({
        businessName: product.business_name ?? null,
        vendorName: product.vendor_name ?? null,
        phone: product.business_phone ?? null,
        description: null,
        isVerified: false,
        rating: null
      })
    } else {
      setVendor(null)
    }
  }, [product])

  // compute quantity: prefer inventory, then track_stock, then quantity field
  const getQuantity = (p: ApiProduct | null) => {
    if (!p) return 0
    const invQty = p.inventory && p.inventory.length ? Number(p.inventory[0]?.quantity ?? 0) : null
    if (invQty != null && !Number.isNaN(invQty)) return invQty
    if (p.track_stock != null) return Number(p.track_stock)
    if (typeof p.quantity === "number") return p.quantity
    return 0
  }

  const cleanPhone = (phone?: string | null) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, "")
    return cleaned || null
  }

const phoneForContact = cleanPhone(
  vendor?.phone ?? product?.vendor_phone ?? product?.business_phone ?? null
);
const hasPhone = Boolean(phoneForContact);

const handleWhatsAppContact = () => {
  if (!phoneForContact) return; // this ensures it's not null
  let number = phoneForContact.trim();
  
  if (number.startsWith("+234")) {
    number = number.replace("+234", "234");
  } else if (number.startsWith("0")) {
    number = "234" + number.slice(1);
  } else if (!number.startsWith("234")) {
    console.warn("Invalid number format:", number);
    return;
  }

  const message = `Hi! I'm interested in ${product?.product_name}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};


  if (!isOpen) return null

  const imageUrl = extractImageUrl(product?.images?.[selectedImageIndex]) || "/placeholder.svg"
  const qty = getQuantity(product)

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
  className="fixed inset-0 z-50 bg-black/40 backdrop-blur-lg overflow-y-auto"
  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
  animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
  <motion.div
  className="bg-white p-6 rounded-4xl w-full max-w-7xl shadow-2xl relative mx-auto my-8"
  initial={{ y: 60, opacity: 0, scale: 0.95 }}
  animate={{ y: 0, opacity: 1, scale: 1 }}
  exit={{ y: 60, opacity: 0, scale: 0.95 }}
  transition={{
    type: "spring",
    stiffness: 260,
    damping: 22
  }}
>
    <button
      onClick={onClose}
      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
    >
      <X size={16} />
    </button>

    
      {/* using mx-auto + my-8 so modal is centered but can be scrolled into view; modal itself uses an internal scroll for long content on smaller viewports */}
        {product ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-2 md:p-4 border-gray-300 mx-2">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-semibold text-slate-900 mb-4 tracking-tight">{product.product_name}</h1>
             
            </div>

           {/* ✅ Remove the maxHeight & overflow-auto */}
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Left column */}
      <div className="space-y-6">
                <div className="space-y-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 w-full">
                    <motion.div
  key={selectedImageIndex}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.25 }}
  className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 w-full"
>
  <Image
    src={imageUrl}
    alt={product?.product_name || "Product"}
    fill
    className="object-cover"
  />
</motion.div>
                  </div>

                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                      {product.images.map((img, i) => {
                        const thumb = extractImageUrl(img) || "/placeholder.svg"
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedImageIndex(i)}
                            className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-md overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === i ? "border-blue-500" : "border-gray-200"
                            }`}
                          >
                            <Image src={thumb} alt={`${product.product_name} ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                   <span className="text-xl md:text-2xl font-bold text-gray-900">
  ₦{Number(product.price).toLocaleString()}
</span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs lg:text-sm font-medium self-start ${
                        product.status=='active'? "bg-green-100 text-green-800" :  "bg-red-100 text-red-800"
                      }`}
                    >
                      <Package size={16} className="inline mr-1" />
                      {product.status=='active'? 'For Sale' : 'Sold out'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{product.description}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Vendor Info */}
             <div className="space-y-6">
  {/* Vendor Card */}
  <div className="bg-white shadow-sm rounded-2xl p-5 border border-gray-100">
    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 justify-center">
      <Store size={20} className="text-blue-500" />
      Vendor Information
    </h3>

    {vendor ? (
      <>
        <div className="mt-4 space-y-2">
          <p className="flex items-center gap-2 text-sm md:text-base text-gray-700">
            <Store size={16} className="text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">
              {vendor.businessName ?? product.business_name ?? "Unknown business"}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm md:text-base text-gray-700">
            <User size={16} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {vendor.vendorName ?? product.vendor_name ?? "Unknown vendor"}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm md:text-base text-gray-700">
            <Phone size={16} className="text-gray-400 flex-shrink-0" />
            <span>{vendor.phone ?? product.vendor_phone ?? product.business_phone ?? "N/A"}</span>
          </p>
        </div>

        {vendor.description && (
          <p className="text-xs text-gray-500 mt-3 leading-snug">{vendor.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-gray-600">⭐ {vendor.rating ?? "N/A"}/5.0</span>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              vendor.isVerified
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-gray-50 text-gray-500 border border-gray-200"
            }`}
          >
            {product.business_status ? "✓ Verified" : "Unverified"}
          </span>
        </div>
      </>
    ) : (
      <p className="text-sm text-gray-400 text-center mt-3">
        Vendor info not available
      </p>
    )}
  </div>

  {/* Action Buttons */}
  <div className="space-y-3">
    <button
      onClick={handleWhatsAppContact}
      disabled={!hasPhone}
      className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm ${
        hasPhone
          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      <FaWhatsapp size={20} />
      {hasPhone ? "Contact on WhatsApp" : "WhatsApp unavailable"}
    </button>

    {hasPhone ? (
      <a
        href={`tel:${phoneForContact}`}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <Phone size={20} />
        Call Vendor
      </a>
    ) : (
      <div className="w-full bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed shadow-sm">
        <Phone size={20} />
        Call Unavailable
      </div>
    )}

    <button
      onClick={() => setShowOrderForm(!showOrderForm)}
      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
    >
      <Package size={20} />
      {showOrderForm ? "Hide Order Form" : "Place Order Now"}
    </button>
  </div>

  {/* Order Form */}
  {showOrderForm && product && (
    <div className="mt-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <OrderForm product={product} />
      <div className="text-center text-sm text-gray-400 mt-3">
Call now to have this product  <span>{ product.business_phone ?? "N/A"}</span>
      </div>
    </div>
  )}
</div>

            </div>
          </>
        ) : (
          <div className="p-6 text-center text-red-600">Call now to have not available</div>
        )}
    </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

