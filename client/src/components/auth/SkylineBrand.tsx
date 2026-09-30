import React from 'react';
import { clsx } from 'clsx';

interface SkylineBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'gold';
  showTagline?: boolean;
  className?: string;
}

export const SkylineBrand: React.FC<SkylineBrandProps> = ({
  size = 'md',
  variant = 'dark',
  showTagline = true,
  className,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base tracking-wider',
    md: 'text-xl tracking-wider',
    lg: 'text-2xl tracking-widest',
    xl: 'text-3xl tracking-widest',
  };

  const isLight = variant === 'light';

  return (
    <div className={clsx('inline-flex items-center gap-3 select-none', className)}>
      {/* Custom Architectural Skyline Monogram */}
      <div
        className={clsx(
          'relative flex items-center justify-center rounded-xl p-1.5 transition-transform duration-300 shadow-sm shrink-0',
          isLight
            ? 'bg-slate-900 border border-slate-700/80 text-white'
            : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-900 text-white'
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconSizes[size]}
        >
          {/* Left Tower */}
          <rect x="7" y="16" width="6.5" height="18" rx="1.5" fill={isLight ? '#94A3B8' : '#64748B'} />
          <path d="M7 16L10.25 12L13.5 16H7Z" fill={isLight ? '#CBD5E1' : '#94A3B8'} />

          {/* Center Pinnacle Tower (Skyline Apex) */}
          <rect x="16.5" y="8" width="7" height="26" rx="1.5" fill="#3B82F6" />
          <path d="M16.5 8L20 3L23.5 8H16.5Z" fill="#60A5FA" />
          {/* Spire antenna */}
          <line x1="20" y1="3" x2="20" y2="1" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />

          {/* Right Tower */}
          <rect x="26.5" y="12" width="6.5" height="22" rx="1.5" fill={isLight ? '#F59E0B' : '#D97706'} />
          <path d="M26.5 12L29.75 8L33 12H26.5Z" fill={isLight ? '#FCD34D' : '#F59E0B'} />

          {/* Foundation Accent Baseline */}
          <rect x="4" y="34" width="32" height="2" rx="1" fill={isLight ? '#E2E8F0' : '#475569'} />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={clsx(
              'font-extrabold font-sans uppercase',
              titleSizes[size],
              isLight ? 'text-white' : 'text-slate-900'
            )}
          >
            SKYLINE
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 border border-brand-500/20">
            CRM
          </span>
        </div>

        {showTagline && (
          <span
            className={clsx(
              'text-[10px] font-medium tracking-wide uppercase mt-1',
              isLight ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            Real Estate Enterprise Platform
          </span>
        )}
      </div>
    </div>
  );
};
