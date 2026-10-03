import React, { useState } from 'react';
import { DiscoveryFilters } from '../../types/discovery.types';
import {
  PRICE_PRESETS,
  AREA_PRESETS,
  BHK_OPTIONS,
  AVAILABILITY_OPTIONS,
  FURNISHING_OPTIONS,
  ZONING_OPTIONS,
  FACING_OPTIONS,
  PARKING_OPTIONS,
  SORT_OPTIONS,
  formatPrice,
} from '../../utils/discoveryData';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Building2,
  MapPin,
  IndianRupee,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  Car,
  Layers,
} from 'lucide-react';

interface PropertyFilterPanelProps {
  filters: DiscoveryFilters;
  onChangeFilters: (updated: Partial<DiscoveryFilters>) => void;
  onResetFilters: () => void;
  availableCities: string[];
  totalResults: number;
  catalogTotal: number;
}

export const PropertyFilterPanel: React.FC<PropertyFilterPanelProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  availableCities,
  totalResults,
  catalogTotal,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate active filter count
  const activeCount =
    (filters.query ? 1 : 0) +
    (filters.category !== 'All' ? 1 : 0) +
    (filters.subtype ? 1 : 0) +
    (filters.city !== 'All' ? 1 : 0) +
    (filters.pricePreset !== 'all' || filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.areaPreset !== 'all' || filters.minArea !== null || filters.maxArea !== null ? 1 : 0) +
    (filters.availability !== 'All' ? 1 : 0) +
    (filters.bhk.length > 0 ? 1 : 0) +
    (filters.parking !== 'All' ? 1 : 0) +
    (filters.furnishing !== 'All' ? 1 : 0) +
    (filters.zoning !== 'All' ? 1 : 0) +
    (filters.facing !== 'All' ? 1 : 0) +
    (filters.sortBy !== 'featured' ? 1 : 0);

  // Toggle BHK pill selection
  const handleToggleBhk = (bhkId: string) => {
    const exists = filters.bhk.includes(bhkId);
    const newBhk = exists
      ? filters.bhk.filter((b) => b !== bhkId)
      : [...filters.bhk, bhkId];
    onChangeFilters({ bhk: newBhk });
  };

  // Determine current active category context
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

  const isProjects =
    filters.category === 'Projects' ||
    (filters.subtype &&
      ['Commercial Project', 'Mixed-use Project', 'Township', 'Gated Community'].includes(
        filters.subtype
      ));

  // Determine active price label for chips
  const getPriceChipLabel = () => {
    if (filters.pricePreset !== 'all') {
      const preset = PRICE_PRESETS.find((p) => p.id === filters.pricePreset);
      if (preset) return preset.label;
    }
    if (filters.minPrice !== null && filters.maxPrice !== null) {
      return `${formatPrice(filters.minPrice)} – ${formatPrice(filters.maxPrice)}`;
    }
    if (filters.minPrice !== null) {
      return `Min ${formatPrice(filters.minPrice)}`;
    }
    if (filters.maxPrice !== null) {
      return `Max ${formatPrice(filters.maxPrice)}`;
    }
    return '';
  };

  // Determine active area label for chips
  const getAreaChipLabel = () => {
    if (filters.areaPreset !== 'all') {
      const preset = AREA_PRESETS.find((a) => a.id === filters.areaPreset);
      if (preset) return preset.label;
    }
    if (filters.minArea !== null && filters.maxArea !== null) {
      return `${filters.minArea.toLocaleString('en-IN')} – ${filters.maxArea.toLocaleString('en-IN')} sq.ft`;
    }
    if (filters.minArea !== null) {
      return `Min ${filters.minArea.toLocaleString('en-IN')} sq.ft`;
    }
    if (filters.maxArea !== null) {
      return `Max ${filters.maxArea.toLocaleString('en-IN')} sq.ft`;
    }
    return '';
  };

  return (
    <div className="space-y-4 text-left">
      {/* ========================================================================= */}
      {/* 1. PRIMARY SEARCH & SMART TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#141A24] p-4 sm:p-5 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-4">
        {/* Top Line: Prominent Search + Sort + Smart Filter Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Prominent Search Bar with Clear Button */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, project name, location, city, subtype, or code (e.g. 'BKC', 'Villa', '4 BHK', 'SK-')..."
              value={filters.query}
              onChange={(e) => onChangeFilters({ query: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-[#101622] text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 transition-all"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onChangeFilters({ query: '' })}
                className="p-1 rounded-full bg-stone-200 dark:bg-slate-700 hover:bg-stone-300 dark:hover:bg-slate-600 text-stone-600 dark:text-slate-200 hover:text-stone-900 dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                title="Clear search query"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Actions Toolbar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* City Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[130px]">
              <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.city}
                onChange={(e) => onChangeFilters({ city: e.target.value })}
                className="w-full pl-8 pr-7 py-2.5 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600 transition-colors"
              >
                <option value="All">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Price Budget Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <IndianRupee className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                className="w-full pl-8 pr-7 py-2.5 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600 transition-colors"
              >
                {PRICE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Order Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[160px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.sortBy}
                onChange={(e) => onChangeFilters({ sortBy: e.target.value as any })}
                className="w-full pl-8 pr-7 py-2.5 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600 transition-colors"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Smart Filters Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border ${
                isDrawerOpen || activeCount > 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#101622] text-stone-700 dark:text-slate-300 border-stone-200 dark:border-[#242F42] hover:text-stone-900 dark:hover:text-slate-100 hover:border-stone-300 dark:hover:border-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Smart Filters</span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100">
                  {activeCount}
                </span>
              )}
              {isDrawerOpen ? (
                <ChevronUp className="w-3 h-3 ml-0.5 text-stone-400 dark:text-slate-500" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5 text-stone-400 dark:text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. EXPANDABLE ADAPTIVE FILTER TRAY */}
        {/* ========================================================================= */}
        {isDrawerOpen && (
          <div className="pt-4 border-t border-stone-100 dark:border-[#242F42] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Common: Area Size Range */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  <Maximize2 className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>Area / Carpet Size</span>
                </label>
                <div className="relative">
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
                    className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600"
                  >
                    {AREA_PRESETS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Common: Availability Status */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  <Building2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  <span>Availability Status</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.availability}
                    onChange={(e) => onChangeFilters({ availability: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600"
                  >
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* DYNAMIC CASE A: RESIDENTIAL (BHK & Parking) */}
              {(isResidential || filters.category === 'All') && (
                <>
                  <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                    <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      <span>BHK Bedroom Layout</span>
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {BHK_OPTIONS.map((opt) => {
                        const isSelected = filters.bhk.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleToggleBhk(opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 shadow-xs'
                                : 'bg-stone-50 dark:bg-[#101622] text-stone-600 dark:text-slate-400 border-stone-200 dark:border-[#242F42] hover:bg-stone-100 dark:hover:bg-[#1A2230] hover:text-stone-900 dark:hover:text-slate-100'
                            }`}
                          >
                            {opt.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      <Car className="w-3 h-3 text-stone-500 dark:text-slate-400" />
                      <span>Dedicated Parking</span>
                    </label>
                    <div className="relative">
                      <select
                        value={filters.parking}
                        onChange={(e) => onChangeFilters({ parking: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600"
                      >
                        {PARKING_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC CASE B: LAND & PLOTS (Zoning & Facing - Strictly NO BHK) */}
              {isLand && (
                <>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      <Layers className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      <span>Land Zoning & Title</span>
                    </label>
                    <div className="relative">
                      <select
                        value={filters.zoning}
                        onChange={(e) => onChangeFilters({ zoning: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600"
                      >
                        {ZONING_OPTIONS.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      <Compass className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      <span>Plot Facing / Orientation</span>
                    </label>
                    <div className="relative">
                      <select
                        value={filters.facing}
                        onChange={(e) => onChangeFilters({ facing: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600"
                      >
                        {FACING_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC CASE C: COMMERCIAL (Furnishing & Specifications - Strictly NO BHK) */}
              {isCommercial && (
                <>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      <Building2 className="w-3 h-3 text-stone-600 dark:text-slate-400" />
                      <span>Commercial Fitout & Furnishing</span>
                    </label>
                    <div className="relative">
                      <select
                        value={filters.furnishing}
                        onChange={(e) => onChangeFilters({ furnishing: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold bg-stone-50 dark:bg-[#101622] text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-700 dark:focus:border-amber-500 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-slate-600"
                      >
                        {FURNISHING_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC CASE D: MASTER PROJECTS (Scale & Phase - Strictly NO unit BHK) */}
              {isProjects && (
                <>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      <Layers className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      <span>Master Township Scale</span>
                    </label>
                    <div className="p-2.5 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200 dark:border-[#242F42] text-stone-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      Browsing integrated multi-acre master developments, tech parks, and gated residential enclaves.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Custom Min / Max Price & Area Inputs */}
            <div className="pt-3 border-t border-stone-100 dark:border-[#242F42] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Custom Min Price (₹):</span>
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChangeFilters({ minPrice: val, pricePreset: 'all' });
                  }}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-[#101622] text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 border border-stone-200 dark:border-[#242F42] rounded-lg text-xs focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Custom Max Price (₹):</span>
                <input
                  type="number"
                  placeholder="e.g. 30000000"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChangeFilters({ maxPrice: val, pricePreset: 'all' });
                  }}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-[#101622] text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 border border-stone-200 dark:border-[#242F42] rounded-lg text-xs focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Custom Min Area (sq.ft):</span>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={filters.minArea ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChangeFilters({ minArea: val, areaPreset: 'all' });
                  }}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-[#101622] text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 border border-stone-200 dark:border-[#242F42] rounded-lg text-xs focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Custom Max Area (sq.ft):</span>
                <input
                  type="number"
                  placeholder="e.g. 4000"
                  value={filters.maxArea ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    onChangeFilters({ maxArea: val, areaPreset: 'all' });
                  }}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-[#101622] text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 border border-stone-200 dark:border-[#242F42] rounded-lg text-xs focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-1 focus:ring-amber-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ACTIVE FILTER CHIPS & RESET ACTION */}
        {/* ========================================================================= */}
        {activeCount > 0 && (
          <div className="pt-3 border-t border-stone-100 dark:border-[#242F42] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 mr-1">
                Active Filters ({activeCount}):
              </span>

              {/* Search Query Chip */}
              {filters.query && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <Search className="w-3 h-3 text-stone-500 dark:text-slate-400" />
                  <span>"{filters.query}"</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ query: '' })}
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Main Category Chip */}
              {filters.category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-[11px] font-semibold">
                  <span>Category: {filters.category}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ category: 'All', subtype: null })}
                    className="hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Property Subtype Chip */}
              {filters.subtype && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>Type: {filters.subtype}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ subtype: null })}
                    className="hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* City Chip */}
              {filters.city !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <MapPin className="w-3 h-3 text-stone-500 dark:text-slate-400" />
                  <span>City: {filters.city}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ city: 'All' })}
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Price Range Chip */}
              {getPriceChipLabel() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <IndianRupee className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span>{getPriceChipLabel()}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFilters({
                        pricePreset: 'all',
                        minPrice: null,
                        maxPrice: null,
                      })
                    }
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Area Size Chip */}
              {getAreaChipLabel() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <Maximize2 className="w-3 h-3 text-stone-500 dark:text-slate-400" />
                  <span>{getAreaChipLabel()}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeFilters({
                        areaPreset: 'all',
                        minArea: null,
                        maxArea: null,
                      })
                    }
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Availability Chip */}
              {filters.availability !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-medium">
                  <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{filters.availability}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ availability: 'All' })}
                    className="hover:text-emerald-950 dark:hover:text-emerald-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* BHK Chips */}
              {filters.bhk.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-[11px] font-medium"
                >
                  <span>{b}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleBhk(b)}
                    className="hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Furnishing Chip */}
              {filters.furnishing !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <span>{filters.furnishing}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ furnishing: 'All' })}
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Zoning Chip */}
              {filters.zoning !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-medium">
                  <span>{filters.zoning}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ zoning: 'All' })}
                    className="hover:text-emerald-950 dark:hover:text-emerald-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Facing Chip */}
              {filters.facing !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <span>Facing: {filters.facing}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ facing: 'All' })}
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Parking Chip */}
              {filters.parking !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#101622] text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#242F42] text-[11px] font-medium">
                  <span>Parking: {filters.parking}</span>
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ parking: 'All' })}
                    className="hover:text-stone-900 dark:hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Clear All Reset Action */}
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1A2230] border border-stone-200 dark:border-[#242F42] transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DYNAMIC RESULTS BANNER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-900 dark:text-slate-100 text-sm">
            {filters.subtype
              ? `${filters.subtype} Listings`
              : filters.category !== 'All'
              ? `${filters.category} Properties`
              : 'All Real Estate Properties'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-[#1A2230] text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-[#242F42]">
            {totalResults} of {catalogTotal} Available
          </span>
        </div>

        <div className="text-[11px] text-stone-500 dark:text-slate-400 font-normal">
          Showing real-time curated investment properties across verified developments
        </div>
      </div>
    </div>
  );
};
