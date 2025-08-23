"use client"

import Navbar from "@/app/components/Navbar"
import { vendorGuidelinesContent } from "@/app/data/officialContent"
import Image from "next/image"


export default function VendorGuidelinesPage() {
  return (
    <>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Top Banner Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src="/images/bought.jpg" // place an image in public/images
            alt="Vendor Guidelines Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Vendor Guidelines
            </h1>
            <p className="text-white text-sm md:text-md max-w-2xl">
              Learn the rules and expectations for vendors on Stoqle to ensure a safe and professional marketplace.
            </p>
          </div>
        </div>

        {/* Vendor Guidelines Content */}
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          {vendorGuidelinesContent.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>
              <p className="text-md text-gray-700 whitespace-pre-line leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>


    </>
  )
}
