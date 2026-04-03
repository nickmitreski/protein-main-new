import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Link2,
} from 'lucide-react';
import { colors } from '../../utils/design-system';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'payment-links', label: 'Payment links', icon: Link2, path: '/admin/payment-links' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

function SidebarContent({
  onClose,
  user,
  currentPath,
  onSignOut,
}: {
  onClose: () => void;
  user: { email: string; role: string } | null;
  currentPath: string;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="p-6 border-b" style={{ borderColor: colors.lightGrey }}>
        <Link
          to="/admin"
          className="text-2xl font-bold uppercase tracking-widest"
          style={{ color: colors.black }}
          onClick={onClose}
        >
          CORE<span style={{ color: colors.red }}>FORGE</span>
        </Link>
        <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: colors.gray500 }}>
          Admin Dashboard
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? currentPath === '/admin'
                : currentPath.startsWith(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 transition-all ${
                    isActive ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#EDEDED]'
                  }`}
                  style={{ color: isActive ? '#fff' : colors.darkGrey }}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t" style={{ borderColor: colors.lightGrey }}>
        <div className="mb-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider truncate"
            style={{ color: colors.darkGrey }}
          >
            {user?.email}
          </p>
          <p className="text-xs uppercase tracking-wider" style={{ color: colors.gray500 }}>
            {user?.role}
          </p>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-[#EDEDED] transition-all text-sm font-medium uppercase tracking-wider"
          style={{ color: colors.darkGrey }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex w-64 min-h-screen border-r flex-col flex-shrink-0"
        style={{ borderColor: colors.lightGrey }}
      >
        <SidebarContent
          onClose={() => {}}
          user={user}
          currentPath={location.pathname}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white border-r flex flex-col transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderColor: colors.lightGrey }}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1"
          style={{ color: colors.gray500 }}
        >
          <X size={20} />
        </button>
        <SidebarContent
          onClose={() => setSidebarOpen(false)}
          user={user}
          currentPath={location.pathname}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Mobile Top Bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-30"
          style={{ borderColor: colors.lightGrey }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: colors.darkGrey }}>
            <Menu size={22} />
          </button>
          <span
            className="text-lg font-bold uppercase tracking-widest"
            style={{ color: colors.black }}
          >
            CORE<span style={{ color: colors.red }}>FORGE</span>
          </span>
          <div className="w-6" />
        </header>

        <main className="flex-1 bg-[#FAFAFA]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
