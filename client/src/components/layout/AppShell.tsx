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
  TrendingUp,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Lock,
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

  // Navigation Items
  const navItems = [
    {
      name: 'Client Enquiries',
      href: '/enquiries',
      icon: <MessageSquare className="w-4 h-4" />,
      active: location.pathname === '/enquiries',
      status: 'Active',
    },
    {
      name: 'Leads Management',
      href: '/leads',
      icon: <Users className="w-4 h-4" />,
      active:
        location.pathname === '/leads' ||
        (location.pathname.startsWith('/leads/') && location.pathname !== '/leads/pipeline'),
      status: 'Active',
    },
    {
      name: 'Lead Pipeline',
      href: '/leads/pipeline',
      icon: <Kanban className="w-4 h-4" />,
      active: location.pathname === '/leads/pipeline',
      status: 'Active',
    },
    {
      name: 'Site Visits & Tours',
      href: '/site-visits',
      icon: <CalendarCheck className="w-4 h-4" />,
      active: location.pathname === '/site-visits' || location.pathname.startsWith('/site-visits/'),
      status: 'Active',
    },
    {
      name: 'Follow-Up Tasks',
      href: '/follow-ups',
      icon: <PhoneCall className="w-4 h-4" />,
      active: location.pathname === '/follow-ups' || location.pathname.startsWith('/follow-ups/'),
      status: 'Active',
    },
    {
      name: 'Projects Master',
      href: '/properties',
      icon: <Building2 className="w-4 h-4" />,
      active: location.pathname === '/properties',
      status: 'Active',
    },
    {
      name: 'Property Inventory',
      href: '/inventory',
      icon: <Home className="w-4 h-4" />,
      active: location.pathname === '/inventory' || location.pathname.startsWith('/inventory/'),
      status: 'Active',
    },
    {
      name: 'Auth & RBAC Console',
      href: '/',
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: location.pathname === '/',
      status: 'Active',
    },
    {
      name: 'Deals & Sales Pipeline',
      href: '#sales',
      icon: <TrendingUp className="w-4 h-4" />,
      locked: true,
      status: 'Phase 5',
    },
    {
      name: 'Finance & Payments',
      href: '#finance',
      icon: <CreditCard className="w-4 h-4" />,
      locked: true,
      status: 'Phase 6',
    },
    {
      name: 'Reports & Analytics',
      href: '#reports',
      icon: <BarChart3 className="w-4 h-4" />,
      locked: true,
      status: 'Phase 9',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/enquiries" className="flex items-center">
              <SkylineBrand size="sm" />
            </Link>
          </div>

          {/* Center Info / Phase Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">SKYLINE Real Estate CRM</span>
            <span>•</span>
            <span className="text-brand-700 font-medium">Phase 4 Active</span>
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
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                aria-expanded={isUserMenuOpen}
              >
                {/* Avatar Initials */}
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">
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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2">
                        <Badge role={primaryRole} size="sm" />
                      </div>
                    </div>

                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <div className="px-2 py-1 text-[11px] text-slate-500">
                        Phone: <span className="text-slate-800 font-medium">{user?.phone || 'N/A'}</span>
                      </div>
                      <div className="px-2 py-1 text-[11px] text-slate-500">
                        Account ID: <span className="font-mono text-[10px] text-slate-700">{user?.id}</span>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside
          className={`lg:w-64 shrink-0 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle space-y-4">
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                CRM Modules
              </div>
              <nav className="mt-2 space-y-1">
                {navItems.map((item) =>
                  item.locked ? (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 cursor-not-allowed opacity-75"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                        <Lock className="w-3 h-3" />
                        <span>{item.status}</span>
                      </span>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {item.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </Link>
                  )
                )}
              </nav>
            </div>

            {/* Status Information Box */}
            <div className="p-3 rounded-lg bg-brand-50/70 border border-brand-100 text-left">
              <div className="flex items-center gap-1.5 text-brand-900 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Phase 4 Live</span>
              </div>
              <p className="text-[11px] text-brand-800/80 mt-1 leading-relaxed">
                Site Visit scheduling & conflict engine, Follow-Up tracking, and Customer 360 are active.
              </p>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200"
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
