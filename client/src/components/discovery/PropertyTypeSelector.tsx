import React from 'react';
import {
  PropertyMainCategory,
  PropertySubtype,
} from '../../types/discovery.types';
import { PROPERTY_TYPES_CATALOG, MAIN_CATEGORIES } from '../../utils/discoveryData';
import {
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
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden text-stone-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Property Discovery</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{totalCount} Properties Available</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-sans">
              What are you looking for?
            </h1>

            <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
              Explore residential residences, villas, commercial office spaces, and freehold plots tailored to your exact investment preferences.
            </p>
          </div>

          {/* Main Category Filter Tabs */}
          <div className="shrink-0 flex flex-wrap gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/60">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
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
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span>Select Property Classification:</span>
          </div>

          {selectedSubtype && (
            <button
              type="button"
              onClick={() => onSelectSubtype(null)}
              className="text-xs font-medium text-stone-700 hover:text-stone-950 underline underline-offset-4 cursor-pointer"
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
                className={`h-32 sm:h-34 rounded-2xl border transition-all duration-200 flex flex-col justify-between p-3 text-left group relative overflow-hidden shadow-xs cursor-pointer ${
                  isSelected
                    ? 'border-stone-900 ring-2 ring-stone-900/40 shadow-md scale-[1.02]'
                    : 'border-stone-200/90 hover:border-stone-400/80 hover:shadow-sm'
                }`}
              >
                {/* 1. Real Property Image Background */}
                <img
                  src={typeMeta.image}
                  alt={typeMeta.label}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />

                {/* 2. Subtle Dark Gradient Overlay for Readability */}
                <div
                  className={`absolute inset-0 transition-colors duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-black/80 via-black/40 to-black/30'
                      : 'bg-gradient-to-t from-black/75 via-black/35 to-black/20 group-hover:from-black/70'
                  }`}
                />

                {/* 3. Top Row: Category Tag & Available Count */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md transition-colors ${
                      isSelected
                        ? 'bg-white text-stone-900 font-bold shadow-xs'
                        : 'bg-black/50 text-white border border-white/10'
                    }`}
                  >
                    {typeMeta.category}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                      isSelected
                        ? 'bg-white text-stone-900 font-bold'
                        : 'bg-black/60 text-white border border-white/15'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                {/* 4. Bottom Row: Property Name & Description */}
                <div className="relative z-10 space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm">
                    {typeMeta.label}
                  </h4>
                  <p className="text-[10px] text-stone-200 line-clamp-1 leading-snug drop-shadow font-normal">
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
