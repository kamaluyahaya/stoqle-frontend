// CreateStaffForm.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Business {
  id: string;
  name: string;
}

type Role = "admin" | "manager" | "staff" | "support";

interface FormState {
  staff_id: string;
  business_id: string;
  full_name: string;
  email: string;
  password: string;
  role: Role;
  profile_image: File | null;
  status: boolean;
  last_login?: string;
  last_logout?: string;
  created_at?: string;
  updated_at?: string;
}

type Props = {
  businessList?: Business[];
};

export default function CreateStaffForm({ businessList = [] }: Props) {
  const [form, setForm] = useState<FormState>({
    staff_id: "",
    business_id: businessList?.[0]?.id ?? "",
    full_name: "",
    email: "",
    password: "",
    role: "staff",
    profile_image: null,
    status: true,
    last_login: undefined,
    last_logout: undefined,
    created_at: undefined,
    updated_at: undefined,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const now = new Date().toISOString();
    setForm((s) => ({ ...s, created_at: now, updated_at: now }));
  }, []);

  function validate(): Partial<Record<keyof FormState, string>> {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (!form.role) e.role = "Role is required";
    return e;
  }

  function passwordStrengthLabel(pw: string) {
    if (!pw) return "Empty";
    if (pw.length < 8) return "Weak";
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return "Strong";
    return "Medium";
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm((s) => ({ ...s, profile_image: file }));
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result ?? null));
    reader.readAsDataURL(file);
  }

  function handleInputChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    setSubmitting(true);
    setSuccess(null);

    const payload = new FormData();
    payload.append("business_id", form.business_id);
    payload.append("full_name", form.full_name);
    payload.append("email", form.email);
    payload.append("password", form.password);
    payload.append("role", form.role);
    payload.append("status", form.status ? "active" : "inactive");
    if (form.profile_image) payload.append("profile_image", form.profile_image, form.profile_image.name);

    try {
      // Replace with your real API call:
      // const res = await fetch('/api/staff', { method: 'POST', body: payload });
      // const json = await res.json();

      // simulate
      await new Promise((r) => setTimeout(r, 700));
      const fakeResponse = {
        staff_id: `STF-${Math.floor(Math.random() * 90000) + 10000}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setForm((s) => ({ ...s, staff_id: fakeResponse.staff_id, created_at: fakeResponse.created_at, updated_at: fakeResponse.updated_at }));
      setSuccess("Staff created successfully");
      setForm((s) => ({ ...s, password: "" }));
    } catch (err) {
      console.error(err);
      setErrors({ email: "Failed to create staff. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-100"
      >
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Create Staff</h1>
            <p className="mt-1 text-sm text-slate-500">Add a new staff member for your business. Clean, Apple-like UI.</p>
          </div>
          <div className="text-right text-sm text-slate-400">Stoqle • Staff</div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* form body (identical to the UI you had) */}
          {/* ... full form markup omitted here for brevity; use the markup in the previous message or the canvas file. */}
        </form>
      </motion.div>
    </div>
  );
}
