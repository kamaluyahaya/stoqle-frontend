'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Trash2, ArchiveRestore } from 'lucide-react';

type TicketItem = {
  product_id: string;
  name: string;
  price: number;
  quantity?: number;
  discount?: number;
  image?: string;
  barcode?: string;
};

type Ticket = {
  id: string;
  name?: string;
  items: TicketItem[];
  total?: number;
  status?: string;
  createdAt?: string;
};

type OpenTicketDialogProps = {
  show: boolean;
  onClose: () => void;
  ticketsProp?: Ticket[]; // optional — if not provided, component reads from localStorage
  onOpenTicket: (ticket: Ticket) => void;
  onDelete?: (id: string) => void; // optional callback for deletion
};

export default function OpenTicketDialog({
  show,
  onClose,
  ticketsProp,
  onOpenTicket,
  onDelete,
}: OpenTicketDialogProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

useEffect(() => {
  if (ticketsProp) {
    setTickets(ticketsProp);
    return;
  }
  const raw = localStorage.getItem('savedTickets');
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    const userRaw = localStorage.getItem('user');
    const u = userRaw ? JSON.parse(userRaw) : null;
    const businessId = u?.business_id || null;

    const businessTickets = parsed[businessId] || [];
    setTickets(businessTickets);
  } catch {
    setTickets([]);
  }
}, [ticketsProp, show]);

  const handleOpen = (t: Ticket) => {
    onOpenTicket(t);
    onClose();
  };

  

  const handleDelete = (id: string) => {
    const filtered = tickets.filter((t) => t.id !== id);
    setTickets(filtered);
    localStorage.setItem('savedTickets', JSON.stringify(filtered));
    if (onDelete) onDelete(id);
  };

  const formatPrice = (v?: number) =>
    v == null ? '' : `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            className="bg-white backdrop-blur-lg p-6 rounded-3xl w-full max-w-2xl shadow-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
            >
              <X size={16} />
            </button>

            <div className="p-1 mt-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Open Ticket</h2>
              <p className="text-sm text-gray-500 mb-4">Select a saved ticket to load into cart (this will replace the current cart).</p>

              {tickets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No saved tickets found.</div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {tickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <div>
                        <div className="font-medium text-gray-900">{t.name || 'Untitled ticket'}</div>
                        <div className="text-xs text-gray-500">
                          {t.items?.length ?? 0} item(s) • {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}
                        </div>
                        {t.total != null && <div className="text-sm font-semibold text-gray-700 mt-1">{formatPrice(t.total)}</div>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpen(t)}
                          className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center gap-2"
                        >
                          <ArchiveRestore size={16} />
                          Open
                        </button>

                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 rounded-full bg-gray-100 hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
