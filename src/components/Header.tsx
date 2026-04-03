import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Dumbbell, Package } from 'lucide-react';
import { useState } from 'react';
import { colors } from '../utils/design-system';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

type NavLink = { label: string } & ({ to: string } | { href: string });

const navLinks: NavLink[] = [
  { to: '/shop', label: 'Shop' },
  { href: '#about', label: 'About' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: colors.gray200 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300"
              style={{ backgroundColor: colors.primary }}
            >
              <Dumbbell className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: colors.black }}
            >
              CORE<span style={{ color: colors.primary }}>FORGE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) =>
              'to' in link ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-semibold transition-colors duration-200 relative group py-2"
                  style={{ color: colors.gray700 }}
                >
                  {link.label}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: colors.primary }}
                  />
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold transition-colors duration-200 relative group py-2"
                  style={{ color: colors.gray700 }}
                >
                  {link.label}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: colors.primary }}
                  />
                </a>
              )
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              type="button"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5" style={{ color: colors.gray600 }} />
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: colors.gray600 }} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <Link
              to="/orders"
              className="hidden md:inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: colors.gray700 }}
            >
              Track order
            </Link>

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.white,
                }}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-semibold">Dashboard</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: colors.gray600 }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: colors.gray600 }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t" style={{ borderColor: colors.gray200 }}>
            <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
              {navLinks.map((link) =>
                'to' in link ? (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    style={{ color: colors.gray700 }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    style={{ color: colors.gray700 }}
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="border-t pt-4 mt-2" style={{ borderColor: colors.gray200 }}>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" style={{ color: colors.gray600 }} />
                  <span className="text-base font-semibold" style={{ color: colors.gray700 }}>
                    Search
                  </span>
                </button>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 mt-2 rounded-lg hover:bg-gray-100"
                  style={{ color: colors.gray700 }}
                >
                  <Package size={20} style={{ color: colors.gray600 }} />
                  <span className="text-base font-semibold">Track order</span>
                </Link>
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 mt-2 rounded-lg"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.white,
                    }}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-base font-semibold">Dashboard</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
