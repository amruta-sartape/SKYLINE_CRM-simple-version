import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { unitService } from '../services/unit.service';
import { PropertyProject, PropertyUnit } from '../types/property.types';
import {
  PropertyMainCategory,
  PropertySubtype,
  DiscoveryProperty,
  DiscoveryFilters,
} from '../types/discovery.types';
import {
  buildDiscoveryCatalog,
  PROPERTY_TYPES_CATALOG,
  PRICE_PRESETS,
  AREA_PRESETS,
  getPropertyArea,
} from '../utils/discoveryData';
import { AppShell } from '../components/layout/AppShell';
import { PropertyDiscoveryHero } from '../components/discovery/PropertyDiscoveryHero';
import { PropertyQuickFilterBar } from '../components/discovery/PropertyQuickFilterBar';
import { PropertyCategoryPills } from '../components/discovery/PropertyCategoryPills';
import { PropertyFilterSidebar } from '../components/discovery/PropertyFilterSidebar';
import { PropertyDiscoveryCard } from '../components/discovery/PropertyDiscoveryCard';
import { PropertyDiscoveryDetailModal } from '../components/discovery/PropertyDiscoveryDetailModal';
import { PropertyEmptyState } from '../components/discovery/PropertyEmptyState';
import { X, ChevronDown } from 'lucide-react';

export const PropertyDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse initial query params from URL
  const initialCategory = (searchParams.get('category') as PropertyMainCategory) || 'All';
  const initialSubtype = (searchParams.get('type') as PropertySubtype) || null;
  const initialCity = searchParams.get('city') || 'All';
  const initialQuery = searchParams.get('q') || '';
  const initialPrice = searchParams.get('price') || 'all';
  const initialArea = searchParams.get('area') || 'all';
  const initialSort = (searchParams.get('sort') as any) || 'featured';
  const initialBhk = searchParams.get('bhk') ? searchParams.get('bhk')!.split(',') : [];

  const initialPricePreset = PRICE_PRESETS.find((p) => p.id === initialPrice);
  const initialAreaPreset = AREA_PRESETS.find((a) => a.id === initialArea);

  // Consolidated Filter State
  const [filters, setFilters] = useState<DiscoveryFilters>({
    query: initialQuery,
    category: initialCategory,
    subtype: initialSubtype,
    city: initialCity,
    pricePreset: initialPrice,
    minPrice: initialPricePreset?.min ?? null,
    maxPrice: initialPricePreset?.max ?? null,
    areaPreset: initialArea,
    minArea: initialAreaPreset?.min ?? null,
    maxArea: initialAreaPreset?.max ?? null,
    availability: 'All',
    bhk: initialBhk,
    parking: 'All',
    furnishing: 'All',
    zoning: 'All',
    facing: 'All',
    sortBy: initialSort,
  });

  // Sidebar toggle state (Default open on wide screens)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data fetching state
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

  // Build full discovery catalog (DB projects + realistic typed catalog)
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

  // Extract unique cities list dynamically
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    fullCatalog.forEach((p) => {
      if (p.city) citiesSet.add(p.city);
    });
    return Array.from(citiesSet).sort();
  }, [fullCatalog]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return (
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
      (filters.sortBy !== 'featured' ? 1 : 0)
    );
  }, [filters]);

  // Sync state changes with URL Search Params
  const updateFiltersAndUrl = (updated: Partial<DiscoveryFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };

      const params = new URLSearchParams();
      if (next.query) params.set('q', next.query);
      if (next.category !== 'All') params.set('category', next.category);
      if (next.subtype) params.set('type', next.subtype);
      if (next.city !== 'All') params.set('city', next.city);
      if (next.pricePreset !== 'all') params.set('price', next.pricePreset);
      if (next.areaPreset !== 'all') params.set('area', next.areaPreset);
      if (next.bhk.length > 0) params.set('bhk', next.bhk.join(','));
      if (next.sortBy !== 'featured') params.set('sort', next.sortBy);

      setSearchParams(params, { replace: true });
      return next;
    });
  };

  // Handle category change from hero selector
  const handleSelectCategory = (cat: PropertyMainCategory) => {
    updateFiltersAndUrl({ category: cat, subtype: null });
  };

  // Handle subtype change from hero selector
  const handleSelectSubtype = (subtype: PropertySubtype | null) => {
    updateFiltersAndUrl({ subtype });
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'All',
      subtype: null,
      city: 'All',
      pricePreset: 'all',
      minPrice: null,
      maxPrice: null,
      areaPreset: 'all',
      minArea: null,
      maxArea: null,
      availability: 'All',
      bhk: [],
      parking: 'All',
      furnishing: 'All',
      zoning: 'All',
      facing: 'All',
      sortBy: 'featured',
    });
    setSearchParams({});
  };

  // Real-time Adaptive Filter Engine
  const filteredProperties = useMemo(() => {
    return fullCatalog
      .filter((prop) => {
        // 1. Main Category Filter
        if (filters.category !== 'All' && prop.mainCategory !== filters.category) {
          return false;
        }

        // 2. Subtype Filter
        if (filters.subtype && prop.subtype !== filters.subtype) {
          return false;
        }

        // 3. City / Location Filter
        if (filters.city !== 'All' && prop.city.toLowerCase() !== filters.city.toLowerCase()) {
          return false;
        }

        // 4. Price Range Filter
        if (filters.minPrice !== null && prop.price < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== null && prop.price > filters.maxPrice) {
          return false;
        }

        // 5. Area Size Filter
        const propArea = getPropertyArea(prop);
        if (filters.minArea !== null && propArea < filters.minArea) {
          return false;
        }
        if (filters.maxArea !== null && propArea > filters.maxArea) {
          return false;
        }

        // 6. Availability Status Filter
        if (filters.availability !== 'All') {
          const avail = prop.availability.toLowerCase();
          const filterAvail = filters.availability.toLowerCase();
          if (filterAvail === 'ready to move') {
            if (!avail.includes('ready') && !avail.includes('immediate')) return false;
          } else if (filterAvail === 'under construction') {
            if (!avail.includes('construction') && !avail.includes('phase')) return false;
          } else if (filterAvail === 'immediate possession') {
            if (!avail.includes('immediate') && !avail.includes('ready')) return false;
          } else if (!avail.includes(filterAvail)) {
            return false;
          }
        }

        // 7. BHK Configuration Filter (Residential & Mixed Projects)
        if (filters.bhk.length > 0) {
          const matchesBhk = filters.bhk.some((selectedBhk) => {
            if (prop.residentialSpecs) {
              const bhkStr = prop.residentialSpecs.bhk || '';
              const beds = prop.residentialSpecs.bedrooms || 0;
              if (selectedBhk === '1 BHK') return bhkStr.includes('1') || bhkStr.includes('Studio') || beds === 1;
              if (selectedBhk === '2 BHK') return bhkStr.includes('2') || beds === 2;
              if (selectedBhk === '3 BHK') return bhkStr.includes('3') || beds === 3;
              if (selectedBhk === '4 BHK') return bhkStr.includes('4') || beds === 4;
              if (selectedBhk === '5 BHK+') return bhkStr.includes('5') || beds >= 5;
            }
            if (prop.projectSpecs?.configurations) {
              const conf = prop.projectSpecs.configurations;
              if (selectedBhk === '1 BHK') return conf.includes('1');
              if (selectedBhk === '2 BHK') return conf.includes('2');
              if (selectedBhk === '3 BHK') return conf.includes('3');
              if (selectedBhk === '4 BHK') return conf.includes('4');
              if (selectedBhk === '5 BHK+') return conf.includes('5');
            }
            return false;
          });
          if (!matchesBhk) return false;
        }

        // 8. Parking Filter
        if (filters.parking !== 'All') {
          const parkingText = (
            prop.residentialSpecs?.parking ||
            prop.commercialSpecs?.parking ||
            ''
          ).toLowerCase();
          if (filters.parking === '1+') {
            if (!parkingText || parkingText.includes('no')) return false;
          } else if (filters.parking === '2+') {
            const match =
              parkingText.includes('2') ||
              parkingText.includes('3') ||
              parkingText.includes('4') ||
              parkingText.includes('250') ||
              parkingText.includes('ample') ||
              parkingText.includes('valet');
            if (!match) return false;
          } else if (filters.parking === '3+') {
            const match =
              parkingText.includes('3') ||
              parkingText.includes('4') ||
              parkingText.includes('250') ||
              parkingText.includes('portico') ||
              parkingText.includes('private');
            if (!match) return false;
          }
        }

        // 9. Furnishing Filter (Commercial)
        if (filters.furnishing !== 'All') {
          const matchFurnishing =
            prop.commercialSpecs?.furnishing === filters.furnishing ||
            prop.highlights.some((h) => h.toLowerCase().includes(filters.furnishing.toLowerCase()));
          if (!matchFurnishing) return false;
        }

        // 10. Zoning Filter (Land)
        if (filters.zoning !== 'All') {
          const zoningText = (prop.landSpecs?.zoning || '').toLowerCase();
          const filterZoningKey = filters.zoning.toLowerCase().split(' ')[0];
          if (!zoningText.includes(filterZoningKey)) return false;
        }

        // 11. Facing Filter
        if (filters.facing !== 'All') {
          const facingText = (
            prop.residentialSpecs?.facing ||
            prop.landSpecs?.facing ||
            ''
          ).toLowerCase();
          if (!facingText.includes(filters.facing.toLowerCase())) return false;
        }

        // 12. Full-Text Search Query Filter
        if (filters.query.trim()) {
          const q = filters.query.toLowerCase().trim();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchLoc = prop.location.toLowerCase().includes(q);
          const matchCity = prop.city.toLowerCase().includes(q);
          const matchState = prop.state.toLowerCase().includes(q);
          const matchDev = prop.developer.toLowerCase().includes(q);
          const matchCode = prop.code.toLowerCase().includes(q);
          const matchSub = prop.subtype.toLowerCase().includes(q);
          const matchCat = prop.mainCategory.toLowerCase().includes(q);
          const matchDesc = prop.description.toLowerCase().includes(q);
          const matchHighlights = prop.highlights.some((h) => h.toLowerCase().includes(q));
          const matchSpecs =
            (prop.residentialSpecs?.bhk?.toLowerCase().includes(q) ?? false) ||
            (prop.residentialSpecs?.societyOrProject?.toLowerCase().includes(q) ?? false) ||
            (prop.commercialSpecs?.building?.toLowerCase().includes(q) ?? false) ||
            (prop.commercialSpecs?.furnishing?.toLowerCase().includes(q) ?? false) ||
            (prop.landSpecs?.zoning?.toLowerCase().includes(q) ?? false) ||
            (prop.projectSpecs?.configurations?.toLowerCase().includes(q) ?? false);

          if (
            !matchTitle &&
            !matchLoc &&
            !matchCity &&
            !matchState &&
            !matchDev &&
            !matchCode &&
            !matchSub &&
            !matchCat &&
            !matchDesc &&
            !matchHighlights &&
            !matchSpecs
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'area-asc') return getPropertyArea(a) - getPropertyArea(b);
        if (filters.sortBy === 'area-desc') return getPropertyArea(b) - getPropertyArea(a);
        if (filters.sortBy === 'code-asc') return a.code.localeCompare(b.code);
        // default: 'featured'
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [fullCatalog, filters]);

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        {/* ========================================================================= */}
        {/* 1. HERO BANNER: "Discover Your Dream Property" */}
        {/* ========================================================================= */}
        <PropertyDiscoveryHero totalCount={fullCatalog.length} />

        {/* ========================================================================= */}
        {/* 2. QUICK SEARCH & TOOLBAR */}
        {/* ========================================================================= */}
        <PropertyQuickFilterBar
          filters={filters}
          onChangeFilters={updateFiltersAndUrl}
          onResetFilters={handleResetFilters}
          availableCities={availableCities}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          activeFilterCount={activeFilterCount}
        />

        {/* ========================================================================= */}
        {/* 3. PROPERTY CATEGORY NAVIGATION PILLS */}
        {/* ========================================================================= */}
        <PropertyCategoryPills
          selectedCategory={filters.category}
          onSelectCategory={handleSelectCategory}
          selectedSubtype={filters.subtype}
          onSelectSubtype={handleSelectSubtype}
          countsBySubtype={countsBySubtype}
          totalCount={fullCatalog.length}
        />

        {/* ========================================================================= */}
        {/* 4. MAIN CONTENT AREA: 4-COLUMN PROPERTY GRID + RIGHT FILTER SIDEBAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* A. Property Grid Column */}
          <div className="flex-1 min-w-0 space-y-4 w-full">
            {/* Header: Result Count + Active Filter Tags + Sort */}
            <div className="bg-white dark:bg-[#141A24] px-4 py-3 rounded-xl border border-slate-200/90 dark:border-[#242F42] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Showing <span className="text-blue-600 dark:text-sky-400 font-extrabold">{filteredProperties.length}</span> properties
                </span>

                {/* Active Filter Chips */}
                {filters.subtype && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 text-[11px] font-semibold border border-blue-200 dark:border-sky-800/60">
                    {filters.subtype}
                    <button
                      type="button"
                      onClick={() => updateFiltersAndUrl({ subtype: null })}
                      className="hover:text-blue-950 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.city !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                    {filters.city}
                    <button
                      type="button"
                      onClick={() => updateFiltersAndUrl({ city: 'All' })}
                      className="hover:text-slate-950 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.pricePreset !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800/60">
                    {PRICE_PRESETS.find((p) => p.id === filters.pricePreset)?.label}
                    <button
                      type="button"
                      onClick={() => updateFiltersAndUrl({ pricePreset: 'all', minPrice: null, maxPrice: null })}
                      className="hover:text-amber-950 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.bhk.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 text-[11px] font-semibold border border-blue-200 dark:border-sky-800/60"
                  >
                    {b}
                    <button
                      type="button"
                      onClick={() =>
                        updateFiltersAndUrl({
                          bhk: filters.bhk.filter((x) => x !== b),
                        })
                      }
                      className="hover:text-blue-950 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Sort */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFiltersAndUrl({ sortBy: e.target.value as any })}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-7"
                  >
                    <option value="featured">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="area-asc">Area: Low to High</option>
                    <option value="area-desc">Area: High to Low</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* B. Property Cards Grid */}
            {isLoading ? (
              <div
                className={`grid gap-5 animate-pulse ${
                  isSidebarOpen
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-96 bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] overflow-hidden"
                  >
                    <div className="h-48 bg-slate-100 dark:bg-slate-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-100/60 dark:bg-slate-800/60 rounded w-1/2" />
                      <div className="h-14 bg-slate-50 dark:bg-slate-800/40 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <PropertyEmptyState
                onReset={handleResetFilters}
                searchTerm={filters.query}
                selectedSubtype={filters.subtype}
                selectedCategory={filters.category}
              />
            ) : (
              <div
                className={`grid gap-5 ${
                  isSidebarOpen
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {filteredProperties.map((property) => (
                  <PropertyDiscoveryCard
                    key={property.id}
                    property={property}
                    onViewDetails={(p) => navigate(`/discovery/${p.id}`)}
                    onInquire={(p) => navigate(`/discovery/${p.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* C. Right-Side Filter Sidebar Panel (Desktop sticky / Mobile collapsible) */}
          {isSidebarOpen && (
            <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-4">
              <PropertyFilterSidebar
                filters={filters}
                onChangeFilters={updateFiltersAndUrl}
                onResetFilters={handleResetFilters}
                availableCities={availableCities}
                activeFilterCount={activeFilterCount}
              />
            </div>
          )}
        </div>

        {/* 5. Inspection Modal Fallback */}
        <PropertyDiscoveryDetailModal
          isOpen={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          property={selectedProperty}
        />
      </div>
    </AppShell>
  );
};
