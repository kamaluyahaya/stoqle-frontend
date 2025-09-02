'use client';
import { Button } from '../ui/button';
import MyInput from '../inputs/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

type LoginResponse =
  | {
      status: 'success';
      message: string;

      data: {
        token: string;
        user: {
          id: number;
          email: string;
          full_name: string;
          role: string;
          business_id: number;
          business_slug: string;
        };
      };
    }
  | {
      status: 'error';
      message: string;
      data?: unknown;
    };

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Real-time field validation
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

  const handleChange = (name: string, value: string) => {
    setForm((s) => ({ ...s, [name]: value }));
    validateField(name, value);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const isEmailValid = validateField('email', form.email);
    const isPasswordValid = validateField('password', form.password);

    if (!isEmailValid || !isPasswordValid) {
      toast.error('Please fill all required fields correctly.', { position: 'top-center' });
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      const data: LoginResponse = await res.json();

      if (!res.ok || data.status !== 'success') {
        toast.error((data as any)?.message ?? 'Login failed', { position: 'top-center' });
        return;
      }

      const user = data.data.user;
      const token = data.data.token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', JSON.stringify(token));
      

      toast.success(`${user.business_slug} Login successful!`, { position: 'top-center' });

      const slug = user.business_slug || 'dashboard';
            try {  router.prefetch(`/${slug}/dashboard`); } catch (e) { /* ignore */ }
      setLoading(false);
      router.replace(`/${slug}/dashboard`)
    } catch (err) {
      console.error(err);
      const msg = 'Something went wrong. Please try again.';
      setErrorMsg(msg);
      toast.error(msg, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <MyInput
          type="email"
          label="Email"
          name="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="rounded-xl"
        />
        {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
      </div>

      {/* Password */}
      <div className="relative w-full">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder=" "
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
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

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          checked={form.remember}
          onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
          className="h-4 w-4 rounded accent-blue-500"
        />
        <label htmlFor="remember" className="text-sm text-gray-700">
          Remember Me
        </label>
      </div>

      {errorMsg && <p className="text-red-600 text-sm -mt-2">{errorMsg}</p>}

      <Button
        type="submit"
        loading={loading}
        fullWidth
        variant="primary"
        size="md"
        className="rounded-xl hover:bg-primary  text-white font-medium"
      >
        Login
      </Button>
    </form>
  );
}
