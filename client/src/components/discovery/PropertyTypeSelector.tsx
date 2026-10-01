import React from 'react';
import {
  PropertyMainCategory,
  PropertySubtype,
} from '../../types/discovery.types';
import { PROPERTY_TYPES_CATALOG, MAIN_CATEGORIES } from '../../utils/discoveryData';
import {
  Building2,
  Home,
  Palmtree,
  Rows,
  Landmark,
  Sparkles,
  Compass,
  MapPin,
  Maximize2,
  Trees,
  Briefcase,
  ShoppingBag,
  Store,
  Building,
  Boxes,
  Layers,
  Share2,
  Network,
  Shield,
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

const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Palmtree: <Palmtree className="w-4 h-4" />,
  Rows: <Rows className="w-4 h-4" />,
  Landmark: <Landmark className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  MapPin: <MapPin className="w-4 h-4" />,
  Maximize2: <Maximize2 className="w-4 h-4" />,
  Trees: <Trees className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Store: <Store className="w-4 h-4" />,
  Building: <Building className="w-4 h-4" />,
  Boxes: <Boxes className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Share2: <Share2 className="w-4 h-4" />,
  Network: <Network className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
};

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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
          {filteredTypes.map((typeMeta) => {
            const isSelected = selectedSubtype === typeMeta.id;
            const count = countsBySubtype[typeMeta.id] || 0;
            const icon = ICON_MAP[typeMeta.iconName] || <Building2 className="w-4 h-4" />;

            return (
              <button
                key={typeMeta.id}
                type="button"
                onClick={() => onSelectSubtype(isSelected ? null : typeMeta.id)}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between text-left group relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400/80 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700 shadow-sm hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-amber-400 shadow-sm shadow-amber-400" />
                )}

                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-2 rounded-lg transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'bg-slate-950 text-slate-400 group-hover:text-brand-400 border border-slate-800'
                    }`}
                  >
                    {icon}
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="mt-3">
                  <span
                    className={`text-xs font-bold block truncate ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-200 group-hover:text-brand-300 transition-colors'
                    }`}
                  >
                    {typeMeta.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {typeMeta.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
