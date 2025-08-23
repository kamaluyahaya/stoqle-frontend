// src/app/reset-password/[token]/page.tsx
'use client';

import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword

  ] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check requirements in real-time
  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const totalMet = Object.values(requirements).filter(Boolean).length;
  const progress = (totalMet / 5) * 100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('Passwords do not match', {  position: 'top-center',});
      return;
    }

    if (totalMet < 5) {
      toast.error('Your password does not meet all the requirements.', {  position: 'top-center',});
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Invalid or expired link', {  position: 'top-center',});
        return;
      }

      toast.success('Password updated! You can login now.', {  position: 'top-center',});
      router.push('/login');
    } catch {
      toast.error('Something went wrong.', {  position: 'top-center',});
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (condition: boolean) =>
    condition ? (
      <CheckCircle className="text-green-600 w-4 h-4" />
    ) : (
      <XCircle className="text-red-500 w-4 h-4" />
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-xl font-semibold mb-2 text-gray-800">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a strong password that meets the requirements below.</p>

        {/* Password Field */}
        <form onSubmit={submit} className="space-y-4">
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border rounded-md px-3 pt-3 pb-1 text-gray-900 text-sm
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                border-gray-400"
            />
            <label
              className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-xs transition-all duration-200
                peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
            >
              New Password
            </label>
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

         

          {/* Confirm Password */}
          <div className="relative w-full">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirm"
              placeholder=" "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="peer w-full border rounded-md px-3 pt-3 pb-1 text-gray-900 text-sm
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                border-gray-400"
            />
            <label
              className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-xs transition-all duration-200
                peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
            >
              Confirm Password
            </label>
            <span
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

           {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress < 40
                  ? 'bg-red-500'
                  : progress < 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Requirements */}
          <ul className="text-sm space-y-1 mt-2 text-gray-600">
            <li className="flex items-center gap-2">
              {getIcon(requirements.uppercase)} One uppercase letter (e.g. “A”)
            </li>
            <li className="flex items-center gap-2">
              {getIcon(requirements.lowercase)} One lowercase letter (e.g. “a”)
            </li>
            <li className="flex items-center gap-2">
              {getIcon(requirements.number)} One number (e.g. “1”)
            </li>
            <li className="flex items-center gap-2">
              {getIcon(requirements.special)} One symbol or special character (e.g. “.,*!@”)
            </li>
            <li className="flex items-center gap-2">
              {getIcon(requirements.length)} Minimum of 8 characters
            </li>
          </ul>

          <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 text-white py-2 text-sm disabled:opacity-60"
            >
              {loading ? 'Please wait…' : 'Reset password'}
            </button>
        </form>
      </div>
    </div>
  );
}
