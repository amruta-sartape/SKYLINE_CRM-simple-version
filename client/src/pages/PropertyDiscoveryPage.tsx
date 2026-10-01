import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { unitService } from '../services/unit.service';
import { PropertyProject, PropertyUnit } from '../types/property.types';
import {
  PropertyMainCategory,
  PropertySubtype,
  DiscoveryProperty,
} from '../types/discovery.types';
import { buildDiscoveryCatalog, PROPERTY_TYPES_CATALOG } from '../utils/discoveryData';
import { AppShell } from '../components/layout/AppShell';
import { PropertyTypeSelector } from '../components/discovery/PropertyTypeSelector';
import { PropertyDiscoveryCard } from '../components/discovery/PropertyDiscoveryCard';
import { PropertyDiscoveryDetailModal } from '../components/discovery/PropertyDiscoveryDetailModal';
import { PropertyEmptyState } from '../components/discovery/PropertyEmptyState';
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

export const PropertyDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state sync
  const initialCategory = (searchParams.get('category') as PropertyMainCategory) || 'All';
  const initialSubtype = (searchParams.get('type') as PropertySubtype) || null;

  const [selectedCategory, setSelectedCategory] = useState<PropertyMainCategory>(initialCategory);
  const [selectedSubtype, setSelectedSubtype] = useState<PropertySubtype | null>(initialSubtype);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Data
  const [dbProjects, setDbProjects] = useState<PropertyProject[]>([]);
  const [dbUnits, setDbUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<DiscoveryProperty | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [projRes, unitsRes] = await Promise.all([
          projectService.list({ limit: 50 }),
          unitService.list({ limit: 100 }),
        ]);

        if (isMounted) {
          setDbProjects(projRes.projects || []);
          setDbUnits(unitsRes.units || []);
        }
      } catch (err) {
        console.error('Failed to load discovery data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build full discovery catalog
  const fullCatalog = useMemo(() => {
    return buildDiscoveryCatalog(dbProjects, dbUnits);
  }, [dbProjects, dbUnits]);

  // Compute live counts by subtype
  const countsBySubtype = useMemo(() => {
    const counts: Record<string, number> = {};
    PROPERTY_TYPES_CATALOG.forEach((t) => {
      counts[t.id] = fullCatalog.filter((p) => p.subtype === t.id).length;
    });
    return counts;
  }, [fullCatalog]);

  // Handle category change & sync URL
  const handleSelectCategory = (cat: PropertyMainCategory) => {
    setSelectedCategory(cat);
    setSelectedSubtype(null);
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    setSearchParams(params);
  };

  // Handle subtype change & sync URL
  const handleSelectSubtype = (subtype: PropertySubtype | null) => {
    setSelectedSubtype(subtype);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (subtype) params.set('type', subtype);
    setSearchParams(params);
  };

  // Filter and sort catalog
  const filteredProperties = useMemo(() => {
    return fullCatalog
      .filter((prop) => {
        // Category Filter
        if (selectedCategory !== 'All' && prop.mainCategory !== selectedCategory) {
          return false;
        }
        // Subtype Filter
        if (selectedSubtype && prop.subtype !== selectedSubtype) {
          return false;
        }
        // Search Query Filter (Title, Location, City, Developer, Code)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchLoc = prop.location.toLowerCase().includes(q);
          const matchCity = prop.city.toLowerCase().includes(q);
          const matchDev = prop.developer.toLowerCase().includes(q);
          const matchCode = prop.code.toLowerCase().includes(q);
          const matchSub = prop.subtype.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchCity && !matchDev && !matchCode && !matchSub) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [fullCatalog, selectedCategory, selectedSubtype, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubtype(null);
    setSearchQuery('');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        {/* 1. "WHAT ARE YOU LOOKING FOR?" Hero Property Type Selector */}
        <PropertyTypeSelector
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedSubtype={selectedSubtype}
          onSelectSubtype={handleSelectSubtype}
          countsBySubtype={countsBySubtype}
          totalCount={fullCatalog.length}
        />

        {/* 2. Active Filter Bar, Search & Sort Toolbar */}
        <div className="bg-slate-900/85 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Active Context Label */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="p-2 rounded-lg bg-slate-950 text-amber-400 border border-slate-800 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {selectedSubtype ? selectedSubtype : selectedCategory === 'All' ? 'All Real Estate Properties' : selectedCategory}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-400/30">
                  {filteredProperties.length} Available
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Browsing active listings matching your investment criteria
              </p>
            </div>
          </div>

          {/* Search Input & Sort Options */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, location, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 text-white placeholder:text-slate-500 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-2 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Results Grid & Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden"
              >
                <div className="h-48 bg-slate-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                  <div className="h-16 bg-slate-800/40 rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <PropertyEmptyState
            onReset={handleResetFilters}
            searchTerm={searchQuery}
            selectedSubtype={selectedSubtype}
            selectedCategory={selectedCategory}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyDiscoveryCard
                key={property.id}
                property={property}
                onViewDetails={(p) => setSelectedProperty(p)}
                onInquire={(p) => setSelectedProperty(p)}
              />
            ))}
          </div>
        )}

        {/* 4. Property Detail Inspection Modal */}
        <PropertyDiscoveryDetailModal
          isOpen={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          property={selectedProperty}
        />
      </div>
    </AppShell>
  );
};
