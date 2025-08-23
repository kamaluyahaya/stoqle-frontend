"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { termsContent } from "../data/officialContent"
import Navbar from "../components/Navbar"

export default function TermsOfServicePage() {
  return (
    <>

    <Navbar />

    <div className="w-full min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div className="relative w-full h-[300px]">
        <Image
          src={termsContent.hero.image}
          alt="Terms of Service"
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{termsContent.hero.title}</h1>
          <p className="text-sm md:text-md max-w-2xl">{termsContent.hero.subtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {termsContent.sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <p className="text-md text-gray-700 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  )
}
