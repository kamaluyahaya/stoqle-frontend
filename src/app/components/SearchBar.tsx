"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  activeCategory: string
}

export default function SearchBar({ onSearch, activeCategory }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")

  // Debounce effect (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [inputValue])

  // Trigger search when debounced value updates
  useEffect(() => {
    if (debouncedValue.trim() === "") {
      onSearch("") // reset search
    } else {
      onSearch(debouncedValue.trim())
    }
  }, [debouncedValue, onSearch, activeCategory])

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <input
        type="text"
        placeholder={activeCategory === "All" ? "Search all products..." : `Search in ${activeCategory}...`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:shadow-sm text-xs lg:text-sm"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
    </div>
  )
}
