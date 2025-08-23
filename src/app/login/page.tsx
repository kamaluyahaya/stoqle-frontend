// src/app/login/page.tsx
import LoginForm from "@/components/forms/login/loginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <img
            src="/logo0.png"
            alt="Stoqle Logo"
            className="mx-auto w-32"
          />
          {/* <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome Back</h1> */}
          <p className="text-gray-500 text-sm">Login to your Stoqle account</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <Link href="/forgot-password" className="text-blue-600 font-medium hover:underline">
            Forgot Password
          </Link>
        </p>
      </div>
      
    </div>
  );
}
