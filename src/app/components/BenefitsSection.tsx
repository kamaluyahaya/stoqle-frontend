"use client"

import { Store, TrendingUp, Package, Users, ShoppingBag, Shield } from "lucide-react"
import { useEffect, useState } from "react"

export default function BenefitsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const vendorBenefits = [
    {
      icon: <Store size={24} />,
      title: "Easy Store Setup",
      desc: "Launch your shop in minutes with our guided tools.",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Boost Sales",
      desc: "Reach thousands of active buyers daily.",
    },
    {
      icon: <Package size={24} />,
      title: "InventoryPro",
      desc: "Streamlined inventory management and optimization.",
    },
  ]

  const customerBenefits = [
    {
      icon: <ShoppingBag size={24} />,
      title: "Wide Selection",
      desc: "Shop from thousands of verified vendors.",
    },
    {
      icon: <Users size={24} />,
      title: "Trusted Sellers",
      desc: "Buy from top-rated and reviewed shops.",
    },
    {
      icon: <Shield size={24} />,
      title: "Your Style, Your Way",
      desc: "Personalized shopping experience.",
    },
  ]

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-100 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-10 animate-bounce delay-500"></div>
        <div className="absolute bottom-32 right-1/4 w-24 h-24 bg-gray-200 rounded-full opacity-15 animate-bounce delay-700"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-20"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-20"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div
          className={`mx-8 lg:mx-0 mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="mx-6xl">
            <h1 className="text-3xl md:text-6xl font-semibold leading-tight">
              Why Choosing <span className="text-blue-500"> Stoqle</span>
            </h1>
          </div>
          
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vendor Card */}
          <div
            className={`mx-8 lg:mx-0 group relative transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            {/* Multiple shadow layers for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl transform rotate-1 opacity-10 group-hover:rotate-2 group-hover:scale-105 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-2xl transform rotate-0.5 opacity-5 group-hover:rotate-1 transition-all duration-300 delay-100"></div>

            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-3xl rounded-tr-2xl opacity-10"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg group-hover:shadow-blue-200 transition-all duration-300 group-hover:scale-110">
                  <Store size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Vendors</h3>
                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-6">
                {vendorBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 group/item transition-all duration-300 delay-${idx * 100}`}
                  >
                    <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-500 group-hover/item:bg-blue-100 group-hover/item:scale-110 transition-all duration-300 shadow-sm">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover/item:text-blue-600 transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-sm lg:text-md text-gray-600 leading-relaxed">{benefit.desc}</p>
                    </div>
                    <div className="w-1 h-1 bg-blue-300 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div
            className={`mx-8 lg:mx-0 group relative transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            {/* Multiple shadow layers for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl transform -rotate-1 opacity-10 group-hover:-rotate-2 group-hover:scale-105 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gray-700 rounded-2xl transform -rotate-0.5 opacity-5 group-hover:-rotate-1 transition-all duration-300 delay-100"></div>

            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-br-3xl rounded-tl-2xl opacity-10"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-3 bg-gray-800 rounded-xl text-white shadow-lg group-hover:shadow-gray-300 transition-all duration-300 group-hover:scale-110">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Customers</h3>
                <div className="ml-auto w-2 h-2 bg-gray-800 rounded-full animate-pulse delay-500"></div>
              </div>

              <div className="space-y-6">
                {customerBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 group/item transition-all duration-300 delay-${idx * 100}`}
                  >
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg text-gray-700 group-hover/item:bg-gray-200 group-hover/item:scale-110 transition-all duration-300 shadow-sm">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover/item:text-gray-800 transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-sm lg:text-md text-gray-600 leading-relaxed">{benefit.desc}</p>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
