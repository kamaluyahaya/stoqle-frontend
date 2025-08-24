"use client"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"

const TEXTS = [
  "Top Vendor",
  "Unicorn Start Up",
  "Global Market",
  "Trusted Brand",
  "Store they Line Up for",
]

export default function HeroSection() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => i + 1), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative h-[60vh] md:min-h-screen flex items-center text-white overflow-hidden bg-black"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        backgroundImage: "url('/images/bg.png')", // fallback if video fails
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="Hero"
    >
      {/* Background video (mobile + desktop) */}
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
        <source src="/images/bg.mp4" type="video/mp4" />
        <source src="/images/bg.webm" type="video/webm" />
      </video>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 backdrop-blur-[3px]" />

      {/* Content card */}
      <div className="relative z-10 mx-auto px-6 w-full max-w-7xl">
        <div className="text-left">
          <div className="  p-6 md:p-10 ">
            <h1 className="lg:text-7xl md:text-5xl text-3xl font-light mb-3 md:mb-6 leading-tight tracking-tight text-white">
              Be the next{" "}
              <AnimatePresence mode="wait">
                {reduceMotion ? (
                  <span className="inline-block text-sky-300">
                    {TEXTS[index % TEXTS.length]}
                  </span>
                ) : (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="inline-block text-sky-300"
                  >
                    {TEXTS[index % TEXTS.length]}
                  </motion.span>
                )}
              </AnimatePresence>
            </h1>

            <p className="mb-6 text-sm md:text-lg text-white/85 max-w-lg">
              Reach new customers and grow your business in our thriving marketplace.
            </p>

            <div className="flex gap-3 items-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm md:text-base font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Start Building
              </Link>

              <Link
                href="/learn-more"
                className="inline-flex items-center text-sm md:text-base text-white/80 hover:text-white transition"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
