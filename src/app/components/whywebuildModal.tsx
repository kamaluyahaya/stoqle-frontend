// components/WhyWeBuildModal.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { X, Store, User, Phone, Package, Globe, ChartBar, ShieldCheck } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
}

/**
 * Replace these image paths with your real images.
 * Example names: /images/receipt.jpg, /images/dashboard.png, ...
 */
const IMAGES = [
  { src: "/images/receipt2.jpg", alt: "Receipt sample" },
  { src: "/images/dashboard.png", alt: "Dashboard page" },
  { src: "/images/bookkeeping.png", alt: "Bookkeeping page" },
  { src: "/images/inventory.png", alt: "Inventory page" },
  { src: "/images/insights.png", alt: "Insights page" },
]

export default function WhyWeBuildModal({ isOpen, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex != null) setLightboxIndex(null)
        else onClose()
      }
    }
    if (isOpen) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose, lightboxIndex])

  // lock scroll + focus modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalRef.current?.focus(), 80)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* page overlay */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* modal container aligned to top */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-[100vh] flex items-start justify-center pt-8 pb-12 px-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ y: -40, opacity: 0, scale: 0.995 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.995 }}
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
                className="w-full max-w-6xl bg-white text-slate-900 rounded-4xl shadow-xl ring-1 ring-slate-100"
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                tabIndex={-1}
              >
                {/* close */}
                <div className="relative">
                  <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white">
                               <X size={16} />
                             </button>
                 

                  <div className="p-6 md:p-10">
                    {/* header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1 pr-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extralight leading-tight text-slate-900">
                          Why we build <span className="font-semibold">Stoqle</span>
                        </h1>
                        <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl">
                          A showcase of the product: receipts, dashboards, bookkeeping, inventory and insights. Scroll to explore.
                        </p>
                      </div>
                    </div>

                    {/* main grid: left (showcase stack) + right CTA */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* left: stacked showcase (large images, vertical scroll) */}
                      <div className="lg:col-span-2 space-y-8">
                        {IMAGES.map((img, idx) => (
                          <motion.figure
                            key={img.src}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="rounded-xl overflow-hidden border border-slate-100"
                          >
                            {/* big visual — aspect to mimic Apple showcase (wide) */}
                            <div
                              className="relative w-full"
                              style={{ height: "min(62vh, 520px)" }}
                              onClick={() => setLightboxIndex(idx)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setLightboxIndex(idx)
                              }}
                            >
                              <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover"
                                priority={idx === 0} // prioritize first
                              />
                              {/* subtle caption overlay */}
                              <div className="absolute left-4 bottom-4 bg-white/80 text-slate-900 rounded-md px-3 py-1 text-sm shadow">
                                {img.alt}
                              </div>
                            </div>

                            {/* caption / explanation below image */}
                            <figcaption className="p-4 bg-white">
                              <h3 className="text-lg font-semibold text-slate-800">{img.alt}</h3>
                              <p className="text-slate-700 mt-2 text-sm">
                                {idx === 0 && "Sample printed receipt showing line items, totals and payment method."}
                                {idx === 1 && "Dashboard page with sales overview, quick filters and performance charts."}
                                {idx === 2 && "Bookkeeping view to reconcile sales and expenses, exportable reports."}
                                {idx === 3 && "Inventory management with variants, stock levels and per-store quantities."}
                                {idx === 4 && "Insights page highlighting top sellers, daily sales and customer reach."}
                              </p>
                            </figcaption>
                          </motion.figure>
                        ))}

                        {/* long-form content still available under images */}
                        <section>
                          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-800">Quick Summary</h2>
                          <p className="text-slate-700 leading-relaxed">
                            Stoqle empowers local merchants with a simple, modern, and reliable point-of-sale + inventory + insights platform that scales from a single market stall to multiple branches. We prioritise simplicity, offline resilience, quick onboarding, and measurable business outcomes.
                          </p>
                        </section>

                        {/* (rest of your content continues...) */}
                        <section>
                          <h2 className="text-xl md:text-2xl font-semibold mb-2 text-slate-800">How to get started — (4 simple steps)</h2>
                          <ol className="list-decimal list-inside ml-4 space-y-4 text-slate-700">
                            <li><strong>Create an account & claim your store.</strong></li>
                            <li><strong>Set up products & SKUs.</strong></li>
                            <li><strong>Start selling — POS & receipts.</strong></li>
                            <li><strong>Use insights to improve.</strong></li>
                          </ol>
                        </section>
                      </div>

                      {/* right side CTA */}
                      <aside className="space-y-6">
                        <div className="p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-2">
                            <Store size={18} className="text-sky-500" />
                            <h3 className="font-semibold text-slate-800">For local businesses</h3>
                          </div>
                          <p className="text-slate-700 text-sm">Simple setup, fast checkout, and small monthly fee.</p>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-2">
                            <User size={18} className="text-yellow-500" />
                            <h3 className="font-semibold text-slate-800">Support & Onboarding</h3>
                          </div>
                          <p className="text-slate-700 text-sm">Guides, WhatsApp help, and walkthroughs to get you selling the same day.</p>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-2">
                            <Phone size={18} className="text-green-500" />
                            <h3 className="font-semibold text-slate-800">Get help</h3>
                          </div>
                          <p className="text-slate-700 text-sm">Contact: +234 000 000 000</p>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => (window.location.href = "/signup")}
                            className="w-full py-3 rounded-lg bg-sky-600 text-white font-semibold"
                          >
                            Start a free store
                          </button>
                          <button
                            onClick={() => (window.location.href = "/marketplace")}
                            className="w-full py-3 rounded-lg border border-slate-200 text-slate-800 bg-white"
                          >
                            Product
                          </button>
                        </div>

                        <div className="p-3 rounded-xl border border-slate-100 text-sm text-slate-600">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={16} />
                            <span className="font-medium">Security</span>
                          </div>
                          <div className="text-xs">Data encrypted in transit — we follow best practices for merchant data.</div>
                        </div>
                      </aside>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Lightbox inside modal (covers modal content) */}
          <AnimatePresence>
            {lightboxIndex != null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
                onClick={() => setLightboxIndex(null)}
              >
                <motion.div
                  initial={{ scale: 0.98, y: 12 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.98, y: 12 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="relative w-full max-w-5xl h-[80vh] rounded-xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image src={IMAGES[lightboxIndex].src} alt={IMAGES[lightboxIndex].alt} fill className="object-contain bg-black" />
                  <button
                    onClick={() => setLightboxIndex(null)}
                    className="absolute top-4 right-4 z-30 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black/40 hover:bg-black/60 text-white"
                    aria-label="Close image"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
