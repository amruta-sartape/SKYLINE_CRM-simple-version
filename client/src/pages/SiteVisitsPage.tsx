import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { SiteVisitStats } from '../components/siteVisit/SiteVisitStats';
import { ScheduleSiteVisitModal } from '../components/siteVisit/ScheduleSiteVisitModal';
import { SiteVisitStatusModal } from '../components/siteVisit/SiteVisitStatusModal';
import { SiteVisitRescheduleModal } from '../components/siteVisit/SiteVisitRescheduleModal';
import { siteVisitService } from '../services/siteVisit.service';
import { projectService } from '../services/project.service';
import { leadService } from '../services/lead.service';
import {
  SiteVisit,
  SiteVisitSummary,
  SiteVisitStatus,
} from '../types/siteVisit.types';
import { PropertyProject } from '../types/property.types';
import { UserSummary } from '../types/crm.types';
import {
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  CalendarDays,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  X,
  Phone,
} from 'lucide-react';

export const SiteVisitsPage: React.FC = () => {
  const navigate = useNavigate();

  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [summary, setSummary] = useState<SiteVisitSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Dropdown options
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [executives, setExecutives] = useState<UserSummary[]>([]);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);

  // Load dropdown data once
  useEffect(() => {
    projectService
      .list({ is_active: 1, limit: 100 })
      .then((res) => {
        // Filter out any automated test fixtures
        const cleanProjects = (res.projects || []).filter(
          (p) => !p.code.startsWith('TEST_') && !p.id.startsWith('TEST_')
        );
        setProjects(cleanProjects);
      })
      .catch((err) => console.warn('Failed to load projects:', err));

    leadService
      .getExecutives()
      .then(setExecutives)
      .catch((err) => console.warn('Failed to load executives:', err));
  }, []);

  // Fetch KPI summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await siteVisitService.getSummary();
      setSummary(data);
    } catch (err) {
      console.warn('Failed to fetch site visit summary:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch site visits list
  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await siteVisitService.list({
        page,
        limit,
        search: searchTerm || undefined,
        visit_status: (selectedStatus as SiteVisitStatus) || undefined,
        project_id: selectedProject || undefined,
        assigned_user_id: selectedExecutive || undefined,
      });

      // Filter out test fixture artifacts if any leaked in
      const cleanVisits = (res.visits || []).filter(
        (v) =>
          !v.property_code?.startsWith('TEST_') &&
          !v.customer_name?.startsWith('TEST_')
      );

      setVisits(cleanVisits);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch site visits.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, selectedStatus, selectedProject, selectedExecutive]);

  useEffect(() => {
    fetchVisits();
    fetchSummary();
  }, [fetchVisits, fetchSummary]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedProject('');
    setSelectedExecutive('');
    setPage(1);
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (selectedProject ? 1 : 0) +
    (selectedExecutive ? 1 : 0);

  // Helper: Format Date cleanly
  const formatVisitDate = (dateStr?: string): string => {
    if (!dateStr) return 'TBD';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      if (monthNames[monthIdx]) {
        return `${day} ${monthNames[monthIdx]} ${year}`;
      }
    }
    return dateStr;
  };

  // Helper: Format Time cleanly
  const formatVisitTime = (timeStr?: string): string => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const mins = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${mins} ${ampm}`;
    }
    return timeStr;
  };

  // Helper: Resolve reliable property image
  const getPropertyThumbnail = (visit: SiteVisit): string => {
    if (
      visit.property_cover_image &&
      !visit.property_cover_image.includes('placeholder') &&
      !visit.property_cover_image.includes('/uploads/')
    ) {
      return visit.property_cover_image;
    }
    const name = (visit.property_title || visit.project_name || '').toLowerCase();
    if (name.includes('aurora') || name.includes('penthouse')) return '/images/property-penthouse.jpg';
    if (name.includes('bayview')) return '/images/projects/project-bayview/exterior.jpg';
    if (name.includes('heights')) return '/images/projects/project-heights/exterior.jpg';
    if (name.includes('grandeur')) return '/images/projects/project-grandeur/exterior.jpg';
    if (name.includes('oasis')) return '/images/projects/project-oasis/exterior.jpg';
    if (name.includes('pinnacle')) return '/images/projects/project-grandeur/interior.jpg';
    return '/images/property-penthouse.jpg';
  };

  // Helper: Unit / Configuration display
  const getUnitDisplay = (visit: SiteVisit): string => {
    if (visit.unit_number) {
      return `Unit ${visit.unit_number} • ${visit.unit_configuration || 'Residence'}`;
    }
    if (visit.property_subtype) {
      return `${visit.property_subtype} • Property Tour`;
    }
    return 'Site Inspection Tour';
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        {/* 1. Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                Site Visit Management
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1A2230] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#242F42]">
                {total} Visits
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Coordinate property tours, prevent executive scheduling overlaps, and record client visit outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSelectedVisit(null);
                setIsScheduleModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold text-xs"
            >
              Schedule Site Visit
            </Button>
          </div>
        </div>

        {/* 2. Light KPI Summary Cards */}
        <SiteVisitStats summary={summary} isLoading={isLoadingStats} />

        {error && (
          <Alert
            variant="error"
            title="Unable to load site visits"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* 3. Search & Quick Filters Toolbar */}
        <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search buyer, phone, project or property..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#101622] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#101622] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="p-1 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Filter Dropdowns */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {/* Status Filter */}
              <div className="relative min-w-[140px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#101622] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-7"
                >
                  <option value="">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Property / Project Filter */}
              <div className="relative min-w-[170px] max-w-[200px]">
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#101622] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-7 truncate"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Executive Filter */}
              <div className="relative min-w-[140px]">
                <select
                  value={selectedExecutive}
                  onChange={(e) => {
                    setSelectedExecutive(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#101622] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#242F42] rounded-xl focus:outline-none focus:bg-white dark:focus:bg-[#101622] focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-7"
                >
                  <option value="">All Executives</option>
                  {executives.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset Button */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#242F42] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#1A2230] transition-colors cursor-pointer"
                  title="Reset filters"
                  aria-label="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex sm:hidden items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 w-full justify-center transition-all cursor-pointer ${
                  activeFiltersCount > 0
                    ? 'bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border-blue-200 dark:border-sky-800/60'
                    : 'bg-white dark:bg-[#141A24] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#242F42] hover:bg-slate-50 dark:hover:bg-[#1A2230]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="p-2 rounded-xl border border-slate-200 dark:border-[#242F42] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#1A2230] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Collapsible Filters */}
          {isFilterDrawerOpen && (
            <div className="sm:hidden grid grid-cols-1 gap-2.5 pt-3 border-t border-slate-100 dark:border-[#242F42] animate-fade-in">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Property Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Assigned Executive</label>
                <select
                  value={selectedExecutive}
                  onChange={(e) => {
                    setSelectedExecutive(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Executives</option>
                  {executives.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4. Main Site Visits Table (Desktop / Tablet) */}
        <div className="bg-white dark:bg-[#141A24] rounded-2xl border border-slate-200/90 dark:border-[#242F42] shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" variant="primary" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading site visits...</span>
            </div>
          ) : visits.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-2xs">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Site Visits Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {activeFiltersCount > 0
                  ? 'No visits match your current filter criteria. Try resetting filters.'
                  : 'Schedule customer on-site walkthroughs to track real estate buyer intent and feedback.'}
              </p>
              <div className="pt-2 flex justify-center gap-2">
                {activeFiltersCount > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    className="text-xs font-semibold"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedVisit(null);
                      setIsScheduleModalOpen(true);
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Schedule First Visit
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#101622]/90 border-b border-slate-200/80 dark:border-[#242F42] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Executive</th>
                      <th className="py-3 px-4">Status & Outcome</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#242F42]">
                    {visits.map((visit) => (
                      <tr
                        key={visit.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-[#1A2230]/50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/site-visits/${visit.id}`)}
                      >
                        {/* 1. Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                            {visit.customer_name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span className="font-mono">{visit.customer_phone}</span>
                          </div>
                        </td>

                        {/* 2. Property with Daylight Thumbnail */}
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetId = visit.property_id || visit.project_id || '';
                            if (targetId) navigate(`/discovery/${targetId}`);
                          }}
                        >
                          <div className="flex items-center gap-3 cursor-pointer group/prop" title="View Property Details">
                            <img
                              src={getPropertyThumbnail(visit)}
                              alt={visit.property_title || visit.project_name || 'Property'}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 dark:border-[#242F42] shrink-0 shadow-2xs group-hover/prop:ring-2 group-hover/prop:ring-blue-500/40 transition-all"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/property-penthouse.jpg';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover/prop:text-blue-600 dark:group-hover/prop:text-sky-400 transition-colors truncate max-w-[200px]">
                                {visit.property_title || visit.project_name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">
                                {getUnitDisplay(visit)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Schedule: Date & Time */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                            <span>{formatVisitDate(visit.visit_date)}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>{formatVisitTime(visit.visit_time)}</span>
                          </div>
                        </td>

                        {/* 4. Visit Type */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#101622] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-[#242F42] text-[10px] font-semibold">
                            {visit.visit_type}
                          </span>
                        </td>

                        {/* 5. Assigned Executive */}
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                            {visit.assigned_user_name || 'Unassigned'}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            Executive Agent
                          </div>
                        </td>

                        {/* 6. Status & Outcome */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <Badge siteVisitStatus={visit.visit_status} size="xs" />
                            {visit.outcome && (
                              <div>
                                <Badge siteVisitOutcome={visit.outcome} size="xs" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 7. Quick Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reschedule Button */}
                            {visit.visit_status === 'Scheduled' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVisit(visit);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800/60"
                                title="Reschedule Visit Date/Time"
                                aria-label="Reschedule Visit"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            {/* Record Outcome Button */}
                            {visit.visit_status === 'Scheduled' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVisit(visit);
                                  setIsStatusModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60"
                                title="Record Outcome or Complete"
                                aria-label="Record Outcome"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* View Detail Link */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const targetId = visit.property_id || visit.project_id || '';
                                if (targetId) {
                                  navigate(`/discovery/${targetId}`);
                                } else {
                                  navigate(`/site-visits/${visit.id}`);
                                }
                              }}
                              className="text-xs font-semibold bg-white dark:bg-[#1A2230] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#242F42] py-1 px-2.5"
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List (< 768px) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-[#242F42]">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-[#1A2230]/50 transition-colors"
                    onClick={() => navigate(`/site-visits/${visit.id}`)}
                  >
                    {/* Header: Customer + Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {visit.customer_name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{visit.customer_phone}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge siteVisitStatus={visit.visit_status} size="xs" />
                        {visit.outcome && (
                          <div className="mt-1">
                            <Badge siteVisitOutcome={visit.outcome} size="xs" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Property Thumbnail & Title */}
                    <div
                      className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-[#101622] rounded-xl border border-slate-100 dark:border-[#242F42] cursor-pointer hover:bg-blue-50/50 dark:hover:bg-[#1A2230] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetId = visit.property_id || visit.project_id || '';
                        if (targetId) navigate(`/discovery/${targetId}`);
                      }}
                      title="View Property Details"
                    >
                      <img
                        src={getPropertyThumbnail(visit)}
                        alt={visit.property_title || visit.project_name || 'Property'}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-[#242F42] shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/property-penthouse.jpg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                          {visit.property_title || visit.project_name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {getUnitDisplay(visit)}
                        </div>
                      </div>
                    </div>

                    {/* Schedule & Executive Row */}
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        <span>{formatVisitDate(visit.visit_date)}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-600 dark:text-slate-300">{formatVisitTime(visit.visit_time)}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[110px]">
                          {visit.assigned_user_name || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="pt-2 border-t border-slate-100 dark:border-[#242F42] flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {visit.visit_status === 'Scheduled' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVisit(visit);
                              setIsRescheduleModalOpen(true);
                            }}
                            className="text-xs text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVisit(visit);
                              setIsStatusModalOpen(true);
                            }}
                            className="text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            Outcome
                          </Button>
                        </>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const targetId = visit.property_id || visit.project_id || '';
                          if (targetId) {
                            navigate(`/discovery/${targetId}`);
                          } else {
                            navigate(`/site-visits/${visit.id}`);
                          }
                        }}
                        className="text-xs font-semibold bg-slate-900 dark:bg-amber-500 dark:text-slate-950 hover:bg-blue-600 dark:hover:bg-amber-600 text-white"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 5. Modals */}
        <ScheduleSiteVisitModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={() => {
            fetchVisits();
            fetchSummary();
          }}
        />

        <SiteVisitStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedVisit(null);
          }}
          onSuccess={() => {
            fetchVisits();
            fetchSummary();
          }}
          visit={selectedVisit}
        />

        <SiteVisitRescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setSelectedVisit(null);
          }}
          onSuccess={() => {
            fetchVisits();
            fetchSummary();
          }}
          visit={selectedVisit}
        />
      </div>
    </AppShell>
  );
};
