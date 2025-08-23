import Link from "next/link"
import { ArrowLeft, Store } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h1>
        <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist or may have been removed.</p>
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </Link>
      </div>
    </div>
  )
}
