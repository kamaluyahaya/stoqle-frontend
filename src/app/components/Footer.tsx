import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6"
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap gap-8">
        
        {/* Column 1 - Logo & Tagline */}
        <div className="min-w-[200px] flex-1">
          <h2 className="text-2xl font-bold">Stoqle</h2>
          <p className="mt-2 text-sm">
            Powering businesses with tools for POS, inventory, and vendor management.
          </p>
          <p className="mt-2 text-sm italic">"Manage smarter, sell faster."</p>
        </div>

        {/* Column 2 - Platform */}
        <div className="min-w-[180px] flex-1">
          <h3 className="font-semibold mb-3">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/vendors">Vendors</Link></li>
          </ul>
        </div>

        {/* Column 3 - Help & Support */}
        <div className="min-w-[180px] flex-1">
          <h3 className="font-semibold mb-3">Help & Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#">Help Center</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="#">Contact Support</Link></li>
          </ul>
        </div>

        {/* Column 4 - For Businesses / Vendors */}
        <div className="min-w-[180px] flex-1">
          <h3 className="font-semibold mb-3">Users</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/create-account">How to create account</Link></li>
            <li><Link href="/login">Vendor Dashboard Login</Link></li>
            <li><Link href="/vendor-guidelines">Vendor Guidelines</Link></li>
            <li><Link href="/pos-setup">POS Setup Guide</Link></li>
            <li><a href="/how-to-buy" className="hover:text-white">How to Buy Products</a></li>
          </ul>
        </div>

        {/* Column 5 - Company Info */}
        <div className="min-w-[180px] flex-1">
          <h3 className="font-semibold mb-3">Company Info</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about-us">About Us</Link></li>
            <li>Careers (Coming Soon)</li>
            <li><Link href="/terms-of-service">Terms of Service</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/cookie-policy">Cookie Policy</Link></li>
          </ul>
        </div>

       
       
      </div>

      {/* Bottom Strip */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-col sm:flex-row justify-around items-center text-sm">
          <p>© {new Date().getFullYear()} Stoqle. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <Link href="#" aria-label="Facebook"><Facebook size={18} /></Link>
            <Link href="#" aria-label="Twitter"><FaXTwitter size={18} /></Link>
            <Link href="#" aria-label="Instagram"><Instagram size={18} /></Link>
            <Link href="#" aria-label="LinkedIn"><Linkedin size={18} /></Link>
            <Link href="#" aria-label="YouTube"><Youtube size={18} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
