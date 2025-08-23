"use client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"

const TEXTS = ["Top Vendor", "Unicorn Start Up", "Global Market", "Trusted Brand", "Store they Line Up for"]

export default function HeroSection() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => i + 1), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative h-[500px] flex items-center text-white"
      style={{
        backgroundImage: "url('/images/8981.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="ml-6 lg:mx-0 text-left">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-8 max-w-2xl flex gap-2">
            Be the next{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="inline-block text-blue-400"
              >
                {TEXTS[index % TEXTS.length]}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="mb-6 text-sm lg:text-lg max-w-2xl">
            Reach new customers and grow your business in our thriving marketplace.
          </p>
          <Link
            href="/marketplace"
            className="text-sm lg:text-md bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full font-semibold"
          >
            Start Building
          </Link>
        </div>
      </div>
    </section>
  )
}
