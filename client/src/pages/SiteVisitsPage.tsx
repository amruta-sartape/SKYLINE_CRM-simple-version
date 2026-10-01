import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
import { useToast } from '../context/ToastContext';
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
  Building,
  User,
  Eye,
  CheckCircle2,
  CalendarDays,
  RotateCcw,
} from 'lucide-react';

export const SiteVisitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [summary, setSummary] = useState<SiteVisitSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
      .then((res) => setProjects(res.projects || []))
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
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      setVisits(res.visits || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch site visits.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, selectedStatus, selectedProject, selectedExecutive, dateFrom, dateTo]);

  useEffect(() => {
    fetchVisits();
    fetchSummary();
  }, [fetchVisits, fetchSummary]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedProject('');
    setSelectedExecutive('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Site Visit Management
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {total} Records
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Coordinate property tours, prevent executive scheduling overlaps, and record client visit outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSelectedVisit(null);
                setIsScheduleModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Schedule Site Visit
            </Button>
          </div>
        </div>

        {/* KPI Stats Overview */}
        <SiteVisitStats summary={summary} isLoading={isLoadingStats} />

        {error && (
          <Alert
            variant="error"
            title="Unable to load site visits"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search buyer, phone, project code, or unit..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Visit Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>

            <div>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Property Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedExecutive}
                onChange={(e) => {
                  setSelectedExecutive(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Executives</option>
                {executives.map((exec) => (
                  <option key={exec.id} value={exec.id}>
                    {exec.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={clearFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Site Visits Data Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" variant="primary" />
              <span className="text-xs text-slate-500 font-medium">Loading site visits...</span>
            </div>
          ) : visits.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Site Visits Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {searchTerm || selectedStatus || selectedProject || selectedExecutive
                  ? 'No visits match your current filter selection. Try resetting filters.'
                  : 'Schedule customer on-site walkthroughs to track real estate buyer intent and feedback.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedVisit(null);
                  setIsScheduleModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Schedule First Visit
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Customer & Contact</th>
                    <th className="py-3 px-4">Property & Unit</th>
                    <th className="py-3 px-4">Visit Schedule</th>
                    <th className="py-3 px-4">Visit Type</th>
                    <th className="py-3 px-4">Assigned Executive</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Client Outcome</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/site-visits/${visit.id}`)}
                    >
                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                          {visit.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{visit.customer_phone}</span>
                          {visit.customer_email && <span>• {visit.customer_email}</span>}
                        </div>
                      </td>

                      {/* Property & Unit */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {visit.property_cover_image ? (
                            <img
                              src={visit.property_cover_image}
                              alt={visit.property_title || visit.project_name || 'Property'}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Building className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {visit.property_title || visit.project_name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              {visit.property_code && (
                                <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.2 rounded font-semibold">
                                  {visit.property_code}
                                </span>
                              )}
                              {visit.unit_number ? (
                                <span className="font-medium text-slate-700">
                                  Unit {visit.unit_number} ({visit.unit_configuration})
                                </span>
                              ) : (
                                <span className="italic text-slate-400">Sample Flat</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{visit.visit_date}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{visit.visit_time}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                          {visit.visit_type}
                        </span>
                      </td>

                      {/* Assigned Executive */}
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{visit.assigned_user_name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge siteVisitStatus={visit.visit_status} size="sm" />
                      </td>

                      {/* Outcome */}
                      <td className="py-3 px-4">
                        {visit.outcome ? (
                          <Badge siteVisitOutcome={visit.outcome} size="xs" />
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Pending visit</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* Reschedule button if Scheduled */}
                          {visit.visit_status === 'Scheduled' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVisit(visit);
                                setIsRescheduleModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Reschedule Visit Date/Time"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Complete / Status Resolution button */}
                          {visit.visit_status === 'Scheduled' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVisit(visit);
                                setIsStatusModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Record Completion Outcome or Cancel"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Detail Link */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/site-visits/${visit.id}`)}
                            rightIcon={<Eye className="w-3 h-3" />}
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
          )}

          {/* Pagination */}
          {!isLoading && visits.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, total)} of {total} visits
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="font-semibold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ScheduleSiteVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Visit Scheduled',
            message: 'Property site visit successfully booked.',
          });
          fetchVisits();
          fetchSummary();
        }}
      />

      <SiteVisitStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        visit={selectedVisit}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Status Updated',
            message: 'Site visit outcome recorded successfully.',
          });
          fetchVisits();
          fetchSummary();
        }}
      />

      <SiteVisitRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        visit={selectedVisit}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Visit Rescheduled',
            message: 'New site visit schedule confirmed.',
          });
          fetchVisits();
          fetchSummary();
        }}
      />
    </AppShell>
  );
};
