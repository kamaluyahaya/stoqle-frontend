'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams, useRouter } from 'next/navigation';
import {
  LogOut, X, Home, ShoppingCart, Package, Layers, Settings, Users,
  MessageSquare, User, ChevronDown, ChevronRight, BookOpen, Ticket,
  FileText, BarChart2, Store
} from 'lucide-react';
import ConfirmDialog from '../forms/dialog/dialogForm';
import { toast } from 'sonner';

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type User = {
  full_name: string;
  email: string;
  phone: string,
  role: string;
  profile_image: string;
  business_name: string;
  business_slug?: string;
};

type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pathname = usePathname();
  const params = useParams<{ business_slug?: string }>();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const businessSlug = params?.business_slug ?? user?.business_slug ?? '';

  const withSlug = (path: string) => {
    const clean = path.startsWith('/') ? path : `/${path}`;
    return businessSlug ? `/${businessSlug}${clean}` : clean;
  };

  const isActive = (path: string) => {
    const target = withSlug(path);
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  const menuItems: NavItem[] = useMemo(() => ([
    { name: 'Dashboard',    path: '/dashboard',    icon: Home },
    { name: 'Point Of Sale',path: '/pos',          icon: ShoppingCart },
    { name: 'Products',     path: '/products',     icon: Package },
    { name: 'Inventory Control',    path: '/inventory',    icon: Layers },
    { name: 'Book Keeping', path: '/book-keeping', icon: BookOpen },
    { name: 'Customer',     path: '/customer',     icon: Users },
    { name: 'Tickets',      path: '/tickets',      icon: Ticket },
    { name: 'Invoice',      path: '/invoice',      icon: FileText },
    { name: 'Online Store', path: '/online-store', icon: Store },
    { name: 'Insights',     path: '/insights',     icon: BarChart2 },
    { name: 'Online Order',     path: '/order',     icon: MessageSquare },
    { name: 'Business',      path: '/business',      icon: User },
  ]), []);

  const settingsItems = [
    { name: 'Staff',       path: '/settings/staff' },
    { name: 'Password',    path: '/settings/password' },
  ];

  // Role-based filtering: owner sees everything.
  // inventory manager: hide Point Of Sale, Invoice, Tickets, Online Order (and Staff in settings)
  // sales staff: hide Inventory Control, Products (and Staff in settings)
  const filteredMenuItems = useMemo(() => {
    if (!user) return menuItems;
    const roleNorm = (user.role || '').toLowerCase().trim();

    // if they're owner (or admin) show everything
    if (roleNorm.includes('owner') || roleNorm === 'admin') return menuItems;

    // Determine role type by keywords so small variations still work
    const isInventoryManager = roleNorm.includes('inventory') || roleNorm.includes('inventory manager');
    const isSalesStaff = roleNorm.includes('sales') || roleNorm.includes('sales staff') || roleNorm.includes('salesperson') || roleNorm.includes('seller');

    let hidden: string[] = [];
    if (isInventoryManager) {
      hidden = ['Point Of Sale', 'Invoice', 'Tickets', 'Online Order'];
    }

    if (isSalesStaff) {
      // If somehow both flags are true, combine hidden sets
      hidden = hidden.concat(['Inventory Control', 'Products']);
    }

    // If no special role matched, return menu as-is (default safer choice)
    if (hidden.length === 0) return menuItems;

    const setHidden = new Set(hidden);
    return menuItems.filter(item => !setHidden.has(item.name));
  }, [user, menuItems]);

  const filteredSettingsItems = useMemo(() => {
    if (!user) return settingsItems;
    const roleNorm = (user.role || '').toLowerCase().trim();
    const isInventoryManager = roleNorm.includes('inventory') || roleNorm.includes('inventory manager');
    const isSalesStaff = roleNorm.includes('sales') || roleNorm.includes('sales staff');

    // Both inventory manager and sales staff should NOT see Staff settings
    if (isInventoryManager || isSalesStaff) {
      return settingsItems.filter(s => s.name !== 'Staff');
    }
    return settingsItems;
  }, [user]);

  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      toast.success('Logout successful — see you soon 👋');
      await new Promise(res => setTimeout(res, 250));
      router.push('/');
    } catch (err) {
      console.error('Logout error', err);
      toast.error('Could not log out. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <>
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 pointer-events-auto ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
        style={{ backdropFilter: isOpen ? 'blur(8px)' : 'none' }}
      >
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]`} />
      </div>

      <ConfirmDialog
        show={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Log out?"
        message="You will be signed out from your account."
        confirmText="Logout"
        loading={loggingOut}
      />

      <aside
        className={`fixed left-0 top-0 w-64 h-screen flex flex-col justify-between z-40 transform transition-transform duration-300 
          backdrop-blur-lg bg-white/70 shadow-lg border-r border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <button
          className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="p-5  border-gray-200 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-blue-600 font-semibold shadow-sm">
              {user?.business_name?.charAt(0).toUpperCase() || 'B'}
            </div>
            <span
              className="text-lg sm:text-xl font-semibold tracking-tight font-[SF Pro Text] text-blue-500 truncate max-w-[140px] sm:max-w-[200px] md:max-w-[180px] lg:max-w-[220px] xl:max-w-[260px]"
              title={user?.business_name}
            >
              {user?.business_name}
            </span>
          </div>
        </div>

        <nav className="mt-4 px-3 flex-1 overflow-y-auto text-sm font-[SF Pro Text]">
          {filteredMenuItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={withSlug(item.path)}
                onClick={() => {
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.name}
              </Link>
            );
          })}

          <div className="mt-3">
            <button
              onClick={() => setSettingsOpen(prev => !prev)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <span className="flex items-center gap-3">
                <Settings size={18} strokeWidth={1.5} />
                Settings
              </span>
              {settingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {settingsOpen && (
              <div className="mt-1 ml-6 flex flex-col gap-1">
                {filteredSettingsItems.map(sub => {
                  const active = isActive(sub.path);
                  return (
                    <Link
                      key={sub.path}
                      href={withSlug(sub.path)}
                      className={`block px-3 py-2 rounded-lg transition ${
                        active
                          ? 'bg-gray-900 text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}

                <button
                  onClick={() => setShowLogoutDialog(true)}
                  disabled={loggingOut}
                  className={`text-left block px-3 py-2 rounded-lg transition ${
                    loggingOut
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t p-4 bg-white/60">
          {user && (
            <div className="flex items-center gap-3">
              <Image
                src={
                  user.profile_image?.trim()
                    ? user.profile_image
                    : '/avatar.jpg'
                }
                alt={user.full_name || 'User Avatar'}
                width={42}
                height={42}
                className="rounded-full object-cover shadow-sm"
              />
              <div className="text-sm font-[SF Pro Text]">
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-gray-500 text-xs">{user.role}</p>
                <p className="text-gray-400 text-xs truncate w-32">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowLogoutDialog(true)}
            disabled={loggingOut}
            className="mt-3 flex items-center gap-2 text-red-500 text-sm hover:text-red-600 transition"
          >
            <LogOut size={16} strokeWidth={1.5} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
