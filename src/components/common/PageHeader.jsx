import React from 'react';
import { ChevronRight } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  description,
  breadcrumbs = [],
  actions
}) => {
  const sub = subtitle || description;
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5 flex-wrap">
            {breadcrumbs.map((crumb, idx) => {
              const label = typeof crumb === 'object' && crumb !== null ? (crumb.label || crumb.name || '') : String(crumb || '');
              const isActive = typeof crumb === 'object' && crumb !== null ? Boolean(crumb.active) : (idx === breadcrumbs.length - 1);
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className={isActive ? 'text-slate-700 font-semibold' : 'hover:text-slate-600'}>
                    {label}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {sub && (
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {sub}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
