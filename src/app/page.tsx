import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import VendorFeatures from "./components/VendorFeatures";
import FeaturedVendors from "./components/FeaturedVendors";
import BenefitsSection from "./components/BenefitsSection";
import FeaturedProducts from "./components/featuredProduct";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />
    
      <HeroSection />



      <VendorFeatures />
      
      {/* <FeaturedProducts /> */}



      <BenefitsSection />  

      {/* <FeaturedVendors /> */}
    

      <Footer />

      
    </div>
  );
}
