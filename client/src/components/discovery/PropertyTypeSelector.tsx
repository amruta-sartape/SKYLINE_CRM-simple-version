import React from 'react';
import {
  PropertyMainCategory,
  PropertySubtype,
} from '../../types/discovery.types';
import { PROPERTY_TYPES_CATALOG, MAIN_CATEGORIES } from '../../utils/discoveryData';
import {
  Sparkles,
  Search,
} from 'lucide-react';

interface PropertyTypeSelectorProps {
  selectedCategory: PropertyMainCategory;
  onSelectCategory: (cat: PropertyMainCategory) => void;
  selectedSubtype: PropertySubtype | null;
  onSelectSubtype: (subtype: PropertySubtype | null) => void;
  countsBySubtype: Record<string, number>;
  totalCount: number;
}

export const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSubtype,
  onSelectSubtype,
  countsBySubtype,
  totalCount,
}) => {
  // Filter property subtypes according to the selected main category
  const filteredTypes =
    selectedCategory === 'All'
      ? PROPERTY_TYPES_CATALOG
      : PROPERTY_TYPES_CATALOG.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6 text-left">
      {/* 1. "WHAT ARE YOU LOOKING FOR?" Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-navy-950 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-amber-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Property Discovery</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">{totalCount} Properties Available</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans uppercase">
              What are you looking for?
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore residential towers, private villas, commercial tech suites, and freehold plots tailored to your exact investment preferences.
            </p>
          </div>

          {/* Main Category Filter Tabs */}
          <div className="shrink-0 flex flex-wrap gap-1.5 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            {MAIN_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectSubtype(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Interactive Property Type Category Pills Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Search className="w-3.5 h-3.5 text-brand-400" />
            <span>Select Property Classification:</span>
          </div>

          {selectedSubtype && (
            <button
              type="button"
              onClick={() => onSelectSubtype(null)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Reset Type Filter (Show All {selectedCategory === 'All' ? '' : selectedCategory})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {filteredTypes.map((typeMeta) => {
            const isSelected = selectedSubtype === typeMeta.id;
            const count = countsBySubtype[typeMeta.id] || 0;

            return (
              <button
                key={typeMeta.id}
                type="button"
                onClick={() => onSelectSubtype(isSelected ? null : typeMeta.id)}
                className={`h-32 sm:h-36 rounded-xl border transition-all duration-300 flex flex-col justify-between p-3 text-left group relative overflow-hidden shadow-md cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/20 scale-[1.02]'
                    : 'border-slate-800/90 hover:border-slate-600 hover:shadow-xl hover:scale-[1.01]'
                }`}
              >
                {/* 1. Real Property Image Background */}
                <img
                  src={typeMeta.image}
                  alt={typeMeta.label}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* 2. Subtle Dark Gradient Overlay for Readability */}
                <div
                  className={`absolute inset-0 transition-colors duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/35'
                      : 'bg-gradient-to-t from-slate-950 via-slate-950/75 to-black/45 group-hover:via-slate-950/60'
                  }`}
                />

                {/* 3. Active Selection Ring & Corner Badge */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-400 rounded-xl pointer-events-none" />
                )}

                {/* 4. Top Row: Category Tag & Available Count */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-black/65 text-slate-300 border border-white/10'
                    }`}
                  >
                    {typeMeta.category}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-black/75 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                {/* 5. Bottom Row: Property Name & Description */}
                <div className="relative z-10 space-y-0.5">
                  <h4
                    className={`text-xs sm:text-sm font-extrabold truncate drop-shadow-md transition-colors ${
                      isSelected ? 'text-amber-300' : 'text-white group-hover:text-brand-300'
                    }`}
                  >
                    {typeMeta.label}
                  </h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1 leading-snug drop-shadow font-normal">
                    {typeMeta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
