import React from 'react';
import { SkylineBrand } from './SkylineBrand';
import { Building2, ShieldCheck, Users2, LineChart, KeyRound, Sparkles } from 'lucide-react';

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
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-950 font-sans">
      {/* 1. Full-Screen Photorealistic Real Estate Architectural Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/auth-bg.jpg"
          alt="Luxury modern residential skyscrapers at twilight blue hour"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Balanced Dark Navy & Charcoal Vignette Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-navy-950/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none" />
      </div>

      {/* 2. Top Application Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <SkylineBrand variant="light" size="md" />
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">SKYLINE Enterprise Cloud</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-medium">Real Estate OS</span>
        </div>
      </header>

      {/* 3. Main Center Content: Dual Column (Desktop) / Centered Glass Card (Mobile) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 my-auto">
        {/* Left Column: Luxury Enterprise Showcase (Visible on Large Screens) */}
        <div className="hidden lg:flex flex-col justify-center max-w-xl text-left text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/70 text-brand-300 text-xs font-semibold shadow-lg">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Next-Generation Real Estate Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Streamline Real Estate Transactions, Teams & Portfolios.
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Enterprise Customer Relationship Management designed specifically for real estate developers, brokerages, and high-performing sales agencies to accelerate conversions from enquiry to closing.
          </p>

          {/* Value Proposition Highlights */}
          <div className="grid grid-cols-2 gap-3.5 pt-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm">
              <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Project & Unit Catalog</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">Floor matrix & real-time inventory</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Customer 360 & Visits</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">Smart tour scheduling & conflict checks</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Lead Pipeline Engine</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">7-stage sales velocity tracker</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Enterprise Security</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">Strict role-based access control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column / Centered Card: Premium Glassmorphism Panel */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl p-6 sm:p-8 text-white text-left transition-all">
            {/* Header / Badge */}
            <div className="mb-5">
              {badgeText && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
                  <ShieldCheck className="w-3 h-3 text-brand-400" />
                  {badgeText}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Inner Content / Form Panel */}
            <div className="space-y-4">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* 4. Global Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/70 pt-4">
          <p>© {new Date().getFullYear()} SKYLINE CRM. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="hover:text-slate-200 transition-colors cursor-pointer">Enterprise Security</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
