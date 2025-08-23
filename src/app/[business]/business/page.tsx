'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCustomDate } from '@/components/dateFormatting/formattingDate';

type Business = {
  business_id: number | string;
  business_name: string;
  email?: string | null;
  business_slug?: string | null;
  phone?: string | null;
  business_category?: string | null;
  referral?: string | null | number;
  logo?: string | null;
  business_status?: string | null;
  business_address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function BusinessSinglePage() {
  const [mounted, setMounted] = useState(false); // render only after mount to avoid SSR/CSR mismatch
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state - always strings (so inputs never receive numbers/objects)
  const [form, setForm] = useState<{
    business_name?: string;
    email?: string;
    phone?: string;
    business_category?: string;
    referral?: string;
    business_address?: string;
    business_status?: string;
  }>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Safe display helper - never calls .trim on non-strings
  const display = (v?: unknown) => {
    if (v === null || v === undefined) return '-';
    // If it's an object (not primitive), stringify
    if (typeof v === 'object') {
      try {
        return JSON.stringify(v);
      } catch {
        return '-';
      }
    }
    // numbers/booleans -> convert to string
    const s = String(v);
    const trimmed = s.trim();
    return trimmed.length ? trimmed : '-';
  };

  // Fetch business from backend
  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();

      if (res.status === 401 || payload?.message === 'Unauthorized') {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) throw new Error(payload?.message || 'Failed to fetch business');

      // backend returns { ok: true, data: { ... } }
      const b: Business = payload?.data ?? null;
      setBusiness(b ?? null);

      // normalize form fields to strings (inputs expect strings)
      if (b) {
        setForm({
          business_name: b.business_name ?? '',
          email: b.email ?? '',
          phone: b.phone ?? '',
          business_category: b.business_category ?? '',
          referral: b.referral != null ? String(b.referral) : '',
          business_address: b.business_address ?? '',
          business_status: b.business_status ?? 'inactive',
        });
      } else {
        setForm({});
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Could not load business');
    } finally {
      setLoading(false);
    }
  };

  // run once after mount
  useEffect(() => {
    setMounted(true);
    // fetch business after mount (so localStorage token is available client-side)
    fetchBusiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // open edit and ensure form state is set
  const openEdit = () => {
    if (business) {
      setForm({
        business_name: business.business_name ?? '',
        email: business.email ?? '',
        phone: business.phone ?? '',
        business_category: business.business_category ?? '',
        referral: business.referral != null ? String(business.referral) : '',
        business_address: business.business_address ?? '',
        business_status: business.business_status ?? 'inactive',
      });
      setLogoFile(null);
    }
    setEditing(true);
  };

  const handleFile = (file?: File) => {
    if (file) setLogoFile(file);
  };

  // Save - note: backend expects PUT /api/businesses/me
  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null');

      let options: RequestInit = { headers: { Authorization: `Bearer ${token}` }, method: 'PUT' };

      if (logoFile) {
        const fd = new FormData();
        fd.append('business_name', form.business_name ?? business.business_name ?? '');
        fd.append('email', form.email ?? '');
        fd.append('phone', form.phone ?? '');
        fd.append('business_category', form.business_category ?? '');
        fd.append('referral', form.referral ?? '');
        fd.append('business_address', form.business_address ?? '');
        fd.append('business_status', form.business_status ?? '');
        fd.append('logo', logoFile);
        options.body = fd;
      } else {
        options.headers = { ...(options.headers as any), 'Content-Type': 'application/json' };
        options.body = JSON.stringify({
          business_name: form.business_name ?? business.business_name,
          email: form.email ?? null,
          phone: form.phone ?? null,
          business_category: form.business_category ?? null,
          referral: form.referral ?? null,
          business_address: form.business_address ?? null,
          business_status: form.business_status ?? null,
        });
      }

      // Server expects PUT /api/businesses/me
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`, options);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Failed to update business');

      toast.success('Business updated successfully');

      const updated: Business = payload?.data ?? null;
      setBusiness(updated);
      // normalize updated into form strings again
      if (updated) {
        setForm({
          business_name: updated.business_name ?? '',
          email: updated.email ?? '',
          phone: updated.phone ?? '',
          business_category: updated.business_category ?? '',
          referral: updated.referral != null ? String(updated.referral) : '',
          business_address: updated.business_address ?? '',
          business_status: updated.business_status ?? 'inactive',
        });
      }
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null; // avoid SSR/CSR mismatch (component renders only client-side)

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="mx-auto ">
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-lg border border-slate-100">
      <div className="flex items-start gap-6">
        {/* Logo / Placeholder */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : business?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo}
              alt={business.business_name ?? "logo"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 text-sm">No logo</div>
          )}
        </div>

        {/* Business Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {business?.business_name ?? "Your Business"}
              </h2>
              <div className="text-sm text-slate-500 mt-1">
                {display(business?.business_category)} •{" "}
                {display(business?.referral)}
              </div>
            </div>

            {/* Status + Edit */}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                  business?.business_status === "active"
                    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {display(business?.business_status)}
              </span>

              <button
                onClick={openEdit}
                className="p-2.5 rounded-full hover:bg-sky-50 transition-colors"
                aria-label="edit"
              >
                <Edit2 className="w-5 h-5 text-sky-600" />
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm">
            <div>
              <p className="text-slate-500">Email</p>
              <p className="text-slate-900 font-medium">
                {display(business?.email)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Phone</p>
              <p className="text-slate-900 font-medium">
                {display(business?.phone)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500">Address</p>
              <p className="text-slate-900 font-medium">
                {display(business?.business_address)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-slate-400 mt-6 border-t pt-3">
            Created:{" "}
            {business?.created_at
              ? formatCustomDate(new Date(business.created_at))
              : "-"}
          </div>
        </div>
      </div>
    </div>


          {/* Edit form modal (simple inline card) */}
          {editing && (
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Update Business Details</h3>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-xs text-slate-500">Business name</label>
                <input
                  value={form.business_name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Email</label>
                    <input
                      value={form.email ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Phone</label>
                    <input
                      value={form.phone ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <label className="text-xs text-slate-500">Category</label>
                <input
                  value={form.business_category ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, business_category: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                />

                <label className="text-xs text-slate-500">Referral</label>
                <input
                  value={form.referral ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, referral: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                />

                <label className="text-xs text-slate-500">Address</label>
                <input
                  value={form.business_address ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, business_address: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                />

                <div>
                  <label className="text-xs text-slate-500">Status</label>
                  <select
                    value={form.business_status ?? 'inactive'}
                    onChange={(e) => setForm((f) => ({ ...f, business_status: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 bg-slate-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500">Logo (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files ? e.target.files[0] : undefined)}
                    className="w-full rounded-xl px-4 py-2 bg-slate-50 border border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end mt-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:shadow-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-full bg-gradient-to-b from-blue-600 to-blue-500 text-white shadow-sm hover:brightness-95 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {loading && <div className="mt-4 text-center text-slate-500">Loading…</div>}

        {!business && !loading && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm text-center text-slate-500">No business registered yet.</div>
        )}
      </div>
    </div>
  );
}
