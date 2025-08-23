"use client"

import { useState, useMemo } from "react"
import { MASTER_CATEGORIES,products } from "../data/MarketPlaceData"

type CategoryTabsProps = {
  onCategoryChange: (category: string) => void
}

export default function MpCategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState("All")

  const categories = useMemo(() => {
    const categoryCounts = products.reduce(
      (acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.keys(categoryCounts)
      .filter((category) => MASTER_CATEGORIES.includes(category))
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
  }, [])

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
    onCategoryChange(cat)
  }

  return (
    <div className="w-full bg-white mt-4 mb-4">
  <div className="flex justify-center">
    <div className="flex space-x-3 px-4 py-3 max-w-7xl overflow-x-auto scrollbar-hide">
      <button
        onClick={() => handleCategoryClick("All")}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] lg:text-xs flex-shrink-0 ${
          activeCategory === "All"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] lg:text-xs flex-shrink-0 ${
            activeCategory === category
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</div>

  )
}
