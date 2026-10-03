import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { SkylineBrand } from '../auth/SkylineBrand';
import {
  Home,
  Building2,
  Heart,
  MessageSquareText,
  CalendarCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

interface CustomerShellProps {
  children: React.ReactNode;
}

export const CustomerShell: React.FC<CustomerShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { savedCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/customer/login');
  };

  const isCustomer = Boolean(
    user?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
    String((user as any)?.role || '').toUpperCase().trim() === 'CUSTOMER'
  );
  const homeRoute = isCustomer ? '/customer' : user ? '/' : '/discovery';

  const navLinks = [
    {
      name: 'Home',
      to: homeRoute,
      icon: <Home className="w-4 h-4 shrink-0" />,
      active:
        location.pathname === '/customer' ||
        location.pathname === '/customer/home' ||
        (Boolean(isCustomer) && location.pathname === '/'),
    },
    {
      name: 'Properties',
      to: '/discovery',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
      active:
        location.pathname === '/discovery' ||
        location.pathname === '/explore' ||
        location.pathname.startsWith('/discovery/') ||
        location.pathname.startsWith('/explore/'),
    },
    {
      name: 'Wishlist',
      to: '/wishlist',
      icon: <Heart className="w-4 h-4 shrink-0" />,
      active: location.pathname === '/wishlist' || location.pathname === '/customer/wishlist',
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      name: 'My Enquiries',
      to: '/my-enquiries',
      icon: <MessageSquareText className="w-4 h-4 shrink-0" />,
      active: location.pathname === '/my-enquiries' || location.pathname === '/customer/enquiries',
    },
    {
      name: 'My Site Visits',
      to: '/my-site-visits',
      icon: <CalendarCheck className="w-4 h-4 shrink-0" />,
      active: location.pathname === '/my-site-visits' || location.pathname === '/customer/site-visits',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0C1017] text-stone-900 dark:text-slate-100 flex flex-col font-sans relative selection:bg-stone-900 selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950 transition-colors duration-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#141A24]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#242F42] shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-[#1A2230] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to={homeRoute} className="flex items-center">
              <SkylineBrand variant={resolvedTheme === 'dark' ? 'light' : 'dark'} size="sm" />
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  item.active
                    ? 'bg-stone-900 dark:bg-amber-500/15 text-white dark:text-amber-300 shadow-xs dark:border dark:border-amber-500/30'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-950 dark:hover:text-slate-100 hover:bg-stone-100/80 dark:hover:bg-[#1A2230]'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.active
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1-Click Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-[#1A2230] border border-transparent hover:border-stone-200 dark:hover:border-[#242F42] transition-all cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle light/dark theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 animate-fade-in" />
              )}
            </button>

            {/* Customer Role Badge */}
            <div className="hidden sm:block">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                {user ? 'Customer Portal' : 'Property Discovery'}
              </span>
            </div>

            {/* User Dropdown or Guest Sign In */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-[#1A2230] transition-colors focus:outline-none cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-[#242F42]"
                  aria-expanded={isUserMenuOpen}
                  aria-label="User account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-stone-800 dark:bg-amber-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user?.name?.charAt(0) || 'C'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-900 dark:text-slate-100 leading-tight">
                      {user?.name || 'Customer'}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-slate-400 leading-tight truncate max-w-[130px]">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#141A24] border border-stone-200 dark:border-[#242F42] rounded-2xl shadow-2xl py-2 z-50 text-stone-900 dark:text-slate-100 animate-slide-up">
                      <div className="px-4 py-3 border-b border-stone-100 dark:border-[#1C2433]">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-xs font-bold text-stone-900 dark:text-slate-100 truncate mt-0.5">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <div className="px-4 py-2.5 border-b border-stone-100 dark:border-[#1C2433] text-[11px] text-stone-600 dark:text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="text-stone-900 dark:text-slate-200 font-medium">
                            {user?.phone || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account:</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            Verified Client
                          </span>
                        </div>
                      </div>

                      {/* Appearance Switcher */}
                      <div className="px-4 py-3 border-b border-stone-100 dark:border-[#1C2433] space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                          <span>Appearance</span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold lowercase">
                            ({resolvedTheme})
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42]">
                          <button
                            type="button"
                            onClick={() => setTheme('light')}
                            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              theme === 'light'
                                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5 mb-0.5 text-amber-600" />
                            <span className="text-[10px]">Light</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              theme === 'dark'
                                ? 'bg-[#1A2230] text-amber-300 shadow-xs border border-amber-500/30'
                                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                            <span className="text-[10px]">Dark</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTheme('system')}
                            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              theme === 'system'
                                ? 'bg-white dark:bg-[#1A2230] text-stone-900 dark:text-slate-100 shadow-xs border border-stone-200/80 dark:border-[#242F42]'
                                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <Monitor className="w-3.5 h-3.5 mb-0.5 text-blue-500" />
                            <span className="text-[10px]">System</span>
                          </button>
                        </div>
                      </div>

                      {/* Sign Out */}
                      <div className="p-1.5">
                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/customer/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-slate-200 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-[#1A2230] hover:bg-stone-200 dark:hover:bg-slate-800 border border-stone-200/80 dark:border-[#242F42] transition-colors shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/customer/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/80 dark:border-[#242F42] bg-white dark:bg-[#141A24] px-4 pt-3 pb-5 space-y-2 animate-slide-up">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  item.active
                    ? 'bg-stone-900 dark:bg-amber-500/15 text-white dark:text-amber-300'
                    : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-[#1A2230]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-stone-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-stone-100 dark:border-[#242F42] flex items-center justify-between">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-slate-400 py-2 px-3 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1A2230]"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-600" />
                )}
                <span>Toggle Theme</span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 py-2 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/customer/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-semibold text-stone-800 dark:text-slate-200 px-3 py-1.5 bg-stone-100 dark:bg-[#1A2230] rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/customer/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-semibold text-white dark:text-slate-950 px-3 py-1.5 bg-stone-900 dark:bg-amber-500 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>

      {/* Customer Footer */}
      <footer className="mt-16 bg-white dark:bg-[#101622] border-t border-stone-200/80 dark:border-[#242F42] py-8 text-stone-600 dark:text-slate-400 text-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <SkylineBrand variant={resolvedTheme === 'dark' ? 'light' : 'dark'} size="sm" />
            <span className="text-stone-300 dark:text-slate-700">|</span>
            <span className="text-[11px] text-stone-500 dark:text-slate-400">
              Premium Real Estate Discovery Experience
            </span>
          </div>

          <div className="flex items-center gap-6 text-stone-600 dark:text-slate-400">
            <Link to={homeRoute} className="hover:text-stone-900 dark:hover:text-slate-200">
              Home
            </Link>
            <Link to="/discovery" className="hover:text-stone-900 dark:hover:text-slate-200">
              Properties
            </Link>
            <Link to="/wishlist" className="hover:text-stone-900 dark:hover:text-slate-200">
              Wishlist
            </Link>
            <Link to="/my-enquiries" className="hover:text-stone-900 dark:hover:text-slate-200">
              Enquiries
            </Link>
            <Link to="/my-site-visits" className="hover:text-stone-900 dark:hover:text-slate-200">
              Visits
            </Link>
          </div>

          <p className="text-[11px] text-stone-400 dark:text-slate-600">
            © 2026 SKYLINE Real Estate Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
