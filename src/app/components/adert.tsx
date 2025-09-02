"use client"

import React from "react"
import Image from "next/image"

type Props = {
  imageSrc?: string
}

export default function AdvertSection({ imageSrc = "/images/advert.png" }: Props) {
  return (
    <section aria-label="Advert section" className=" p-6 md:p-10">
      <div className="text-black p-6 md:p-10 ">
      <div className="max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
        <h3 className="text-sm uppercase tracking-wider text-indigo-600 font-semibold">Online and in person</h3>
        <h2 className="text-3xl md:text-6xl font-semibold leading-tight">Sell here, there, and everywhere</h2>
        </div>
        <div className="flex-1 md:flex-none md:ml-6">
        <p className="mt-4 md:mt-0 text-base md:text-lg text-gray-700 max-w-xl">
        Get a stunning store that’s made to sell. Design fast with AI, choose a stylish theme, or build completely custom for full control.
        </p>
        </div>
        </div>

        <div className="mt-8 w-full rounded-xl overflow-hidden ">
          <Image
            src={imageSrc}
            alt="Advert 1"
            width={1600}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
      </div>
    </section>
  )
}
