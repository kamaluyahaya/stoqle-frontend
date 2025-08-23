"use client"

import Link from "next/link"
import { MapPin, Shield } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"

type Vendor = {
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
}

type VendorCardProps = {
  vendor: Vendor
}

// Helper to generate initials from business name
function getInitials(name: string) {
  const words = name.trim().split(" ")
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const logo = vendor.business_logo || vendor.profile_image
  const initials = getInitials(vendor.business_name)

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Header with Logo and Business Info */}
      <div className="flex items-start gap-4 mb-3">
        <div className="relative">
          {logo ? (
            <img
              src={logo}
              alt={vendor.business_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-200 text-gray-700 font-bold text-lg border-2 border-gray-100">
              {initials}
            </div>
          )}
          {vendor.status === "Active" && (
            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
              <Shield className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm lg:text-md text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {vendor.business_name}
          </h3>
          <p className="text-[12px] text-gray-600 mb-1">By {vendor.full_name}</p>
          {vendor.business_category && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{vendor.business_category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories (API only gives one) */}
      {vendor.business_category && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-[11px] lg:text-xs px-3 py-1.5 rounded-full border border-blue-100">
            {vendor.business_category}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-3">
        <Link
          href={`/vendors/${vendor.business_slug}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[11px] lg:text-xs px-4 py-2.5 rounded-full transition-colors"
        >
          View Store
        </Link>

        {/* WhatsApp - fallback to email if no phone in API */}
        <a
          href={`https://wa.me/2340000000000`} // placeholder: replace with real phone field when API supports it
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-[11px] lg:text-xs px-3 py-3 rounded-full transition-colors"
        >
          <FaWhatsapp className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
