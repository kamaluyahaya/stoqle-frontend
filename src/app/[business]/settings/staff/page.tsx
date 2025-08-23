// CreateStaffPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Save,
  UploadCloud,
  Key,
  EyeOff,
  Eye,
} from 'lucide-react';
import Input from '@/components/product/input';

type StaffUser = {
  staff_id?: string;        // generated client-side if omitted
  business_id?: string | number | null;
  full_name: string;
  email: string;
  phone?: string;           // <-- added phone
  password?: string;
  role: string;
  profile_image?: File | null;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string | null;
  last_logout?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function CreateStaffPage() {
  const [form, setForm] = useState<StaffUser>({
    staff_id: generateId(),
    business_id: null,
    full_name: '',
    email: '',
    phone: '',               // <-- initialize phone
    password: '',
    role: 'staff',
    profile_image: null,
    status: 'active',
    last_login: null,
    last_logout: null,
    created_at: isoNow(),
    updated_at: isoNow(),
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    // try to prefill business_id from localStorage or app context
    if (typeof window !== 'undefined') {
      const b = localStorage.getItem('current_business_id');
      if (b) setForm((s) => ({ ...s, business_id: b }));
    }
  }, []);

  useEffect(() => {
    // clean up preview on unmount
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setForm((s) => ({ ...s, profile_image: f }));
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setPreviewUrl(null);
    }
  }

  function update<K extends keyof StaffUser>(key: K, value: StaffUser[K]) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [String(key)]: '' }));
  }

  const validateField = (name: string, value: string) => {
    let message = '';
    if (!value.trim()) {
      message = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      message = 'Enter a valid email address';
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return message === '';
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Password (min 6 chars)';
    if (!form.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      // build form data for file upload
      const fd = new FormData();
      // append primitive fields
      fd.append('staff_id', form.staff_id || generateId());
      if (form.business_id) fd.append('business_id', String(form.business_id));
      fd.append('full_name', form.full_name);
      fd.append('email', form.email);
      if (form.phone) fd.append('staff_phone', String(form.phone)); // <-- append phone
      if (form.password) fd.append('password', form.password);
      fd.append('role', form.role);
      fd.append('status', form.status);
      if (form.last_login) fd.append('last_login', form.last_login);
      if (form.last_logout) fd.append('last_logout', form.last_logout);
      fd.append('created_at', form.created_at || isoNow());
      fd.append('updated_at', isoNow());
      if (form.profile_image) fd.append('profile_image', form.profile_image);

      // token extraction (same pattern you use in Insights)
      let rawToken: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('token') || 'null');
          if (stored) {
            if (typeof stored === 'string') rawToken = stored;
            else rawToken =
              stored.token ??
              stored.accessToken ??
              stored.access_token ??
              stored.authToken ??
              (stored.access && stored.access.token) ??
              null;
          }
        } catch {
          const s = localStorage.getItem('token');
          if (s) rawToken = s;
        }
      }

      const headers: Record<string, string> = {};
      if (rawToken) {
        headers['Authorization'] = `Bearer ${rawToken}`;
      }
      // NOTE: DO NOT set Content-Type here when sending FormData.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/staff`, {
        method: 'POST',
        headers,
        body: fd,
      });

      if (!res.ok) {
        const txt = await tryParseJson(res);
        throw new Error(txt?.message || `Request failed: ${res.status}`);
      }

      const json = await res.json();
      setSuccessMsg(json?.message ?? 'Staff created successfully');
      setErrorMsg(null);

      // update created/updated timestamps and staff_id with response if present
      const returned = json?.data;
      setForm((s) => ({
        ...s,
        staff_id: returned?.staff_id ?? s.staff_id,
        created_at: returned?.created_at ?? s.created_at,
        updated_at: returned?.updated_at ?? isoNow(),
        password: '', // clear password input on success
      }));
      setPreviewUrl(null);
      setForm((s) => ({ ...s })); // trigger rerender
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to create staff.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl">
      <div className=" mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Create <span className="text-blue-500">Staff</span> </h1>
            <p className="text-sm text-slate-500 mt-1">Add a team member to your business.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 p-2 rounded-xl shadow-sm border border-white/60">
              <CalendarIcon className="w-4 h-4 text-slate-600" />
              <div className="text-sm text-slate-700">Auto-saved</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-white/60 hover:scale-[1.01] transition-transform"
                aria-label="Save staff"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          onSubmit={handleSubmit}
          className="mt-6 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-md"
        >
          {/* top row: profile image + basics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-white/60">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <ImageIcon className="w-10 h-10" />
                    <div className="text-xs mt-2">Profile</div>
                  </div>
                )}
              </div>

              <label className="mt-4 inline-flex items-center gap-2 cursor-pointer text-sm px-3 py-2 rounded-xl bg-white border border-white/60 shadow-sm">
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
                <input onChange={onFileChange} accept="image/*" type="file" className="hidden" />
              </label>

              <div className="mt-3 text-xs text-slate-500 text-center">420×420 recommended. JPG, PNG.</div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Staff Name"
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Email"
                    value={form.email}
                    onChange={(e) => {
                      update('email', e.target.value);
                      validateField('email', e.target.value);
                    }}
                  />
                </div>

                {/* Phone number */}
                <div>
                  <Input
                    label="Phone number"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)} // <-- fixed to use form.phone
                  />
                </div>

                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder=" "
                    value={form.password}
                    onChange={(e) => {
                      update('password', e.target.value);
                      validateField('password', e.target.value);
                    }}
                    className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
                      bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
                      transition-all duration-300 placeholder-transparent
                      focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none"
                  />
                  <label
                    className="absolute left-4 -top-2.5 bg-white/70 px-1 text-gray-600 text-xs transition-all duration-300
                      rounded-md
                      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                      peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-black"
                  >
                    Password
                  </label>
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                  {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
                      bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
                      transition-all duration-300 placeholder-transparent
                      focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none"
                  aria-label="Role"
                >
                  <option value="staff">Staff</option>
                  <option value="inventory manager">Inventory Manager</option>
                  <option value="sales staff">Sales Staff</option>
                </select>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as StaffUser['status'])}
                  className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
                      bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
                      transition-all duration-300 placeholder-transparent
                      focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none"
                  aria-label="Status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* actions & messages */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {successMsg && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  // reset form (preserve business_id)
                  setForm({
                    staff_id: generateId(),
                    business_id: form.business_id ?? null,
                    full_name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'staff',
                    profile_image: null,
                    status: 'active',
                    last_login: null,
                    last_logout: null,
                    created_at: isoNow(),
                    updated_at: isoNow(),
                  });
                  setPreviewUrl(null);
                  setErrors({});
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/70 border border-white/60 shadow-sm text-sm"
                aria-label="Reset form"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:scale-[1.01] transition-transform text-sm inline-flex items-center gap-2"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Save staff
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

/* ---------------- Helper subcomponents + utils ---------------- */

function Field(props: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block bg-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          {props.icon ?? null}
          <span className="font-medium">{props.label}</span>
        </div>
        {props.error ? <div className="text-xs text-red-600">{props.error}</div> : null}
      </div>
      <div className="mt-2 p-3 rounded-lg bg-white/80 border border-white/50">
        {props.children}
      </div>
    </label>
  );
}

function generateId() {
  // simple unique-ish id: `stf-<timestamp>-<random>`
  return `stf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isoNow() {
  return new Date().toISOString();
}

async function tryParseJson(res: Response) {
  try {
    const t = await res.text();
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}
