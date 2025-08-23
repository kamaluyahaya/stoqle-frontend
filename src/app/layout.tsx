// src/app/layout.tsx
import "../styles/globals.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});


export const metadata = {
  
  title: "Stoqle | Smart Inventory & POS System for Modern Businesses",
  description:
    "Stoqle is a powerful, cloud-based business platform that combines inventory management, point-of-sale (POS), and analytics to help businesses track stock, process sales, and grow effortlessly.",
  keywords: [
    "Stoqle",
    "inventory management software",
    "POS system",
    "business management platform",
    "sales tracking",
    "stock management",
    "retail POS",
    "cloud POS",
    "small business tools",
  ],
  icons: {
    icon: "/stoqle.png",
  },
  openGraph: {
    title: "Stoqle | Smart Inventory & POS System",
    description:
      "Manage inventory, process sales, and grow your business with Stoqle — the all-in-one POS and inventory solution.",
    url: "https://stoqle.com",
    siteName: "Stoqle",
    images: [
      {
        url: "/stoqle-og-image.png",
        width: 1200,
        height: 630,
        alt: "Stoqle Platform Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stoqle | Smart Inventory & POS System",
    description:
      "All-in-one POS and inventory software to help businesses sell smarter and manage stock easily.",
    images: ["/stoqle-og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
            {/* <body   */}
      <body suppressHydrationWarning className={inter.className}>
        <Toaster richColors position="top-right" />
        {children}

      </body>
    </html>
  );
}
