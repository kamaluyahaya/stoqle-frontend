// File: components/StoreDropdown.tsx
// ------------------------------------------------
// A self-contained portal dropdown. Drop this into `components/StoreDropdown.tsx`.

'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDefault?: boolean;
};

export default function StoreDropdown({ anchorEl, open, onClose, onEdit, onDelete, isDefault }: Props) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuWidth = 180;
  const padding = 8;

  // SSR-safe: if document is not available, render nothing
  if (typeof document === 'undefined') return null;

  useLayoutEffect(() => {
    if (!anchorEl || !open) return;

    const rect = anchorEl.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    let top = rect.bottom + scrollY + 8;
    let left = rect.right + scrollX - menuWidth;

    const approxMenuHeight = 120;
    if (top + approxMenuHeight > window.innerHeight + scrollY) {
      top = rect.top + scrollY - 8 - approxMenuHeight;
    }

    if (left < padding) left = padding;
    if (left + menuWidth > window.innerWidth - padding)
      left = window.innerWidth - menuWidth - padding;

    setPos({ top, left });
  }, [anchorEl, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !anchorEl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{ position: 'absolute', top: pos.top, left: pos.left, width: menuWidth }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="w-full rounded-lg backdrop-blur-md bg-white/75 ring-1 ring-black/6 shadow-[0_10px_30px_rgba(10,10,10,0.12)] overflow-hidden"
            role="menu"
            aria-orientation="vertical"
          >
            <button
              onClick={() => {
                onEdit();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit2 size={14} /> Edit
            </button>

            {!isDefault && (
              <button
                onClick={() => {
                  onDelete();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}

            {isDefault && (
              <div className="px-4 py-2 text-sm text-gray-400 flex items-center gap-2 cursor-not-allowed">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" />
                </svg>
                Default Store
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}
