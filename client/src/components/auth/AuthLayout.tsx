import React from 'react';
import { SkylineBrand } from './SkylineBrand';
import { Building2, ShieldCheck, Users2, LineChart, KeyRound } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  badgeText,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 overflow-x-hidden">
      {/* LEFT COLUMN: Luxury Real Estate & Enterprise Brand Showcase (Hidden on small mobile, visible on desktop/tablet) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 bg-navy-950 text-white overflow-hidden bg-grid-pattern-dark border-r border-slate-800/80">
        {/* Subtle Ambient Glowing Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top Header */}
        <div className="relative z-10">
          <SkylineBrand variant="light" size="lg" />
        </div>

        {/* Center Feature Highlights */}
        <div className="relative z-10 max-w-xl my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-slate-300 text-xs font-medium mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Real Estate Operating System</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Streamline Real Estate Transactions, Teams, & Lead Conversion.
          </h1>

          <p className="text-slate-400 text-sm xl:text-base mt-4 leading-relaxed">
            Designed specifically for modern brokerages, real estate developers, and high-performing agency teams to manage customer lifecycles from initial enquiry to final closing.
          </p>

          {/* Core CRM Capabilities Matrix */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 text-brand-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Asset & Property Catalog</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Inventory tracking & specifications</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 text-emerald-400 shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Lead Pipeline & Visits</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Site visits and customer follow-ups</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 text-amber-400 shrink-0">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Sales & Finance Ledgers</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Payment receipts & commissions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 text-indigo-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Role-Based Access Control</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Admin, Employee, and Agent tiers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Compliance Indicator */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SKYLINE Enterprise Cloud • Phase 1 Online</span>
          </div>
          <div>Strict RBAC Enabled</div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Authentication Form Panel */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between bg-slate-50 min-h-screen p-6 sm:p-10 lg:p-12">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
          <SkylineBrand size="sm" />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-6 text-left">
            {badgeText && (
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-brand-50 text-brand-700 border border-brand-200 mb-2.5">
                {badgeText}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-slate-200/90 p-6 sm:p-8">
            {children}
          </div>
        </div>

        {/* Global Footer */}
        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SKYLINE CRM. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
            <span>Enterprise Security</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};
