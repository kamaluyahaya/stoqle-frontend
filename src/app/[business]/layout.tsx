'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Topbar from '@/components/dashboard/topbar';
import Sidebar from '@/components/dashboard/sidebar';
import useNetworkWatcher from '@/hooks/useNetworkWatcher'; // ✅ Import the hook

export default function DashboardLayot({ children }: { children: ReactNode }) {
  useNetworkWatcher(); // ✅ Safe to use here since this is a client component

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          md:ml-64`}
      >
        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Main */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
