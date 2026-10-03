import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SkylineBrand } from '../auth/SkylineBrand';
import { Badge } from '../ui/Badge';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  Home,
  CalendarCheck,
  PhoneCall,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

import { CustomerShell } from './CustomerShell';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If logged-in user is a customer or user is unauthenticated, render dedicated CustomerPortal Shell
  const isCustomer = Boolean(
    user?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
    String((user as any)?.role || '').toUpperCase().trim() === 'CUSTOMER'
  );
  if (isCustomer || !user) {
    return <CustomerShell>{children}</CustomerShell>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const primaryRole = user?.roles?.[0] || 'AGENT';
  const isAdmin = user?.roles?.includes('ADMIN' as any) || primaryRole === 'ADMIN';

  // Simplified Clean Workspace Navigation
  const navSections = [
    {
      title: 'Workspace',
      items: [
        {
          name: 'Overview',
          href: '/',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
          active: location.pathname === '/',
        },
        {
          name: 'Properties',
          href: '/discovery',
          icon: <Building2 className="w-4 h-4 shrink-0" />,
          active: location.pathname === '/discovery' || location.pathname === '/explore' || location.pathname.startsWith('/discovery/'),
        },
        {
          name: 'Customers',
          href: '/enquiries',
          icon: <Users className="w-4 h-4 shrink-0" />,
          active: location.pathname === '/enquiries',
        },
        {
          name: 'Leads',
          href: '/leads',
          icon: <Kanban className="w-4 h-4 shrink-0" />,
          active: location.pathname === '/leads' || location.pathname.startsWith('/leads/'),
        },
        {
          name: 'Visits',
          href: '/site-visits',
          icon: <CalendarCheck className="w-4 h-4 shrink-0" />,
          active: location.pathname === '/site-visits' || location.pathname.startsWith('/site-visits/'),
        },
        {
          name: 'Follow-ups',
          href: '/follow-ups',
          icon: <PhoneCall className="w-4 h-4 shrink-0" />,
          active: location.pathname === '/follow-ups' || location.pathname.startsWith('/follow-ups/'),
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'Management',
            items: [
              {
                name: 'Manage Properties',
                href: '/admin/properties',
                icon: <ShieldCheck className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />,
                active: location.pathname.startsWith('/admin/properties'),
              },
              {
                name: 'Projects & Units',
                href: '/inventory',
                icon: <Home className="w-4 h-4 shrink-0" />,
                active: location.pathname === '/inventory' || location.pathname === '/properties',
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0C1017] text-stone-900 dark:text-slate-100 flex flex-col font-sans relative selection:bg-stone-900 selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950 transition-colors duration-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#141A24]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-[#242F42] shadow-xs text-stone-900 dark:text-slate-100 transition-colors duration-200">
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
            <Link to="/" className="flex items-center">
              <SkylineBrand variant={resolvedTheme === 'dark' ? 'light' : 'dark'} size="sm" />
            </Link>
          </div>

          {/* Center Info / Workspace Indicator */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-stone-100/90 dark:bg-[#1A2230] border border-stone-200 dark:border-[#242F42] text-xs text-stone-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-xs" />
            <span className="font-semibold text-stone-800 dark:text-slate-200">Property Workspace</span>
            <span className="text-stone-300 dark:text-slate-600">•</span>
            <span className="text-stone-500 dark:text-slate-400 font-medium">{user?.name}</span>
          </div>

          {/* Right User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick 1-Click Theme Toggle Button */}
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

            {/* User Role Badge */}
            <div className="hidden sm:block">
              <Badge role={primaryRole} size="sm" />
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-[#1A2230] transition-colors focus:outline-none cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-[#242F42]"
                aria-expanded={isUserMenuOpen}
                aria-label="User account menu"
              >
                {/* Avatar Initials */}
                <div className="w-8 h-8 rounded-full bg-stone-800 dark:bg-amber-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 dark:text-slate-100 leading-tight">
                    {user?.name || 'User'}
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
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#141A24] border border-stone-200 dark:border-[#242F42] rounded-2xl shadow-2xl py-2 z-50 text-stone-900 dark:text-slate-100 animate-slide-up">
                    {/* User Identity */}
                    <div className="px-4 py-3 border-b border-stone-100 dark:border-[#1C2433]">
                      <p className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-stone-900 dark:text-slate-100 truncate mt-0.5">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-2">
                        <Badge role={primaryRole} size="sm" />
                      </div>
                    </div>

                    {/* Profile Metadata */}
                    <div className="px-4 py-2.5 border-b border-stone-100 dark:border-[#1C2433] text-[11px] text-stone-600 dark:text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="text-stone-900 dark:text-slate-200 font-medium">{user?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <span className="text-stone-900 dark:text-slate-200 font-medium">{primaryRole}</span>
                      </div>
                    </div>

                    {/* Interactive Theme Switcher Section */}
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

                    {/* Sign Out Button */}
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
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside
          className={`lg:w-60 shrink-0 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-3.5 shadow-xs space-y-5 sticky top-22 transition-colors duration-200">
            <div className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
                    <span>{section.title}</span>
                  </div>
                  <nav className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          item.active
                            ? 'bg-stone-900 dark:bg-amber-500/15 text-white dark:text-amber-300 font-semibold shadow-xs dark:border dark:border-amber-500/30'
                            : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 hover:bg-stone-100/80 dark:hover:bg-[#1A2230]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {item.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            {/* Sidebar Bottom: Quick Theme & Sign Out */}
            <div className="pt-2 border-t border-stone-100 dark:border-[#1C2433] space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-[#1A2230] rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-stone-600" />
                  )}
                  <span>{resolvedTheme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-slate-500">
                  {resolvedTheme}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
