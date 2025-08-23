'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import { formatCustomDate } from '@/components/dateFormatting/formattingDate';

type TicketItem = {
  product_id?: string;
  name?: string;
  price?: number;
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
  businessId?: string | null;
};

export default function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const safeParse = (s: string | null) => {
    if (!s || s === 'null' || s === 'undefined') return null;
    try { return JSON.parse(s); } catch { return null; }
  };

  const getBusinessId = () => {
    const userRaw = safeParse(localStorage.getItem('user'));
    return userRaw?.business_id ?? userRaw?.businessId ?? null;
  };

  const getSavedTicketsForBusiness = (businessId: string | null) => {
    const raw = safeParse(localStorage.getItem('savedTickets'));
    if (!raw) return [];
    // savedTickets stored as { [businessId]: Ticket[] }
    if (businessId && Array.isArray(raw[businessId])) return raw[businessId];
    // fallback: flatten all buckets if key mismatch
    if (typeof raw === 'object') return Object.values(raw).flat().filter(Boolean);
    return [];
  };

  const writeTicketsForBusiness = (businessId: string | null, bucket: Ticket[]) => {
    const raw = safeParse(localStorage.getItem('savedTickets'));
    if (Array.isArray(raw)) {
      // legacy array -> overwrite with array (but keep wrapper object preferred)
      const obj: Record<string, Ticket[]> = {};
      obj[businessId ?? 'default'] = bucket;
      localStorage.setItem('savedTickets', JSON.stringify(obj));
      return;
    }
    if (raw && typeof raw === 'object') {
      const copy = { ...raw };
      copy[businessId ?? 'default'] = bucket;
      localStorage.setItem('savedTickets', JSON.stringify(copy));
      return;
    }
    // nothing existing -> create object keyed by business
    const obj: Record<string, Ticket[]> = {};
    obj[businessId ?? 'default'] = bucket;
    localStorage.setItem('savedTickets', JSON.stringify(obj));
  };

  const normalize = (rawTickets: any[], businessId: string | null): Ticket[] => {
    return (Array.isArray(rawTickets) ? rawTickets : []).map((t: any, idx: number) => {
      const items = Array.isArray(t?.items) ? t.items : [];
      const created = t?.createdAt ?? t?.created_at ?? new Date().toISOString();
      const id = String(t?.id ?? t?.ticketId ?? `${idx}-${Date.now()}`);
      const name = typeof t?.name === 'string' && t.name.trim() ? t.name : `Ticket - ${new Date(created).toLocaleDateString()}`;
      const total = typeof t?.total === 'number' ? t.total : items.reduce((acc: number, it: any) => acc + ((it?.price || 0) * (it?.quantity || 1) - (it?.discount || 0)), 0);
      return { id, name, items, total, status: t?.status ?? 'saved', createdAt: created, businessId } as Ticket;
    });
  };

  const fetchTickets = () => {
    setLoading(true);
    try {
      const businessId = getBusinessId();
      const raw = safeParse(localStorage.getItem('savedTickets'));
      const bucket = getSavedTicketsForBusiness(businessId);
      const normalized = normalize(bucket, businessId);
      setTickets(normalized);
    } catch (err) {
      console.error('Failed to load tickets', err);
      toast.error('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleDelete = (id: string) => {
    const businessId = getBusinessId();
    const updated = tickets.filter(t => t.id !== id);
    setTickets(updated);
    writeTicketsForBusiness(businessId, updated);
    toast.success('Ticket deleted');
  };

  const handleOpen = (t: Ticket) => {
    // load into POS currentSale (match your checkout shape)
    const currentSale = {
      items: t.items.map(i => ({
        ...i,
        product_id: i.product_id ?? `tmp-${Math.random().toString(36).slice(2, 9)}`,
        quantity: i.quantity ?? 1,
        price: i.price ?? 0,
      })),
      customer: { user_id: 'walk-in', customer_name: 'Walk-in customer' },
      store_id: 'all-products',
      metadata: { fromSavedTicket: true, ticketId: t.id, loadedAt: new Date().toISOString() },
    };
    localStorage.setItem('currentSale', JSON.stringify(currentSale));
    toast.success(`Loaded "${t.name ?? 'Untitled'}" into current sale`);
    // optionally: router.push(`/${businessSlug}/pos`) if you want auto-redirect
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tickets;
    return tickets.filter(t => {
      const nameMatches = (t?.name ?? '').toLowerCase().includes(term);
      const itemMatches = Array.isArray(t?.items) && t.items.some(i => (i?.name ?? '').toLowerCase().includes(term));
      return nameMatches || itemMatches;
    });
  }, [tickets, searchTerm]);

  const formatPrice = (v?: number) =>
    v == null ? '-' : `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8 p-6 md:p-12 bg-gray-100 min-h-screen rounded-xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">Total ({filtered.length}) <span className="text-blue-500">Tickets</span></h1>

        <div className="relative w-full md:w-80">
          <input type="text" placeholder="Search tickets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-xl pl-10 pr-4 py-2 bg-gray-100 placeholder-gray-400 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </motion.div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : filtered.length ? (
              filtered.map((t, idx) => (
                <motion.tr key={t.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" /></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.items?.length ?? 0} item(s)</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(t.total)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.createdAt ? formatCustomDate(new Date(t.createdAt)) : '-'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium flex gap-2 justify-end">
                    <button onClick={() => handleOpen(t)} className="p-1 rounded-full hover:bg-gray-100"><ArchiveRestore className="w-4 h-4 text-blue-600" /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1 rounded-full hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-600" /></button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No tickets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}