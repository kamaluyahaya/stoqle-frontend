// src/components/ProductCard.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Product } from '../types';

type Props = {
  product: Product;
  onAdd: (p: Product) => void;
  index?: number;
};

export default function ProductCard({ product, onAdd, index = 0 }: Props) {
  function getInitials(name?: string) {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl text-center bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      style={{ minHeight: 150 }}
      onClick={() => onAdd(product)}
    >
      <div className="relative w-full h-[110px] shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 550px) 100vw, 30vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-300 text-white text-xl font-bold uppercase">
            {getInitials(product.name)}
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-gray-900 font-semibold truncate text-sm min-w-0">
          {product.name}
        </h3>
      </div>

      <div className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-sm group-hover:scale-110 transition">
        <PlusCircle className="w-4 h-4 text-blue-600" />
      </div>
    </motion.div>
  );
}
