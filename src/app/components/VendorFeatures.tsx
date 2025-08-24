// components/VendorFeatures.tsx
import { Store, Users, DollarSign, BarChart3, Package } from "lucide-react";

export default function VendorFeatures() {

    const features = [
    {
        icon: <Package size={36} />,
        title: "Wide Product Selection",
        description: "Browse thousands of products across multiple categories all in one place.",
    },
    {
        icon: <DollarSign size={36} />,
        title: "Best Prices & Deals",
        description: "Enjoy competitive prices and exclusive discounts from trusted sellers.",
    },
    {
        icon: <Users size={36} />,
        title: "Trusted Vendors",
        description: "Shop confidently with verified sellers and reliable customer support.",
    },
    {
        icon: <Store size={36} />,
        title: "Seamless Shopping Experience",
        description: "From search to checkout, we make your shopping journey easy and fast.",
    },
 
    ];

  return (
    <main>
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">

          <div className="mx-7xl">
  <h1 className=" p-10 text-4xl sm:text-6xl font-bold text-gray-900 px-4 sm:px-0">
    What We <span className="text-blue-500"> Offer</span>
  </h1>
</div>


            
          <div className="mx-8 lg:mx-0 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white py-7 px-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-50"
              >
                <div className="bg-blue-50 w-14 h-14 rounded-full p-2 flex items-center justify-center text-blue-400 mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-md font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
