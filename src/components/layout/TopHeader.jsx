import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Shield,
  RotateCcw,
  User,
  ChevronDown,
  Building,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export const TopHeader = ({ onToggleMobile, activeTabName }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { resetToSampleData } = useData();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const roleRef = useRef(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetData = () => {
    resetToSampleData();
    addToast('Sample CRM records reset to default state.', 'info');
  };

  const notifications = [
    {
      id: 1,
      title: 'New Site Visit Scheduled',
      time: '12m ago',
      desc: 'Claire Dupont for Skyline Grandeur Penthouse.'
    },
    {
      id: 2,
      title: 'Booking Advance Received',
      time: '1h ago',
      desc: '$35,000 received for Unit 804 (Skyline Heights).'
    },
    {
      id: 3,
      title: 'Vendor Payment Settled',
      time: '3h ago',
      desc: 'Titan Steel Supplies invoice TS-88491 paid.'
    }
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs transition-colors duration-150">
      {/* Left Area: Mobile Toggle & Page Title Indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Building className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Skyline CRM Enterprise</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">{activeTabName || 'Overview'}</span>
        </div>
      </div>

      {/* Right Area: Theme Toggle, Role Selector, Notifications, User Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-amber-400 dark:hover:bg-slate-800 dark:hover:text-amber-300 transition-all cursor-pointer flex items-center justify-center border border-transparent dark:border-slate-700/60"
          aria-label="Toggle dark/light mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 animate-fadeIn" />
          )}
        </button>

        {/* Quick Role Switcher Pill for College Demo / Grading */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
            title="Switch Active CRM Role for quick demo"
          >
            <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-brand-700 dark:text-brand-300 underline underline-offset-2">{currentUser?.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Switch Active CRM Role
              </div>
              {['Admin', 'Employee', 'Agent'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsRoleMenuOpen(false);
                    addToast(`Switched active view to ${r} Dashboard.`, 'info');
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser?.role === r
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{r} View</span>
                  {currentUser?.role === r && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Sample Data Button */}
        <button
          onClick={handleResetData}
          title="Reset Demo Records"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Sample Data</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors relative cursor-pointer"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white">CRM Notifications</span>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60 py-1 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-brand-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                {currentUser?.department || currentUser?.role}
              </div>
            </div>
            <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {currentUser?.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <Shield className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  <span>{currentUser?.role} Role</span>
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    addToast('Logged out of Skyline CRM successfully.', 'info');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
