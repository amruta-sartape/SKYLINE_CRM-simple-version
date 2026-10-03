import React from 'react';
import { DiscoveryFilters, PropertySubtype } from '../../types/discovery.types';
import {
  PRICE_PRESETS,
  BHK_OPTIONS,
  AVAILABILITY_OPTIONS,
  FURNISHING_OPTIONS,
  ZONING_OPTIONS,
  FACING_OPTIONS,
  PARKING_OPTIONS,
  SORT_OPTIONS,
  PROPERTY_TYPES_CATALOG,
  MAIN_CATEGORIES,
} from '../../utils/discoveryData';
import {
  SlidersHorizontal,
  RotateCcw,
  Building2,
  MapPin,
  CheckCircle2,
  Compass,
  Car,
  ChevronDown,
} from 'lucide-react';

interface PropertyFilterSidebarProps {
  filters: DiscoveryFilters;
  onChangeFilters: (updated: Partial<DiscoveryFilters>) => void;
  onResetFilters: () => void;
  availableCities: string[];
  activeFilterCount: number;
}

export const PropertyFilterSidebar: React.FC<PropertyFilterSidebarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  availableCities,
  activeFilterCount,
}) => {
  // Toggle BHK pill selection
  const handleToggleBhk = (bhkId: string) => {
    const exists = filters.bhk.includes(bhkId);
    const newBhk = exists
      ? filters.bhk.filter((b) => b !== bhkId)
      : [...filters.bhk, bhkId];
    onChangeFilters({ bhk: newBhk });
  };

  // Determine active category context
  const isResidential =
    filters.category === 'Residential' ||
    (filters.subtype &&
      ['Apartment', 'Flat', 'Villa', 'Row House', 'Bungalow', 'Penthouse', 'Studio'].includes(
        filters.subtype
      ));

  const isLand =
    filters.category === 'Land' ||
    (filters.subtype &&
      ['Residential Plot', 'Commercial Plot', 'Farm Land'].includes(filters.subtype));

  const isCommercial =
    filters.category === 'Commercial' ||
    (filters.subtype &&
      ['Office', 'Shop / Retail', 'Showroom', 'Commercial Building', 'Warehouse'].includes(
        filters.subtype
      ));

  return (
    <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] shadow-xs p-5 space-y-6 text-left">
      {/* 1. Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#242F42]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">Filter Properties</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/80 dark:border-blue-900/50">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 2. Sort By Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Sort By</label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onChangeFilters({ sortBy: e.target.value as any })}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Main Category Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Category</label>
        <div className="grid grid-cols-2 gap-1.5">
          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChangeFilters({ category: cat.id, subtype: null })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left truncate cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-50 dark:bg-[#101622] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2230]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Specific Property Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Property Classification</label>
        <div className="relative">
          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.subtype || ''}
            onChange={(e) =>
              onChangeFilters({
                subtype: (e.target.value as PropertySubtype) || null,
              })
            }
            className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer truncate"
          >
            <option value="">All Types in {filters.category}</option>
            {PROPERTY_TYPES_CATALOG.filter(
              (t) => filters.category === 'All' || t.category === filters.category
            ).map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 5. Location / City */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Location</label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.city}
            onChange={(e) => onChangeFilters({ city: e.target.value })}
            className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer truncate"
          >
            <option value="All">All Metro Locations</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 6. Price Range Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price Budget</label>
          {filters.pricePreset !== 'all' && (
            <button
              type="button"
              onClick={() => onChangeFilters({ pricePreset: 'all', minPrice: null, maxPrice: null })}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          {PRICE_PRESETS.map((p) => {
            const isSelected = filters.pricePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  onChangeFilters({
                    pricePreset: p.id,
                    minPrice: p.min,
                    maxPrice: p.max,
                  })
                }
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#101622]'
                }`}
              >
                <span>{p.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Availability Status */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Availability</label>
        <div className="grid grid-cols-1 gap-1">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const isSelected = filters.availability === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeFilters({ availability: opt.id })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#101622]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. SMART CONTEXTUAL FILTERS (Strict relevance) */}
      {/* A. Residential: BHK Pills, Parking, Facing */}
      {isResidential && (
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-[#242F42]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bedrooms / BHK</label>
              {filters.bhk.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChangeFilters({ bhk: [] })}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BHK_OPTIONS.map((bhk) => {
                const isSelected = filters.bhk.includes(bhk.id);
                return (
                  <button
                    key={bhk.id}
                    type="button"
                    onClick={() => handleToggleBhk(bhk.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#101622] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2230] border border-slate-200/80 dark:border-[#242F42]'
                    }`}
                  >
                    {bhk.id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Car Parking</label>
            <div className="relative">
              <Car className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.parking}
                onChange={(e) => onChangeFilters({ parking: e.target.value })}
                className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {PARKING_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Facing / Vastu</label>
            <div className="relative">
              <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.facing}
                onChange={(e) => onChangeFilters({ facing: e.target.value })}
                className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {FACING_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* B. Plots & Land: Zoning & Facing (NO BHK!) */}
      {isLand && (
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#242F42]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Zoning Approval</label>
            <div className="relative">
              <select
                value={filters.zoning}
                onChange={(e) => onChangeFilters({ zoning: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {ZONING_OPTIONS.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Plot Facing</label>
            <div className="relative">
              <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.facing}
                onChange={(e) => onChangeFilters({ facing: e.target.value })}
                className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {FACING_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* C. Commercial: Furnishing & Parking (NO BHK!) */}
      {isCommercial && (
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#242F42]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Fit-out / Furnishing</label>
            <div className="relative">
              <select
                value={filters.furnishing}
                onChange={(e) => onChangeFilters({ furnishing: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {FURNISHING_OPTIONS.map((fn) => (
                  <option key={fn.id} value={fn.id}>
                    {fn.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Commercial Parking</label>
            <div className="relative">
              <Car className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.parking}
                onChange={(e) => onChangeFilters({ parking: e.target.value })}
                className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {PARKING_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
