import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useWishlist } from '../context/WishlistContext';
import { projectService } from '../services/project.service';
import { unitService } from '../services/unit.service';
import { propertyListingService } from '../services/propertyListing.service';
import { buildDiscoveryCatalog, PROPERTY_TYPES_CATALOG } from '../utils/discoveryData';
import { PropertyProject, PropertyUnit } from '../types/property.types';
import { PropertyMainCategory } from '../types/discovery.types';
import {
  Search,
  Heart,
  ArrowRight,
  MapPin,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';

export const CustomerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PropertyMainCategory>('Residential');
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);

  // Data fetching
  const [dbProjects, setDbProjects] = useState<PropertyProject[]>([]);
  const [dbUnits, setDbUnits] = useState<PropertyUnit[]>([]);
  const [dbListings, setDbListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [projRes, unitsRes, listingsRes] = await Promise.all([
          projectService.list({ limit: 50 }).catch(() => ({ projects: [] })),
          unitService.list({ limit: 100 }).catch(() => ({ units: [] })),
          propertyListingService.list({ limit: 50 }).catch(() => ({ properties: [] })),
        ]);

        if (isMounted) {
          setDbProjects(projRes.projects || []);
          setDbUnits(unitsRes.units || []);
          setDbListings(listingsRes.properties || []);
        }
      } catch (err) {
        console.error('Failed to load customer home data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build full catalog
  const fullCatalog = useMemo(() => {
    return buildDiscoveryCatalog(dbProjects, dbUnits, dbListings);
  }, [dbProjects, dbUnits, dbListings]);

  // Clean, realistic property list (filter out test records)
  const cleanProperties = useMemo(() => {
    return fullCatalog.filter((p) => {
      const t = p.title.toLowerCase();
      const c = (p.code || '').toLowerCase();
      return !t.includes('test_') && !t.includes('sample flat') && !c.includes('test_');
    });
  }, [fullCatalog]);

  // Category types list
  const categoryTypes = useMemo(() => {
    return PROPERTY_TYPES_CATALOG.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Filtered featured properties
  const featuredProperties = useMemo(() => {
    let list = cleanProperties;

    if (selectedSubtype) {
      list = list.filter((p) => p.subtype === selectedSubtype);
    } else if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((p) => p.mainCategory === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.subtype.toLowerCase().includes(q)
      );
    }

    // Limit to top 8 properties for a spacious display
    return list.slice(0, 8);
  }, [cleanProperties, selectedCategory, selectedSubtype, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discovery?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discovery');
    }
  };

  const categories: { id: PropertyMainCategory; label: string; count: number }[] = [
    {
      id: 'Residential',
      label: 'Residential',
      count: cleanProperties.filter((p) => p.mainCategory === 'Residential').length,
    },
    {
      id: 'Land',
      label: 'Land Parcels',
      count: cleanProperties.filter((p) => p.mainCategory === 'Land').length,
    },
    {
      id: 'Commercial',
      label: 'Commercial',
      count: cleanProperties.filter((p) => p.mainCategory === 'Commercial').length,
    },
    {
      id: 'Projects',
      label: 'Master Projects',
      count: cleanProperties.filter((p) => p.mainCategory === 'Projects').length,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-12 animate-fade-in text-left pb-12">
        {/* ========================================================================= */}
        {/* 1. HERO SEARCH BANNER */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#F5F2EC] to-[#EBE6DC] dark:from-[#141A24] dark:to-[#0F141D] border border-stone-200/80 dark:border-[#242F42] p-6 sm:p-10 lg:p-14 shadow-subtle text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#1A2230]/80 border border-stone-200/80 dark:border-[#242F42] text-xs font-semibold text-amber-900 dark:text-amber-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Verified SKYLINE Real Estate Discovery</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-slate-100 font-sans leading-tight">
              Find a place you'll love.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              Explore properties that match what you're looking for across prime residential, commercial, and master developments.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto pt-2">
              <div className="flex items-center bg-white dark:bg-[#1A2230] rounded-2xl border border-stone-300 dark:border-[#2E3C54] shadow-md p-1.5 transition-all focus-within:border-stone-500 dark:focus-within:border-amber-400/50 focus-within:ring-4 focus-within:ring-amber-500/10">
                <div className="pl-4 text-stone-400 dark:text-slate-500 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by property, location or city..."
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Quick Micro-links */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500 dark:text-slate-400 pt-1">
              <span className="font-semibold text-stone-400 dark:text-slate-500">Popular:</span>
              {['Apartment', 'Villa', 'Penthouse', 'Commercial Plot', 'Office'].map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => navigate(`/discovery?type=${encodeURIComponent(pop)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-[#1A2230]/70 hover:bg-white dark:hover:bg-[#1A2230] border border-stone-200/80 dark:border-[#242F42] text-[11px] font-medium text-stone-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {pop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. "WHAT ARE YOU LOOKING FOR?" CATEGORY SHOWCASE */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 dark:border-[#242F42] pb-4">
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                Explore Classifications
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100 mt-1">
                WHAT ARE YOU LOOKING FOR?
              </h2>
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-[#141A24] rounded-2xl border border-stone-200/80 dark:border-[#242F42] overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubtype(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-white dark:bg-[#1A2230] text-stone-900 dark:text-slate-100 shadow-xs border border-stone-200/80 dark:border-[#242F42]'
                      : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Visual Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryTypes.map((typeItem) => {
              const isSelected = selectedSubtype === typeItem.id;
              const count = cleanProperties.filter((p) => p.subtype === typeItem.id).length;

              return (
                <div
                  key={typeItem.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSubtype(null);
                    } else {
                      setSelectedSubtype(typeItem.id);
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer bg-white dark:bg-[#141A24] text-left shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-400'
                      : 'border-stone-200/80 dark:border-[#242F42] hover:border-stone-400 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Category Image */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-[#101622] relative">
                    <img
                      src={typeItem.image}
                      alt={typeItem.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/classifications/apartment.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {typeItem.tag}
                      </span>
                    </div>

                    {/* Count Pill */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#141A24]/90 text-[10px] font-bold text-stone-900 dark:text-slate-100 shadow-xs">
                        {count} {count === 1 ? 'Listing' : 'Listings'}
                      </span>
                    </div>
                  </div>

                  {/* Label & Description */}
                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-stone-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {typeItem.label}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 line-clamp-1">
                      {typeItem.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FEATURED / RECOMMENDED PROPERTIES SHOWCASE */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-[#242F42] pb-4">
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                Curated Recommendations
              </span>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100">
                  Featured Properties
                </h2>
                {selectedSubtype && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <span>Filtering: {selectedSubtype}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubtype(null)}
                      className="hover:text-amber-950 dark:hover:text-amber-100 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/discovery"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors group"
            >
              <span>View All Properties ({cleanProperties.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Properties Grid: Spacious and Image-Focused */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" variant="primary" />
              <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">Loading featured properties...</span>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((prop) => {
                const saved = isSaved(prop.id);
                const areaInfo =
                  prop.residentialSpecs?.carpetArea
                    ? `${prop.residentialSpecs.carpetArea} sq.ft (${prop.residentialSpecs.bhk || ''})`
                    : prop.commercialSpecs?.commercialArea
                    ? `${prop.commercialSpecs.commercialArea} sq.ft Commercial`
                    : prop.landSpecs?.plotArea
                    ? `${prop.landSpecs.plotArea} sq.ft Plot`
                    : prop.projectSpecs?.landParcel
                    ? prop.projectSpecs.landParcel
                    : 'Spacious Configuration';

                const highlight = prop.highlights?.[0] || 'Premium location with verified documentation';

                return (
                  <div
                    key={prop.id}
                    className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group text-left"
                  >
                    {/* Cover Image Container */}
                    <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-[#101622] relative">
                      <Link to={`/discovery/${prop.id}`}>
                        <img
                          src={prop.images.cover}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/classifications/apartment.jpg';
                          }}
                        />
                      </Link>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#141A24]/90 backdrop-blur-md text-[10px] font-bold text-stone-900 dark:text-slate-100 shadow-xs">
                          {prop.subtype}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold text-white shadow-xs">
                          {prop.availability}
                        </span>
                      </div>

                      {/* Wishlist Heart Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(prop);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform hover:scale-110 cursor-pointer shadow-md ${
                          saved
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/85 dark:bg-[#141A24]/85 text-stone-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400'
                        }`}
                        title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Title & Location */}
                        <div>
                          <Link to={`/discovery/${prop.id}`}>
                            <h3 className="font-bold text-base text-stone-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer">
                              {prop.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {prop.location}, {prop.city}
                            </span>
                          </div>
                        </div>

                        {/* Price Banner */}
                        <div className="pt-1">
                          <span className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-slate-100 font-sans tracking-tight">
                            {prop.priceLabel}
                          </span>
                        </div>

                        {/* Area / Configuration */}
                        <div className="text-xs text-stone-600 dark:text-slate-300 font-medium">
                          {areaInfo}
                        </div>

                        {/* One-Line Highlight */}
                        <div className="p-2.5 bg-stone-50 dark:bg-[#101622] rounded-xl border border-stone-200/80 dark:border-[#242F42] text-[11px] text-stone-600 dark:text-slate-400 line-clamp-1">
                          ✨ {highlight}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-stone-100 dark:border-[#242F42] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSave(prop)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            saved
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-stone-50 dark:bg-[#101622] text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-[#1A2230] border border-stone-200/80 dark:border-[#242F42]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current text-rose-600' : ''}`} />
                          <span>{saved ? 'Saved' : 'Save'}</span>
                        </button>

                        <Link
                          to={`/discovery/${prop.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs font-bold transition-colors shadow-xs"
                        >
                          <span>View Property</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-dashed border-stone-300 dark:border-[#242F42] text-center space-y-3 bg-stone-50/50 dark:bg-[#101622]/50">
              <p className="text-sm font-semibold text-stone-700 dark:text-slate-300">
                No properties match your current category selection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Residential');
                  setSelectedSubtype(null);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
