// src/components/forms/register/RegisterStepperForm.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import MyInput from "../inputs/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"; 
import { useRouter } from "next/navigation";

const steps = ["Personal Info", "Account Details", "Business Info"];

type Errors = Record<string, string>;

export default function RegisterStepperForm() {
   const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    businessCategory: "",
    referral: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);


// Add this new state
const [passwordRequirements, setPasswordRequirements] = useState({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
});

// Monitor password changes
useEffect(() => {
  const pwd = formData.password;
  setPasswordRequirements({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });
}, [formData.password]);

const passwordProgress = Object.values(passwordRequirements).filter(Boolean).length * 20;

// Helper for icons
const getIcon = (ok: boolean) =>
  ok ? <CheckCircle className="text-green-600 w-4 h-4" /> : <XCircle className="text-red-500 w-4 h-4" />;


 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  // Update form data
  setFormData((prev) => ({ ...prev, [name]: value }));

  // Real-time field validation
  setErrors((prevErrors) => {
    const updatedErrors = { ...prevErrors };

    if (name === "firstName" || name === "lastName") {
      if (!/^[A-Za-z]{3,}$/.test(value)) {
        updatedErrors[name] = "Name must be at least 3 letters and no numbers.";
      } else {
        delete updatedErrors[name];
      }
    }

    if (name === "phone") {
      if (!/^\d{11,}$/.test(value)) {
        updatedErrors.phone = "Phone number must be at least 13 digits.";
      } else {
        delete updatedErrors.phone;
      }
    }

    return updatedErrors;
  });
};



  const checkPasswordStrength = (password: string) => {
    if (!password) return "";
    const strongRegex = new RegExp(
      "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    const mediumRegex = new RegExp(
      "^(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*\\d))|((?=.*[a-z])(?=.*\\d)))[A-Za-z\\d@$!%*?&]{6,}$"
    );

    if (strongRegex.test(password)) return "Strong";
    if (mediumRegex.test(password)) return "Good";
    if (password.length > 4) return "Fair";
    return "Weak";
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const validateStep = () => {
  const stepErrors: Errors = {};

  if (step === 0) {
    if (!formData.firstName.trim()) {
      stepErrors.firstName = "❌ First name is required";
    } else if (!/^[A-Za-z]{3,}$/.test(formData.firstName)) {
      stepErrors.firstName = "ℹ️ Name must be at least 3 letters and no numbers.";
    }

    if (!formData.lastName.trim()) {
      stepErrors.lastName = "❌ Last name is required";
    } else if (!/^[A-Za-z]{3,}$/.test(formData.lastName)) {
      stepErrors.lastName = "❌ Name must be at least 3 letters and no numbers.";
    }
  }

  if (step === 1) {
    if (!formData.email.trim()) stepErrors.email = "❌ Email is required";
    if (!formData.phone.trim()) {
      stepErrors.phone = "❌ Phone number is required";
    } else if (!/^\d{11,}$/.test(formData.phone)) {
      stepErrors.phone = "Phone number must be at least 13 digits.";
    }
    if (!formData.password) stepErrors.password = "Password is required";
  }

  if (step === 2) {
    if (!formData.businessName.trim())
      stepErrors.businessName = "❌ Business name is required";
    if (!formData.businessCategory.trim())
      stepErrors.businessCategory = "Business category is required";
  }

  setErrors(stepErrors);
  return Object.keys(stepErrors).length === 0;
};


const [businessCategories, setBusinessCategories] = useState<{ id: number; name: string }[]>([]);


const fetchBusinessCategories = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meta/business-categories`);
    const data = await res.json();
    setBusinessCategories(data.data || []); // Use `data.data` instead of `message`
  } catch (error) {
    toast.error("Failed to load categories");
  }
};


useEffect(() => {
  if (step === 2 && businessCategories.length === 0) {
    fetchBusinessCategories();
  }
}, [step]);


const nextStep = async () => {
  if (!validateStep()) return;

  if (step === 1) {
    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
    if (!isPasswordValid) {
      toast.error("Password must meet all requirements.");
      return;
    }

    const isEmailValid = await checkEmail();
    if (!isEmailValid) return;
  }

  setStep((s) => s + 1);
};

  const prevStep = () => setStep((s) => s - 1);
    const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateStep()) return;

  try {
    setLoading(true);
    // Make API request
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json(); // parse the response

    if (!res.ok) {
      // Show API error message if available
      toast.error(data.message || "❌ Registration failed, please try again.", {  position: 'top-center',});
      return;
    }

    // Show success message from API
    toast.success(data.message || "✅ Registration successful!", {  position: 'top-center',});
          const user = data.data.user;
      const token = data.data.token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', JSON.stringify(token));

      toast.success(`${user.business_slug} Login successful!`, { position: 'top-center' });

      const slug = user.business_slug || 'dashboard';
      router.push(`/${slug}/dashboard`);
  } catch (err) {
    toast.error(`❌ Registration failed, please try again. ${err}`, {  position: 'top-center',});
  } finally {
    setLoading(false);
  }
};


 const checkEmail = async () => {
  try {
    setCheckingEmail(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });

    const data = await res.json();

    // Helper to extract the message coming from your sample response
    const getApiErrorMsg = (d: any): string => {
      if (Array.isArray(d?.data) && d.data.length > 0 && d.data[0]?.msg) {
        return d.data.map((e: any) => e.msg).join(", ");
      }
      if (typeof d?.data?.msg === "string") return d.data.msg;
      if (typeof d?.message === "string") return d.message;
      return "Something went wrong";
    };

    if (!res.ok) {
      const apiMsg = getApiErrorMsg(data);
      toast.error(apiMsg, {  position: 'top-center',});
      setErrors((prev) => ({ ...prev, email: apiMsg })); // optional
      return false;
    }

    if (data?.data?.exists) {
      toast.error("User account found!", {  position: 'top-center',});
      setErrors((prev) => ({ ...prev, email: "Email already exists." })); // optional
      return false;
    }

    // clear any previous email error if success
    setErrors((prev) => {
      const { email, ...rest } = prev;
      return rest;
    });

    return true;
  } catch (error) {
    toast.error("Unable to verify email. Try again.", {  position: 'top-center',});
    return false;
  } finally {
    setCheckingEmail(false);
  }
};


  const strengthColor =
    passwordStrength === "Strong"
      ? "text-green-600"
      : passwordStrength === "Good"
      ? "text-blue-500"
      : passwordStrength === "Fair"
      ? "text-yellow-600"
      : "text-red-500";

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="max-w-xl mx-auto font-[SF Pro Text]">
      {/* Apple-like stepper progress */}
      <div className="w-full bg-gray-200/70 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between mb-6 text-xs font-medium text-gray-500">
        {steps.map((label, idx) => (
          <span key={label} className={idx === step ? "text-black" : ""}>
            {label}
          </span>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-md border border-gray-100"
      >
        {/* Step 0 */}
        {step === 0 && (
          <>
            <MyInput
              id="firstName"
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <MyInput
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <MyInput
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <MyInput
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            {/* Password with Apple-style progress */}
            <div>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleChange}
                  className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
                            bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
                            transition-all duration-300 placeholder-transparent
                            focus:border-blue-500 focus:outline-none"
                />
                <label
                  className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-xs transition-all duration-200
                    peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
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
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordProgress < 40
                      ? "bg-red-500"
                      : passwordProgress < 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${passwordProgress}%` }}
                ></div>
              </div>

              {/* Password requirements */}
              <ul className="text-xs space-y-1 mt-2 text-gray-600">
                <li className="flex items-center gap-2">
                  {getIcon(passwordRequirements.uppercase)} One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  {getIcon(passwordRequirements.lowercase)} One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  {getIcon(passwordRequirements.number)} One number
                </li>
                <li className="flex items-center gap-2">
                  {getIcon(passwordRequirements.special)} One symbol
                </li>
                <li className="flex items-center gap-2">
                  {getIcon(passwordRequirements.length)} Minimum of 8 characters
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <MyInput
              id="businessName"
              name="businessName"
              label="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              error={errors.businessName}
            />
            <div className="relative w-full">
            <select
                id="outlined-select"
                className="peer w-full rounded-xl px-4 pt-4 pb-2 text-gray-900 text-sm
            bg-white/40 backdrop-blur-xl border border-gray-300/50 shadow-inner
            transition-all duration-300 placeholder-transparent
            focus:border-blue-500 focus:outline-none"
            
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleChange}
                >
                <option value="">Select category</option>
                {businessCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                    {category.name}
                    </option>
                ))}
                </select>
                <label
                htmlFor="outlined-select"
                className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-xs transition-all duration-200
                        peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                        peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
            >
                Select Option
            </label>
                {errors.businessCategory && (
                <p className="text-red-500 text-xs mt-1">{errors.businessCategory}</p>
                )}
            </div>
            {/* <div className="relative w-full">
              <select
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleChange}
                className="peer w-full border border-gray-300 rounded-xl px-3 pt-4 pb-1 text-gray-900
                  focus:border-black focus:ring-1 focus:ring-black focus:outline-none text-sm bg-white shadow-sm"
              >
                <option value="">Select category</option>
                {businessCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.businessCategory && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.businessCategory}
                </p>
              )}
            </div> */}
            <MyInput
              id="referral"
              name="referral"
              label="Referral (optional)"
              value={formData.referral}
              onChange={handleChange}
            />
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          {step > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              className="rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={loading || checkingEmail}
              className="rounded-xl bg-black text-white hover:bg-gray-900"
            >
              {checkingEmail ? "Checking..." : "Next"}
            </Button>
          ) : (
            <Button
              type="submit"
              loading={loading}
              className="rounded-xl bg-black text-white hover:bg-gray-900"
            >
              Register
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
