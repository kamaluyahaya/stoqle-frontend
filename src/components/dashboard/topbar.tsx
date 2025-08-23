'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';

type TopbarProps = {
  onMenuClick: () => void;
};

type User = {
  full_name: string;
  role: string;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-lg z-50 shadow-sm">
      {/* Left Section with Hamburger + Search */}
      <div className="flex items-center gap-4 w-full max-w-md">
        {/* Hamburger Button */}
        <button
          className="md:hidden text-gray-700 hover:text-gray-900 transition-colors duration-200"
          onClick={onMenuClick}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 w-full bg-gray-100 rounded-full px-3 py-1.5 shadow-inner">
  <Search className="text-gray-400" size={18} />
  <input
    type="text"
    placeholder="Search..."
    className="w-full bg-transparent border-none outline-none text-sm font-[SF Pro Text]"
  />
</div>
      </div>

      {/* Notification and User Info */}
      <div className="flex items-center gap-6">
        <button className="relative hover:scale-105 transition-transform duration-150">
          <Bell className="text-gray-500 hover:text-gray-700" size={20} strokeWidth={1.5} />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        {user && (
          <div className="flex flex-col flex-grow text-sm text-gray-700 font-[SF Pro Text] min-w-0">
  <p className="font-semibold leading-tight truncate">{user.full_name}</p>
  <p className="text-xs text-gray-500 truncate">{user.role}</p>
</div>
        )}
      </div>
    </header>
  );
}
