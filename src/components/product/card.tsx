'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-black/5 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-700">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
