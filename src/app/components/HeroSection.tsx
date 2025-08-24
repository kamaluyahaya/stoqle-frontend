"use client"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import WhyWeBuildModal from "./whywebuildModal"

const TEXTS = [
  "Top Vendor",
  "Unicorn Start Up",
  "Global Market",
  "Trusted Brand",
  "Global Empire",
  "Store they Line Up for",
]

export default function HeroSection() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const [showModal, setShowModal] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => i + 1), 3000)
    return () => clearInterval(interval)
  }, [])

  // Close modal on Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false)
    }
    if (showModal) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [showModal])

  // Focus modal for accessibility when opened
  useEffect(() => {
    if (showModal && modalRef.current) {
      // small timeout to wait for animation
      setTimeout(() => modalRef.current?.focus(), 80)
    }
  }, [showModal])

  return (
    <>
    <WhyWeBuildModal isOpen={showModal} onClose={() => setShowModal(false)} />
    <section
      className="relative h-[60vh] md:min-h-screen flex items-center text-white overflow-hidden bg-black"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="Hero"
    >
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover transform scale-110 will-change-transform"
        poster="/images/bg.png"
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src="/images/1474226_People_Technology_3840x2160.mp4" type="video/mp4" />
        <source src="/images/bg.webm" type="video/webm" />
      </video>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 backdrop-blur-[3px]" />

      {/* Content card */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="text-left">
          <div className="p-6 md:p-10 lg:p-5">
            <h1 className="text-[40px] md:text-[80px] lg:text-[100px] font-light mb-3 md:mb-6 leading-tight tracking-tight text-white">
              Be the next
              <br />
              <AnimatePresence mode="wait">
                {!reduceMotion && (
                  <motion.div
                    key={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.12 } },
                      exit: { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
                    }}
                    className="flex flex-wrap gap-2 text-sky-300"
                  >
                    {TEXTS[index % TEXTS.length].split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        variants={{
                          hidden: { opacity: 0, y: 20, scale: 0.92 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { type: "spring", stiffness: 400, damping: 30 },
                          },
                          exit: {
                            opacity: 0,
                            y: -18,
                            scale: 0.92,
                            transition: { duration: 0.28 },
                          },
                        }}
                        className="inline-block"
                        aria-hidden={false}
                      >
                        {word}{" "}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {reduceMotion && (
                  <span className="block text-sky-300">{TEXTS[index % TEXTS.length]}</span>
                )}
              </AnimatePresence>
            </h1>

            <p className="mb-6 text-lg md:text-lg text-white/85 max-w-lg">
              Reach new customers and grow your business in our thriving marketplace.
            </p>

            {/* Buttons row: left actions + right "Why we build Stoqle" */}
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base bg-blue-500 font-medium hover:bg-white/20 border border-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Start for free
                </Link>
              </div>

              {/* Right aligned button that opens modal */}
              
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center text-sm md:text-base text-white/80 hover:text-white transition"
              >
                Why we build Stoqle
              </button>
            </div>
          </div>
        </div>
      </div>



    </section>
    </>
  )
}
