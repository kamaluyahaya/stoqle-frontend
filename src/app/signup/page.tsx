// src/app/register/page.tsx

// import RegisterStepperForm from "../components/forms/register/registerForm";
import RegisterStepperForm from "@/components/forms/register/registerForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <img
            src="/logo0.png"
            alt="Stoqle Logo"
            className="mx-auto w-32"
          />
          <p className="text-gray-500 text-sm mt-2">
            Create your Stoqle account
          </p>
        </div>

        <RegisterStepperForm />

         <p className="text-center text-sm text-gray-500 mt-6">By clicking “Sign Up” I agree to Stoqle Terms of Service and Privacy.</p>

        <p className="text-center text-sm text-gray-500 mt-2">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
