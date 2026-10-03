import React from 'react';
import { PropertyMainCategory, PropertySubtype } from '../../types/discovery.types';
import { Building2, Home, Landmark, Trees, Briefcase, Layers } from 'lucide-react';

interface PropertyCategoryPillsProps {
  selectedCategory: PropertyMainCategory;
  onSelectCategory: (cat: PropertyMainCategory) => void;
  selectedSubtype: PropertySubtype | null;
  onSelectSubtype: (subtype: PropertySubtype | null) => void;
  countsBySubtype: Record<string, number>;
  totalCount: number;
}

export const PropertyCategoryPills: React.FC<PropertyCategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSubtype,
  onSelectSubtype,
  countsBySubtype,
  totalCount,
}) => {
  // Key property category navigation presets
  const categoryPills: Array<{
    id: string;
    label: string;
    category?: PropertyMainCategory;
    subtype?: PropertySubtype;
    count: number;
    icon?: React.ReactNode;
  }> = [
    {
      id: 'all',
      label: 'All Properties',
      category: 'All',
      subtype: undefined,
      count: totalCount,
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'apartments',
      label: 'Apartments',
      category: 'Residential',
      subtype: 'Apartment',
      count: (countsBySubtype['Apartment'] || 0) + (countsBySubtype['Flat'] || 0),
      icon: <Home className="w-3.5 h-3.5" />,
    },
    {
      id: 'villas',
      label: 'Villas',
      category: 'Residential',
      subtype: 'Villa',
      count: countsBySubtype['Villa'] || 0,
      icon: <Landmark className="w-3.5 h-3.5" />,
    },
    {
      id: 'row-houses',
      label: 'Row Houses',
      category: 'Residential',
      subtype: 'Row House',
      count: countsBySubtype['Row House'] || 0,
    },
    {
      id: 'penthouses',
      label: 'Penthouses',
      category: 'Residential',
      subtype: 'Penthouse',
      count: countsBySubtype['Penthouse'] || 0,
    },
    {
      id: 'plots',
      label: 'Plots & Land',
      category: 'Land',
      subtype: undefined,
      count:
        (countsBySubtype['Residential Plot'] || 0) +
        (countsBySubtype['Commercial Plot'] || 0) +
        (countsBySubtype['Farm Land'] || 0),
      icon: <Trees className="w-3.5 h-3.5" />,
    },
    {
      id: 'offices',
      label: 'Offices',
      category: 'Commercial',
      subtype: 'Office',
      count: countsBySubtype['Office'] || 0,
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    {
      id: 'commercial',
      label: 'Commercial & Retail',
      category: 'Commercial',
      subtype: undefined,
      count:
        (countsBySubtype['Office'] || 0) +
        (countsBySubtype['Shop / Retail'] || 0) +
        (countsBySubtype['Showroom'] || 0) +
        (countsBySubtype['Commercial Building'] || 0) +
        (countsBySubtype['Warehouse'] || 0),
    },
    {
      id: 'projects',
      label: 'Master Projects',
      category: 'Projects',
      subtype: undefined,
      count:
        (countsBySubtype['Commercial Project'] || 0) +
        (countsBySubtype['Mixed-use Project'] || 0) +
        (countsBySubtype['Township'] || 0) +
        (countsBySubtype['Gated Community'] || 0),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-2 text-left">
      {/* Scrollable Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryPills.map((pill) => {
          const isSelected =
            pill.id === 'all'
              ? selectedCategory === 'All' && !selectedSubtype
              : pill.subtype
              ? selectedSubtype === pill.subtype
              : selectedCategory === pill.category && !selectedSubtype;

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                if (pill.id === 'all') {
                  onSelectCategory('All');
                  onSelectSubtype(null);
                } else if (pill.subtype) {
                  onSelectCategory(pill.category || 'All');
                  onSelectSubtype(pill.subtype);
                } else if (pill.category) {
                  onSelectCategory(pill.category);
                  onSelectSubtype(null);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-2 border transition-all duration-200 cursor-pointer shadow-2xs ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-[#141A24] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#242F42] hover:bg-slate-50 dark:hover:bg-[#1A2230] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {pill.icon}
              <span>{pill.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#1A2230] text-slate-600 dark:text-slate-400'
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
