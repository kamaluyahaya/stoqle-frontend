import Navbar from "@/components/Navbar";
import { setupStoreData } from "@/data/officialContent";

export default function SetupStorePage() {
  return (
    <>

    <Navbar />

    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-20 px-6 text-center">
        <img
          src="/images/store_open.png"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{setupStoreData.title}</h1>
          <p className="text-md">{setupStoreData.introduction}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-10">
        {setupStoreData.steps.map((step, index) => (
          <div key={index} className="bg-white rounded-2xl shadow p-6 transform transition-transform duration-300 hover:-translate-y-2">
            <h2 className="text-xl font-semibold mb-3">{step.title}</h2>
            <p className="text-md text-gray-700">{step.body}</p>
          </div>
        ))}

        
      </div>
    </div>
    </>
  );
}
