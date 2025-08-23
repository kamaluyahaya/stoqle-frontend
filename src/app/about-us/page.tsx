"use client"

import Image from "next/image"
import Navbar from "../components/Navbar"
import { aboutData } from "../data/officialContent"

export default function AboutUs() {
  return (
    <>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src={aboutData.hero.image} // hero image from data file
            alt="About Stoqle Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {aboutData.hero.title}
            </h1>
            <p className="text-white text-sm md:text-md max-w-2xl">
              {aboutData.hero.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto py-16 px-6 md:px-20">
          {/* Intro Section */}
          <section className="bg-white shadow-lg rounded-2xl p-8 mb-12 hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed text-sm ">
              {aboutData.intro}
            </p>
          </section>

          {/* Mission */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-sm leading-relaxed">
              {aboutData.mission}
            </p>
          </section>

          {/* Why Choose Us */}
          <section className="bg-white shadow-lg rounded-2xl p-8 mb-12 hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Choose Stoqle?</h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-600">
              {aboutData.whyChoose.map((point, index) => (
                <li key={index} className="text-sm ">{point}</li>
              ))}
            </ul>
          </section>

          {/* About KSOFT Technova */}
          <section className="bg-gray-900 text-white shadow-lg rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-4">About KSOFT Technova</h2>
            <p className="leading-relaxed text-gray-300 text-sm ">
              {aboutData.ksoft}
            </p>
          </section>

          {/* Closing */}
          <div className="text-center mt-10">
            <p className="text-lg text-gray-700">{aboutData.closing}</p>
          </div>
        </div>
      </div>


    </>
  )
}
