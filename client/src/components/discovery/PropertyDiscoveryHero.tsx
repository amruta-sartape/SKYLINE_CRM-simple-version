import React from 'react';
import { Sparkles, ShieldCheck, Building2, MapPin } from 'lucide-react';

interface PropertyDiscoveryHeroProps {
  totalCount: number;
}

export const PropertyDiscoveryHero: React.FC<PropertyDiscoveryHeroProps> = ({ totalCount }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-[#101622] dark:via-[#141A24] dark:to-[#1A2230] rounded-2xl border border-slate-200/90 dark:border-[#242F42] p-6 sm:p-8 shadow-xs relative overflow-hidden text-left">
      {/* Subtle decorative background pattern */}
      <div className="absolute top-0 right-0 w-96 h-full bg-radial from-blue-100/30 dark:from-blue-900/20 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Heading and Supporting Text */}
        <div className="max-w-2xl space-y-3">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50 text-xs font-semibold text-blue-800 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>SKYLINE Real Estate Portfolio</span>
            <span className="text-blue-300 dark:text-blue-700">•</span>
            <span className="text-blue-900 dark:text-blue-200 font-bold">{totalCount} Verified Properties</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans leading-tight">
            Discover Your Dream Property
          </h1>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Explore residential, commercial and investment properties across prime locations.
            Browse verified listings with transparent pricing and comprehensive specifications.
          </p>

          {/* Value Badges */}
          <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              RERA Verified
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              19 Property Types
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Prime Metro Corridors
            </span>
          </div>
        </div>

        {/* Right: Realistic Warm Real-Estate Visual Card */}
        <div className="hidden lg:block shrink-0 w-80 xl:w-96">
          <div className="relative rounded-xl overflow-hidden border border-slate-200/90 dark:border-[#242F42] shadow-sm bg-white dark:bg-[#141A24] group">
            <img
              src="/images/property-interior.jpg"
              alt="Warm Modern Living Space"
              className="w-full h-36 xl:h-40 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block">
                Featured Architecture
              </span>
              <p className="text-xs font-bold text-white truncate">
                Contemporary Residences & Master Developments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
