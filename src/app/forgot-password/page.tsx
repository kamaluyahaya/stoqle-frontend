'use client';

import MyInput from '@/components/forms/inputs/input';
import { Button } from '@/components/forms/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Generic success message (to prevent email enumeration)
      toast.success('If that email exists, a reset link has been sent.', { position: 'top-center' });
      setIsSent(true);
    } catch (e) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          {isSent ? (
            <img src="/success-mark.png" alt="Success" className="mx-auto w-44" />
          ) : (
            <img src="/logo0.png" alt="Stoqle Logo" className="mx-auto w-32" />
          )}

          <h1 className="text-xl font-semibold mb-2 text-gray-800 mt-5">
            {isSent ? 'Password reset email sent' : 'Forgot Password'}
          </h1>

          <p className="text-gray-500 text-sm text-center">
            {isSent
              ? `If the email ${email} is registered, we have sent a password reset link. Please check your inbox.`
              : 'Enter your email and we’ll send you a reset link.'}
          </p>
        </div>

        {isSent ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm">
              <p className="font-medium">Didn’t get the email?</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                <li>Check your Spam or Promotions folder.</li>
                <li>Ensure you entered the correct email address.</li>
                <li>Wait at least 5 minutes before requesting again.</li>
              </ul>
            </div>

            <div className="text-center">
              <Link href="/login" className="bg-blue-600 text-white hover:bg-blue-700 p-4 rounded-md font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <MyInput
              type="email"
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" loading={loading} fullWidth variant="primary" size="md">
              Send reset link
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{' '}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
