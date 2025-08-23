// src/components/inventory/InventoryTabs.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'all-products', label: 'All Products' },
  { key: 'stock-adjustment', label: 'Stock Adjustment' },
//   { key: 'stock-count', label: 'Stock Count' },
  { key: 'inventory-transfer', label: 'Inventory Transfer' },
  { key: 'stock-label', label: 'Stock Label' },
];

type Props = {
  activeTab: string;
  setActiveTab: (t: string) => void;
  // accept the nullable ref returned by useRef(..., null)
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export default function InventoryTabs({ activeTab, setActiveTab, containerRef }: Props) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    // guard against null (containerRef.current may be null)
    if (!containerRef?.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const activeBtn = buttonRefs.current[activeTab];
    if (activeBtn) {
      const btnRect = activeBtn.getBoundingClientRect();
      const left = btnRect.left - containerRect.left + (containerRef.current ? containerRef.current.scrollLeft : 0);
      const width = btnRect.width;
      setIndicatorStyle({ left, width });
    }
  }, [activeTab, containerRef]);

  return (
    <div className="flex justify-center px-4 sm:px-0">
      <div
        className="relative flex flex-nowrap overflow-x-auto no-scrollbar bg-gray-200 rounded-full p-1 w-full md:w-auto max-w-4xl shadow-sm"
        ref={containerRef as React.RefObject<HTMLDivElement>} // okay because DOM accepts nullable ref
      >
        <motion.div
          className="absolute top-0 bottom-0 rounded-full bg-blue-600"
          initial={false}
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ position: 'absolute' }}
        />
        {TABS.map(tab => (
          <button
            key={tab.key}
            ref={el => { buttonRefs.current[tab.key] = el; }}
            onClick={() => setActiveTab(tab.key)}
            className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm md:text-base transition-colors duration-200 text-center whitespace-nowrap ${activeTab === tab.key ? 'text-white' : 'text-gray-700'}`}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
