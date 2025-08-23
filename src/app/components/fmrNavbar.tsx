"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X, ChevronDown, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const navRef = useRef<HTMLElement>(null)

  const helpCategories = [
    {
      title: "Getting Started",
      links: ["How to create an account", "Platform tour", "FAQ"],
    },
    {
      title: "Buying",
      links: ["How to buy products", "Payment methods", "Order tracking"],
    },
    {
      title: "Selling",
      links: ["Set up a store", "Vendor guidelines", "Payouts"],
    },
    {
      title: "Policies",
      links: ["Privacy Policy", "Terms of Service", "Refund policy"],
    },
  ]

  const suggestions = ["Laptops", "Headphones", "Smartphones", "Gaming monitors", "Wireless chargers"]
  const quickSearchLinks = [
    "Popular Products",
    "New Arrivals",
    "Best Sellers",
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports & Outdoors",
    "Books & Media",
  ]

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setHelpOpen(false)
        setSearchOpen(false)
      }
    }

    if (helpOpen || searchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [helpOpen, searchOpen])

  return (
    <>
      {(helpOpen || searchOpen) && !mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 hidden md:block" />
      )}

      {searchOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" />}

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || helpOpen || searchOpen
            ? "bg-white/80 backdrop-blur-md shadow text-gray-900"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-transparent.png"
              alt="Company Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
            <span className="text-lg font-bold hidden"></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm lg:text-md">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/marketplace" className="hover:text-blue-400 transition-colors">
              Marketplace
            </Link>
            <Link href="/vendors" className="hover:text-blue-400 transition-colors">
              Vendors
            </Link>
            <button
              onClick={() => {
                setHelpOpen(!helpOpen)
                setSearchOpen(false)
              }}
              className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
            >
              <span>Help Center</span>
              <ChevronDown size={16} className={`transition-transform ${helpOpen ? "rotate-180" : ""}`} />
            </button>
            {/* Search Icon */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                setHelpOpen(false)
              }}
              className="hover:text-blue-400 transition-colors"
            >
              <Search size={18} />
            </button>
            <Link href="/login" className="hover:text-blue-400 transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                setHelpOpen(false)
                setMobileMenuOpen(false) // Close mobile menu when search is opened
              }}
              className="hover:text-blue-400 transition-colors"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => {
                const newMobileMenuState = !mobileMenuOpen
                setMobileMenuOpen(newMobileMenuState)
                if (!newMobileMenuState) {
                  setHelpOpen(false)
                  setSearchOpen(false)
                } else {
                  setSearchOpen(false) // Close search when mobile menu opens
                }
              }}
              className="border border-0 hover:border-gray-200 lg:shadow-md rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-md border-t border-gray-200/50 overflow-hidden transition-all duration-500 ease-out transform ${
            (helpOpen || searchOpen) && !mobileMenuOpen
              ? "max-h-96 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4"
          }`}
        >
          {/* Help Center Content - Desktop only */}
          <div
            className={`hidden md:block transition-all duration-300 delay-150 ${
              helpOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            {helpOpen && (
              <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-5 gap-6">
                {helpCategories.map((cat, index) => (
                  <div
                    key={cat.title}
                    className={`transition-all duration-300 ${
                      helpOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${200 + index * 50}ms` }}
                  >
                    <h4 className="font-semibold mb-2 text-gray-900">{cat.title}</h4>
                    <ul className="space-y-1 text-sm">
                      {cat.links.map((link) => (
                        <li key={link}>
                          <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Content - Both desktop and mobile */}
          <div
            className={`transition-all duration-300 delay-150 ${
              searchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            {searchOpen && (
              <div className="max-w-7xl mx-auto px-4 py-4 max-h-80 overflow-y-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search products, vendors, categories..."
                    className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {!searchTerm && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3 text-gray-900">Quick Search</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchLinks.map((link, index) => (
                        <a
                          key={link}
                          href="#"
                          className={`p-2 text-sm bg-white/60 hover:bg-white/80 rounded-lg text-center transition-all duration-200 backdrop-blur-md text-gray-700 ${
                            searchOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                          }`}
                          style={{ transitionDelay: `${300 + index * 30}ms` }}
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search suggestions */}
                {searchTerm && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Suggestions</h4>
                    <ul className="space-y-2">
                      {suggestions
                        .filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((s, index) => (
                          <li
                            key={s}
                            className={`p-2 hover:bg-white/80 rounded cursor-pointer transition-all duration-200 text-gray-700 backdrop-blur-md bg-white/60 ${
                              searchOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            }`}
                            style={{ transitionDelay: `${200 + index * 50}ms` }}
                          >
                            {s}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-md border-t border-gray-200/50 md:hidden overflow-hidden transition-all duration-500 ease-out ${
            mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`text-sm lg:text-md p-4 pb-20 h-screen overflow-y-auto transition-all duration-300 delay-100 ${
              mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            {/* Mobile Navigation Links */}
            <Link href="/" className="block py-2 transition-colors hover:text-blue-600 text-gray-900">
              Home
            </Link>
            <Link href="/marketplace" className="block py-2 transition-colors hover:text-blue-600 text-gray-900">
              Marketplace
            </Link>
            <Link href="/vendors" className="block py-2 transition-colors hover:text-blue-600 text-gray-900">
              Vendors
            </Link>
            <button
              onClick={() => setHelpOpen(!helpOpen)}
              className="flex items-center justify-between w-full py-2 text-gray-900"
            >
              <span>Help Center</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${helpOpen ? "rotate-180" : ""}`} />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                helpOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-4 space-y-2 mb-6 pt-2">
                {helpCategories.map((cat, index) => (
                  <div
                    key={cat.title}
                    className={`transition-all duration-200 ${
                      helpOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: `${100 + index * 50}ms` }}
                  >
                    <h4 className="font-semibold mt-2 text-gray-900">{cat.title}</h4>
                    <ul className="space-y-1 text-sm">
                      {cat.links.map((link) => (
                        <li key={link}>
                          <a href="#" className="text-xs lg:text-md hover:text-blue-600 transition-colors text-gray-700 mb-12">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Login/Signup Buttons */}
            <div className="text-sm lg:text-md mt-6 space-y-2">
              <Link
                href="/login"
                className="block py-2 px-4 border border-blue-600 text-blue-600 text-center rounded-full hover:bg-white/80 transition-colors duration-200 backdrop-blur-md bg-white/60"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block py-2 px-4 bg-blue-600 text-white text-center rounded-full hover:bg-blue-700 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
