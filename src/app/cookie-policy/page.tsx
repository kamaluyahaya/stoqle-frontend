"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Navbar from "../components/Navbar"

import { cookiePolicyData } from "../data/officialContent"

export default function CookiePolicy() {
  const [active, setActive] = useState<number | null>(null)
  const toggle = (i: number) => setActive(active === i ? null : i)

  return (
    <>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src={cookiePolicyData.hero.image}
            alt="Cookie Policy Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {cookiePolicyData.hero.title}
            </h1>
            <p className="text-white text-sm md:text-md max-w-2xl">
              {cookiePolicyData.hero.subtitle}
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Learn more about how we use cookies
          </h2>

          <div className="space-y-4">
            {cookiePolicyData.sections.map((section, i) => (
              <div
                key={i}
                className="border rounded-2xl shadow-sm bg-white overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center p-4 text-left"
                >
                  <span className="font-semibold text-gray-800">
                    {section.title}
                  </span>
                  <motion.span
                    animate={{ rotate: active === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-500"
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="p-4 text-gray-600 whitespace-pre-line">
                        {section.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>


    </>
  )
}
