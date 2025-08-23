"use client"

import Image from "next/image"
import Navbar from "../components/Navbar"
import { privacyPolicyContent } from "../data/officialContent"
import Footer from "../components/Footer"

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Top Banner Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src="/images/privacy-policy.png" // make sure this image exists inside public/images
            alt="Privacy Policy Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-white text-sm md:text-md max-w-2xl">
              Your privacy matters at Stoqle. Learn how we protect and manage your information.
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          {privacyPolicyContent.map((section, index) => (
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

    <Footer />

    </>
  )
}
