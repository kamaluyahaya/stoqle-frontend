"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin } from "lucide-react";
import type { ApiVendor } from "../lib/types";

const VendorModal: React.FC<{
  vendor: ApiVendor | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ vendor, isOpen, onClose }) => {
  const router = useRouter();

  if (!vendor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Blurred background */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative z-50 w-full max-w-2xl mx-4 rounded-3xl 
                       bg-white backdrop-blur-xl shadow-2xl border border-white/30 
                       p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${vendor.business_name} details`}
          >
            {/* Close Button */}
           <button
                 onClick={onClose}
                 className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
               >
                 <X size={16} />
               </button>

            {/* Header */}
            <div className="flex gap-5 items-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
                <img
                  src={
                    vendor.business_logo ||
                    `https://picsum.photos/seed/vendor-${vendor.business_id}/400/400`
                  }
                  alt={vendor.business_name}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {vendor.business_name}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {vendor.business_category}
                </div>

                <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} />{" "}
                    <a
                      className="underline hover:text-blue-600"
                      href={`tel:${vendor.phone}`}
                    >
                      {vendor.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> <span>{vendor.business_address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Contact */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-800">
                Contact / Vendor
              </h4>
              <div className="mt-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-gray-900">
                    {vendor.full_name}
                  </div>
                  <div className="text-xs text-gray-500">{vendor.email}</div>
                </div>
                
              </div>
            </div>

            {/* Stores */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-800">Stores</h4>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vendor.stores.map((s) => (
                  <motion.div
                    key={s.store_id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/70 backdrop-blur-md rounded-2xl p-4 
                               border border-gray-100 shadow-sm flex 
                               items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {s.store_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.total_products ?? 0} products
                      </div>
                    </div>
                   
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-white/70 border border-gray-200 
                           shadow-sm hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VendorModal;
