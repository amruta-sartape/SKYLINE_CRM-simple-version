import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
                icon: <ShieldCheck className="w-4 h-4 shrink-0 text-amber-700" />,
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
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 flex flex-col font-sans relative selection:bg-stone-900 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs text-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center">
              <SkylineBrand variant="dark" size="sm" />
            </Link>
          </div>

          {/* Center Info / Workspace Indicator */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-stone-100/90 border border-stone-200 text-xs text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold text-stone-800">Property Workspace</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 font-medium">{user?.name}</span>
          </div>

          {/* Right User & Actions */}
          <div className="flex items-center gap-3">
            {/* User Role Badge */}
            <div className="hidden sm:block">
              <Badge role={primaryRole} size="sm" />
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-stone-100 transition-colors focus:outline-none cursor-pointer"
                aria-expanded={isUserMenuOpen}
                aria-label="User account menu"
              >
                {/* Avatar Initials */}
                <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[11px] text-stone-500 leading-tight truncate max-w-[130px]">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 text-stone-900 animate-slide-up">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-stone-900 truncate mt-0.5">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <div className="mt-2">
                        <Badge role={primaryRole} size="sm" />
                      </div>
                    </div>

                    <div className="px-4 py-2.5 border-b border-stone-100 text-[11px] text-stone-600 space-y-1">
                      <div>
                        Phone: <span className="text-stone-900 font-medium">{user?.phone || 'N/A'}</span>
                      </div>
                      <div>
                        Role: <span className="text-stone-900 font-medium">{primaryRole}</span>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-xs space-y-5 sticky top-22">
            <div className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
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
                            ? 'bg-stone-900 text-white font-semibold shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
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

            {/* Clean Sign Out in Sidebar */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
