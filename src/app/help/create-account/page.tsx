"use client"

import Navbar from "@/app/components/Navbar"
import { accountData } from "@/app/data/officialContent"
import Image from "next/image"


export default function HowToCreateAccount() {
  return (
    <>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Top Banner Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src={accountData.hero.image} // image path from data file
            alt="Create Account Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {accountData.hero.title}
            </h1>
            <p className="text-white text-sm md:text-md max-w-2xl">
              {accountData.hero.subtitle}
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Follow these simple steps to create your account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {accountData.steps.map((step, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition"
              >
                <span className="text-sm font-semibold text-blue-500 uppercase">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-700 mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


    </>
  )
}
