import React from 'react';
import { DiscoveryFilters, PropertySubtype } from '../../types/discovery.types';
import {
  PRICE_PRESETS,
  AREA_PRESETS,
  AVAILABILITY_OPTIONS,
  PROPERTY_TYPES_CATALOG,
} from '../../utils/discoveryData';
import {
  Search,
  X,
  MapPin,
  IndianRupee,
  Maximize2,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

interface PropertyQuickFilterBarProps {
  filters: DiscoveryFilters;
  onChangeFilters: (updated: Partial<DiscoveryFilters>) => void;
  onResetFilters: () => void;
  availableCities: string[];
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeFilterCount: number;
}

export const PropertyQuickFilterBar: React.FC<PropertyQuickFilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  availableCities,
  isSidebarOpen,
  onToggleSidebar,
  activeFilterCount,
}) => {
  return (
    <div className="bg-white dark:bg-[#141A24] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-[#242F42] shadow-xs space-y-3.5 text-left">
      {/* Top Row: Search Input + Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Full-width Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, location, project, subtype, or code..."
            value={filters.query}
            onChange={(e) => onChangeFilters({ query: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#101622] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onChangeFilters({ query: '' })}
              className="p-1 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sidebar Toggle & Reset Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isSidebarOpen
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white dark:bg-[#141A24] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#242F42] hover:bg-slate-50 dark:hover:bg-[#1A2230] hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSidebarOpen ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                }`}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-[#242F42] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#1A2230] transition-colors cursor-pointer"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Quick Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
        {/* 1. Property Type Dropdown */}
        <div className="relative">
          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.subtype || ''}
            onChange={(e) =>
              onChangeFilters({
                subtype: (e.target.value as PropertySubtype) || null,
              })
            }
            className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors truncate"
          >
            <option value="">All Property Types</option>
            <optgroup label="Residential">
              {PROPERTY_TYPES_CATALOG.filter((t) => t.category === 'Residential').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Plots & Land">
              {PROPERTY_TYPES_CATALOG.filter((t) => t.category === 'Land').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Commercial">
              {PROPERTY_TYPES_CATALOG.filter((t) => t.category === 'Commercial').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Master Projects">
              {PROPERTY_TYPES_CATALOG.filter((t) => t.category === 'Projects').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 2. Location (City) Dropdown */}
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.city}
            onChange={(e) => onChangeFilters({ city: e.target.value })}
            className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors truncate"
          >
            <option value="All">All Locations</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 3. Price Range Dropdown */}
        <div className="relative">
          <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.pricePreset}
            onChange={(e) => {
              const preset = PRICE_PRESETS.find((p) => p.id === e.target.value);
              onChangeFilters({
                pricePreset: e.target.value,
                minPrice: preset?.min ?? null,
                maxPrice: preset?.max ?? null,
              });
            }}
            className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors truncate"
          >
            {PRICE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 4. Availability Dropdown */}
        <div className="relative">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.availability}
            onChange={(e) => onChangeFilters({ availability: e.target.value })}
            className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors truncate"
          >
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 5. Area Size Dropdown */}
        <div className="relative col-span-2 sm:col-span-1">
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.areaPreset}
            onChange={(e) => {
              const preset = AREA_PRESETS.find((a) => a.id === e.target.value);
              onChangeFilters({
                areaPreset: e.target.value,
                minArea: preset?.min ?? null,
                maxArea: preset?.max ?? null,
              });
            }}
            className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors truncate"
          >
            {AREA_PRESETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
