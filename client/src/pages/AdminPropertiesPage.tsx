import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { propertyListingService, PropertyImageRecord } from '../services/propertyListing.service';
import type { PropertyMainCategory } from '../types/discovery.types';
import { AppShell } from '../components/layout/AppShell';
import { AdminPropertyFormModal } from '../components/admin/AdminPropertyFormModal';
import { AdminImageUploadModal } from '../components/admin/AdminImageUploadModal';
import { Button } from '../components/ui/Button';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  MapPin,
  Image as ImageIcon,
  Edit,
  Archive,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Home,
  Briefcase,
  Layers,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';

export interface AdminPropertyItem {
  id: string;
  title: string;
  code: string;
  main_category: PropertyMainCategory;
  subtype: string;
  price: number;
  price_label?: string;
  price_per_sqft?: number;
  location: string;
  city: string;
  state?: string;
  developer?: string;
  availability?: string;
  status?: string;
  description?: string;
  highlights?: string[];
  address_details?: Record<string, any>;
  specs_data?: Record<string, any>;
  cover_image?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
  images?: PropertyImageRecord[];
}

export const AdminPropertiesPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'archived'>('active');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminPropertyItem | null>(null);
  const [imageModalProperty, setImageModalProperty] = useState<AdminPropertyItem | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyListingService.list({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        is_active: selectedStatus === 'active' ? 1 : selectedStatus === 'archived' ? 0 : undefined,
        limit: 100,
      });

      let list: AdminPropertyItem[] = response.properties || [];

      // Sort client-side
      if (sortBy === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      }

      setProperties(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load property listings.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery, sortBy]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Dynamic Metrics
  const metrics = useMemo(() => {
    const total = properties.length;
    const residential = properties.filter((p) => p.main_category === 'Residential').length;
    const commercial = properties.filter((p) => p.main_category === 'Commercial').length;
    const land = properties.filter((p) => p.main_category === 'Land').length;
    const projects = properties.filter((p) => p.main_category === 'Projects').length;
    const archived = properties.filter((p) => p.is_active === 0 || p.status === 'Archived').length;
    const active = total - archived;
    return { total, residential, commercial, land, projects, archived, active };
  }, [properties]);

  const handleCreateNew = () => {
    setEditingProperty(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (prop: AdminPropertyItem) => {
    setEditingProperty(prop);
    setIsFormModalOpen(true);
  };

  const handleManageImages = (prop: AdminPropertyItem) => {
    setImageModalProperty(prop);
  };

  const handleToggleArchive = async (prop: AdminPropertyItem) => {
    const isArchived = prop.is_active === 0 || prop.status === 'Archived';
    const action = isArchived ? 'Restore' : 'Archive';
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} "${prop.title}"?`)) {
      return;
    }

    try {
      if (isArchived) {
        await propertyListingService.restore(prop.id);
        showToast({
          variant: 'success',
          message: `Property "${prop.title}" restored to active portfolio.`,
        });
      } else {
        await propertyListingService.archive(prop.id);
        showToast({
          variant: 'info',
          message: `Property "${prop.title}" archived safely without data loss.`,
        });
      }
      fetchProperties();
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: err.message || `Failed to ${action.toLowerCase()} property.`,
      });
    }
  };

  const formatDisplayPrice = (price: number) => {
    if (!price || price <= 0) return 'Price on Request';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lacs`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Residential':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      case 'Commercial':
        return 'bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 border-stone-200 dark:border-[#242F42]';
      case 'Land':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'Projects':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800/60';
      default:
        return 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-[#242F42]';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in text-stone-900 dark:text-slate-100">
        {/* Top Header Banner */}
        <div className="bg-white dark:bg-[#141A24] p-6 md:p-8 rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs relative overflow-hidden text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Real Estate Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                Property Portfolio Master
              </h1>
              <p className="text-stone-500 dark:text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
                Add, edit, categorize, and upload high-resolution photo galleries across all 19 real-estate classifications. All updates synchronize instantly with Customer Discovery.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/discovery')}
                leftIcon={<ExternalLink className="w-4 h-4" />}
                className="border-stone-300 dark:border-[#242F42] bg-white dark:bg-[#101622] hover:bg-stone-50 dark:hover:bg-[#1A2230] text-stone-700 dark:text-slate-200"
              >
                Customer Discovery
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateNew}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-600 text-white dark:text-stone-950 font-semibold shadow-xs border-0"
              >
                Add New Property
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400 text-xs font-medium">
              <span>Total Listings</span>
              <Layers className="w-4 h-4 text-stone-400 dark:text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-slate-100 mt-2">{metrics.total}</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">{metrics.active} Active Portfolio</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400 text-xs font-medium">
              <span>Residential</span>
              <Home className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-slate-100 mt-2">{metrics.residential}</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">Villas, Apts, Flats</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400 text-xs font-medium">
              <span>Commercial</span>
              <Briefcase className="w-4 h-4 text-stone-500 dark:text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-slate-100 mt-2">{metrics.commercial}</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">Offices, Retail, Malls</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400 text-xs font-medium">
              <span>Land & Plots</span>
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-slate-100 mt-2">{metrics.land}</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">Commercial & Farmland</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400 text-xs font-medium">
              <span>Mega Projects</span>
              <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-slate-100 mt-2">{metrics.projects}</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">Townships & Communities</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs hover:border-stone-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-stone-500 dark:text-slate-400 text-xs font-medium">
              <span>Archived</span>
              <Archive className="w-4 h-4 text-stone-400 dark:text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-stone-700 dark:text-slate-300 mt-2">{metrics.archived}</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">Safely preserved</div>
          </div>
        </div>

        {/* Search, Filter & Control Toolbar */}
        <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] p-4 shadow-xs space-y-4 text-left">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, code, city, locality..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 focus:border-amber-700"
              />
            </div>

            {/* Controls Right */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-stone-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 focus:border-amber-700 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land & Plots</option>
                  <option value="Projects">Master Projects</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="appearance-none bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-stone-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 focus:border-amber-700 cursor-pointer"
                >
                  <option value="active">Active Only</option>
                  <option value="archived">Archived Only</option>
                  <option value="all">All Status</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-stone-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-[#141A24] focus:ring-2 focus:ring-amber-800/20 focus:border-amber-700 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={fetchProperties}
                className="p-2 rounded-xl bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-[#1A2230] transition-colors cursor-pointer"
                title="Refresh listings"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-700 dark:text-amber-400' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl bg-stone-100 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white dark:bg-[#1E293B] text-stone-900 dark:text-amber-400 shadow-xs' : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white dark:bg-[#1E293B] text-stone-900 dark:text-amber-400 shadow-xs' : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading && properties.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42]">
            <RefreshCw className="w-8 h-8 text-amber-700 dark:text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700 dark:text-slate-300">Loading property portfolio...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-2xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-800/40 text-red-800 dark:text-rose-300">
            <p className="font-semibold text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProperties} className="mt-3">
              Try Again
            </Button>
          </div>
        ) : properties.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#141A24] border border-stone-200/90 dark:border-[#242F42] shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center mx-auto text-amber-800 dark:text-amber-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">No properties found</h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                No real-estate listings match your current filters. Add a new property or adjust your search.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNew}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-600 text-white dark:text-stone-950 font-semibold border-0 shadow-xs"
            >
              Add New Property
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] shadow-xs overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-[#242F42] bg-stone-50/80 dark:bg-[#101622] text-[11px] font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Property & Code</th>
                    <th className="py-3.5 px-4">Category / Subtype</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Specs & Media</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-[#242F42] text-xs">
                  {properties.map((prop) => {
                    const coverUrl = prop.images?.find((img: PropertyImageRecord) => img.is_cover === 1)?.url || prop.cover_image || prop.images?.[0]?.url || '/images/projects/skyline-marina-towers.jpg';
                    const galleryCount = prop.images?.length || 0;
                    const isArchived = prop.is_active === 0 || prop.status === 'Archived';
                    const specs = prop.specs_data?.residentialSpecs || prop.specs_data?.landSpecs || prop.specs_data?.commercialSpecs || prop.specs_data?.projectSpecs || {};

                    return (
                      <tr
                        key={prop.id}
                        className={`hover:bg-stone-50/70 dark:hover:bg-[#1A2230] transition-colors ${
                          isArchived ? 'opacity-60 bg-stone-50/40 dark:bg-stone-900/20' : ''
                        }`}
                      >
                        {/* Property & Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-stone-100 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] shrink-0 group">
                              <img
                                src={coverUrl}
                                alt={prop.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 dark:text-slate-100 leading-snug line-clamp-1 max-w-[220px]">
                                {prop.title}
                              </div>
                              <div className="text-[11px] font-mono text-amber-900 dark:text-amber-400 font-semibold mt-0.5">
                                {prop.code}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Subtype */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                                prop.main_category
                              )}`}
                            >
                              {prop.main_category}
                            </span>
                            <div className="text-[11px] text-stone-600 dark:text-slate-400 capitalize">
                              {prop.subtype}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-1.5 text-stone-600 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-stone-900 dark:text-slate-100 line-clamp-1">{prop.location}</div>
                              <div className="text-[11px] text-stone-500 dark:text-slate-400">
                                {prop.city}{prop.state ? `, ${prop.state}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-900 dark:text-slate-100 text-sm">
                            {formatDisplayPrice(prop.price)}
                          </div>
                          {prop.price_per_sqft && (
                            <div className="text-[10px] text-stone-500 dark:text-slate-400 font-mono">
                              ₹{prop.price_per_sqft.toLocaleString('en-IN')}/sq.ft
                            </div>
                          )}
                        </td>

                        {/* Specs & Media */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="text-[11px] text-stone-700 dark:text-slate-300 font-medium">
                              {specs.builtUpArea ? `${specs.builtUpArea} sq.ft` : specs.plotArea ? `${specs.plotArea}` : specs.commercialArea ? `${specs.commercialArea} sq.ft` : specs.landParcel ? `${specs.landParcel}` : 'Custom Specifications'}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleManageImages(prop)}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-medium transition-colors cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{galleryCount} Photos</span>
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isArchived ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-[#242F42]">
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              {prop.availability || 'Active'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/discovery/${prop.id}`)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                              title="View in Customer Discovery"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleManageImages(prop)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] text-stone-700 dark:text-slate-300 hover:text-stone-950 dark:hover:text-slate-100 transition-colors cursor-pointer"
                              title="Manage Property Images"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(prop)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] text-stone-700 dark:text-slate-300 hover:text-stone-950 dark:hover:text-slate-100 transition-colors cursor-pointer"
                              title="Edit Specifications"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(prop)}
                              className={`p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] transition-colors cursor-pointer ${
                                isArchived
                                  ? 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900'
                                  : 'text-stone-500 dark:text-slate-400 hover:text-rose-700'
                              }`}
                              title={isArchived ? 'Restore Listing' : 'Archive Listing'}
                            >
                              {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {properties.map((prop) => {
              const coverUrl = prop.images?.find((img: PropertyImageRecord) => img.is_cover === 1)?.url || prop.cover_image || prop.images?.[0]?.url || '/images/projects/skyline-marina-towers.jpg';
              const galleryCount = prop.images?.length || 0;
              const isArchived = prop.is_active === 0 || prop.status === 'Archived';
              const specs = prop.specs_data?.residentialSpecs || prop.specs_data?.landSpecs || prop.specs_data?.commercialSpecs || prop.specs_data?.projectSpecs || {};

              return (
                <div
                  key={prop.id}
                  className={`bg-white dark:bg-[#141A24] rounded-2xl border border-stone-200/90 dark:border-[#242F42] hover:border-stone-400/80 dark:hover:border-slate-500 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                    isArchived ? 'opacity-60 bg-stone-50/40 dark:bg-stone-900/20' : ''
                  }`}
                >
                  {/* Card Image Cover */}
                  <div className="relative aspect-video w-full bg-stone-100 dark:bg-[#101622] overflow-hidden group">
                    <img
                      src={coverUrl}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-black/20" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${getCategoryBadgeClass(
                          prop.main_category
                        )}`}
                      >
                        {prop.main_category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-stone-900/80 text-white backdrop-blur-md border border-white/10">
                        {prop.code}
                      </span>
                    </div>

                    {/* Bottom overlay in image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                      <div>
                        <span className="text-lg font-bold text-white font-sans">
                          {formatDisplayPrice(prop.price)}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-stone-900/80 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
                        <ImageIcon className="w-3 h-3" />
                        {galleryCount}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-slate-100 text-base leading-snug line-clamp-1">
                        {prop.title}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0 text-stone-400 dark:text-slate-500" />
                        <span className="truncate">{prop.location}, {prop.city}</span>
                      </p>
                    </div>

                    {/* Quick Specs */}
                    <div className="pt-2 border-t border-stone-100 dark:border-[#242F42] grid grid-cols-2 gap-2 text-[11px] text-stone-700 dark:text-slate-300">
                      <div>
                        <span className="text-stone-400 dark:text-slate-500 block text-[10px]">Type</span>
                        <span className="font-medium capitalize">{prop.subtype}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 dark:text-slate-500 block text-[10px]">Specs / Area</span>
                        <span className="font-medium">{specs.builtUpArea ? `${specs.builtUpArea} sq.ft` : specs.plotArea ? `${specs.plotArea}` : specs.commercialArea ? `${specs.commercialArea} sq.ft` : specs.landParcel ? `${specs.landParcel}` : 'Custom'}</span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-stone-100 dark:border-[#242F42] flex items-center justify-between gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/discovery/${prop.id}`)}
                        leftIcon={<ExternalLink className="w-3 h-3" />}
                        className="text-[11px] border-stone-200 dark:border-[#242F42] bg-white dark:bg-[#101622] hover:bg-stone-50 dark:hover:bg-[#1A2230] text-stone-700 dark:text-slate-200"
                      >
                        Explore
                      </Button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleManageImages(prop)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] text-stone-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Images"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(prop)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] text-stone-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(prop)}
                          className={`p-1.5 rounded-lg bg-stone-100 dark:bg-[#101622] hover:bg-stone-200 dark:hover:bg-[#1A2230] transition-colors cursor-pointer ${
                            isArchived ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-slate-400 hover:text-rose-700'
                          }`}
                          title={isArchived ? 'Restore' : 'Archive'}
                        >
                          {isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        <AdminPropertyFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          initialData={editingProperty}
          onSuccess={() => {
            fetchProperties();
          }}
        />

        {imageModalProperty && (
          <AdminImageUploadModal
            isOpen={!!imageModalProperty}
            onClose={() => setImageModalProperty(null)}
            property={imageModalProperty}
            onSuccess={() => {
              fetchProperties();
            }}
          />
        )}
      </div>
    </AppShell>
  );
};
