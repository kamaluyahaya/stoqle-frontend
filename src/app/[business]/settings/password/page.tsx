'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, EyeOff, Eye, CheckCircle, XCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function validate(): boolean {
    if (!oldPassword || oldPassword.length < 6) {
      setErrorMsg('Old password is required (min 6 chars)');
      return false;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      // grab token from localStorage
      let rawToken: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('token') || 'null');
          rawToken =
            typeof stored === 'string'
              ? stored
              : stored?.token || stored?.accessToken || stored?.access_token || null;
        } catch {
          rawToken = localStorage.getItem('token');
        }
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (rawToken) headers['Authorization'] = `Bearer ${rawToken}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/password/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const txt = await res.json().catch(() => null);
        throw new Error(txt?.message || `Request failed: ${res.status}`);
      }

      const json = await res.json();
      toast.info(json?.message || 'Password changed successfully', {position: 'top-center'});
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl">
      <div className="mx-auto ">
        <h1 className="text-3xl font-semibold tracking-tight">
          Change <span className="text-blue-500">Password</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Update your account security.</p>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          onSubmit={handleSubmit}
          className="mt-6 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-md space-y-4"
        >
          {/* Old Password */}
          <PasswordField
            label="Old Password"
            value={oldPassword}
            onChange={setOldPassword}
            show={showOld}
            toggle={() => setShowOld((p) => !p)}
          />

          {/* New Password */}
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            toggle={() => setShowNew((p) => !p)}
          />

          {/* Confirm Password */}
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            toggle={() => setShowConfirm((p) => !p)}
          />

          {/* Messages */}
          <div className="flex flex-col gap-2">
            {successMsg && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:scale-[1.01] transition-transform text-sm inline-flex items-center justify-center gap-2"
          >
            {loading ? 'Updating...' : <>
              <Save className="w-4 h-4" />
              Update Password
            </>}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <div className="relative w-full">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
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
        {label}
      </label>
      <span
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>
  );
}
