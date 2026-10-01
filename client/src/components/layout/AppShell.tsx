import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SkylineBrand } from '../auth/SkylineBrand';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  MessageSquare,
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
  Sparkles,
  Compass,
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

  // Grouped Navigation Items matching actual supported CRM modules
  const navSections = [
    {
      title: 'Executive',
      items: [
        {
          name: 'Executive Dashboard',
          href: '/',
          icon: <LayoutDashboard className="w-4 h-4" />,
          active: location.pathname === '/',
        },
      ],
    },
    {
      title: 'Real Estate Portfolio',
      items: [
        {
          name: 'Property Discovery',
          href: '/discovery',
          icon: <Compass className="w-4 h-4" />,
          active: location.pathname === '/discovery' || location.pathname === '/explore',
        },
        ...(isAdmin
          ? [
              {
                name: 'Property Master (Admin)',
                href: '/admin/properties',
                icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
                active: location.pathname.startsWith('/admin/properties'),
              },
            ]
          : []),
        {
          name: 'Projects Master',
          href: '/properties',
          icon: <Building2 className="w-4 h-4" />,
          active: location.pathname === '/properties',
        },
        {
          name: 'Property Inventory',
          href: '/inventory',
          icon: <Home className="w-4 h-4" />,
          active: location.pathname === '/inventory' || location.pathname.startsWith('/inventory/'),
        },
      ],
    },
    {
      title: 'Lead Pipeline',
      items: [
        {
          name: 'Client Enquiries',
          href: '/enquiries',
          icon: <MessageSquare className="w-4 h-4" />,
          active: location.pathname === '/enquiries',
        },
        {
          name: 'Leads Management',
          href: '/leads',
          icon: <Users className="w-4 h-4" />,
          active:
            location.pathname === '/leads' ||
            (location.pathname.startsWith('/leads/') && location.pathname !== '/leads/pipeline'),
        },
        {
          name: 'Pipeline Board',
          href: '/leads/pipeline',
          icon: <Kanban className="w-4 h-4" />,
          active: location.pathname === '/leads/pipeline',
        },
      ],
    },
    {
      title: 'Site Operations',
      items: [
        {
          name: 'Site Visits & Tours',
          href: '/site-visits',
          icon: <CalendarCheck className="w-4 h-4" />,
          active: location.pathname === '/site-visits' || location.pathname.startsWith('/site-visits/'),
        },
        {
          name: 'Follow-Up Tasks',
          href: '/follow-ups',
          icon: <PhoneCall className="w-4 h-4" />,
          active: location.pathname === '/follow-ups' || location.pathname.startsWith('/follow-ups/'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-brand-500 selection:text-white">
      {/* Background Architectural Ambient Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <img
          src="/images/auth-bg.jpg"
          alt="Architectural Ambient"
          className="w-full h-full object-cover object-center filter blur-sm"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
      </div>

      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center">
              <SkylineBrand variant="light" size="sm" />
            </Link>
          </div>

          {/* Center Info / Phase Status */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide">SKYLINE Real Estate CRM</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-medium">Enterprise Suite Active</span>
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
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                aria-expanded={isUserMenuOpen}
              >
                {/* Avatar Initials */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 text-white animate-slide-up">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-2">
                        <Badge role={primaryRole} size="sm" />
                      </div>
                    </div>

                    <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div>
                        Phone: <span className="text-white font-medium">{user?.phone || 'N/A'}</span>
                      </div>
                      <div>
                        Account ID: <span className="font-mono text-[10px] text-slate-300">{user?.id}</span>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Skyline CRM</span>
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
          className={`lg:w-64 shrink-0 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-2xl border border-slate-800/90 p-4 shadow-xl space-y-5 sticky top-22">
            <div className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
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
                            ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white font-bold shadow-md shadow-brand-600/20'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {item.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-400" />
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            {/* Status Information Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Real Estate OS Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Live inventory tracking, site tour scheduler, lead qualification & Customer 360 are operational.
              </p>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border-slate-700/80 bg-slate-900/50"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
