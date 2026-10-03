import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { FollowUpStats } from '../components/followUp/FollowUpStats';
import { FollowUpFormModal } from '../components/followUp/FollowUpFormModal';
import { CompleteFollowUpModal } from '../components/followUp/CompleteFollowUpModal';
import { FollowUpRescheduleModal } from '../components/followUp/FollowUpRescheduleModal';
import { followUpService } from '../services/followUp.service';
import { leadService } from '../services/lead.service';
import { useToast } from '../context/ToastContext';
import {
  FollowUpItem,
  FollowUpSummary,
  FollowUpType,
  FollowUpStatus,
} from '../types/followUp.types';
import { UserSummary } from '../types/crm.types';
import {
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  RotateCcw,
  Eye,
  PhoneCall,
  MessageSquare,
  Mail,
  Users,
  Video,
  User,
  XCircle,
} from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [summary, setSummary] = useState<FollowUpSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeView, setActiveView] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');

  // Dropdown options
  const [executives, setExecutives] = useState<UserSummary[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpItem | null>(null);

  useEffect(() => {
    leadService
      .getExecutives()
      .then(setExecutives)
      .catch((err) => console.warn('Failed to load executives:', err));
  }, []);

  const fetchSummary = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await followUpService.getSummary();
      setSummary(data);
    } catch (err) {
      console.warn('Failed to fetch follow-up summary:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await followUpService.list({
        page,
        limit,
        view: activeView,
        search: searchTerm || undefined,
        follow_up_type: (selectedType as FollowUpType) || undefined,
        status: (selectedStatus as FollowUpStatus) || undefined,
        assigned_user_id: selectedExecutive || undefined,
      });

      setFollowUps(res.followUps || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch follow-ups.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeView, searchTerm, selectedType, selectedStatus, selectedExecutive]);

  useEffect(() => {
    fetchFollowUps();
    fetchSummary();
  }, [fetchFollowUps, fetchSummary]);

  const handleCancelFollowUp = async (item: FollowUpItem) => {
    if (!window.confirm(`Are you sure you want to cancel the follow-up with ${item.customer_name}?`)) {
      return;
    }

    try {
      await followUpService.cancel(item.id);
      showToast({
        variant: 'success',
        title: 'Follow-up Cancelled',
        message: 'The follow-up status has been marked as Cancelled.',
      });
      fetchFollowUps();
      fetchSummary();
    } catch (err: any) {
      showToast({
        variant: 'error',
        title: 'Cancellation Failed',
        message: err.response?.data?.error || err.message || 'Failed to cancel follow-up.',
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedExecutive('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const getTypeIcon = (type: FollowUpType) => {
    switch (type) {
      case 'Phone Call':
        return <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />;
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-sky-600" />;
      case 'Meeting':
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      case 'Video Call':
        return <Video className="w-3.5 h-3.5 text-pink-600" />;
      default:
        return <Calendar className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                Follow-Up Management
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1A2230] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#242F42]">
                {total} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage client calls, WhatsApp conversations, meetings, and track overdue touchpoints.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSelectedFollowUp(null);
                setIsFormModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Schedule Follow-Up
            </Button>
          </div>
        </div>

        {/* Dynamic View Selector Cards */}
        <FollowUpStats
          summary={summary}
          activeView={activeView}
          onViewChange={(v) => {
            setActiveView(v);
            setPage(1);
          }}
          isLoading={isLoadingStats}
        />

        {error && (
          <Alert
            variant="error"
            title="Unable to load follow-ups"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-4 shadow-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search buyer name, phone, or remarks..."
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
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 dark:text-slate-100"
              >
                <option value="">All Channels</option>
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Video Call">Video Call</option>
                <option value="SMS">SMS</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 dark:text-slate-100"
              >
                <option value="">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                value={selectedExecutive}
                onChange={(e) => {
                  setSelectedExecutive(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 dark:text-slate-100"
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

        {/* Follow-up Table */}
        <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] shadow-subtle overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" variant="primary" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading follow-ups...</span>
            </div>
          ) : followUps.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1A2230] text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Follow-Ups Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {searchTerm || selectedType || selectedStatus || selectedExecutive
                  ? 'No follow-ups match your current filter selection.'
                  : `No tasks or follow-ups currently found in the "${activeView}" view.`}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedFollowUp(null);
                  setIsFormModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Schedule Follow-Up
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#101622]/90 border-b border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Scheduled For</th>
                    <th className="py-3 px-4">Purpose / Remarks</th>
                    <th className="py-3 px-4">Executive</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242F42]">
                  {followUps.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1A2230]/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/follow-ups/${item.id}`)}
                    >
                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.property_cover_image ? (
                            <img
                              src={item.property_cover_image}
                              alt={item.property_title || item.project_name || 'Property'}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-[#242F42] shrink-0"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-amber-400 transition-colors">
                              {item.customer_name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span>{item.customer_phone}</span>
                              {(item.property_title || item.project_name) && (
                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">
                                  • {item.property_title || item.project_name}
                                </span>
                              )}
                              {item.property_code && (
                                <span className="font-mono text-[9px] bg-slate-100 dark:bg-[#101622] text-slate-600 dark:text-slate-400 px-1 py-0.2 rounded font-semibold border border-transparent dark:border-[#242F42]">
                                  {item.property_code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          {getTypeIcon(item.follow_up_type)}
                          <span>{item.follow_up_type}</span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                          <span>{item.scheduled_date}</span>
                          {item.is_overdue && (
                            <span className="px-1.5 py-0.2 text-[9px] rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold uppercase">
                              Overdue
                            </span>
                          )}
                        </div>
                        {item.scheduled_time && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span>{item.scheduled_time}</span>
                          </div>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 dark:text-slate-300 truncate" title={item.remarks}>
                          {item.remarks}
                        </div>
                      </td>

                      {/* Executive */}
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{item.assigned_user_name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge followUpStatus={item.status} size="sm" />
                      </td>

                      {/* Outcome */}
                      <td className="py-3 px-4 max-w-[150px]">
                        {item.outcome ? (
                          <span className="text-emerald-800 dark:text-emerald-400 font-medium truncate block" title={item.outcome}>
                            {item.outcome}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Pending</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* Complete action if scheduled or rescheduled */}
                          {(item.status === 'Scheduled' || item.status === 'Rescheduled') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFollowUp(item);
                                  setIsCompleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#101622] rounded-md transition-colors"
                                title="Mark Complete"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFollowUp(item);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#101622] rounded-md transition-colors"
                                title="Reschedule Follow-up"
                              >
                                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelFollowUp(item)}
                                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#101622] rounded-md transition-colors"
                                title="Cancel Follow-up"
                              >
                                <XCircle className="w-4 h-4 text-rose-500" />
                              </button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/follow-ups/${item.id}`)}
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
          {!isLoading && followUps.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-[#242F42] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, total)} of {total} follow-ups
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">
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
      <FollowUpFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Scheduled',
            message: 'Client engagement task created successfully.',
          });
          fetchFollowUps();
          fetchSummary();
        }}
      />

      <CompleteFollowUpModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        followUp={selectedFollowUp}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Completed',
            message: 'Outcome and interaction notes saved.',
          });
          fetchFollowUps();
          fetchSummary();
        }}
      />

      <FollowUpRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        followUp={selectedFollowUp}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Rescheduled',
            message: 'New schedule saved successfully.',
          });
          fetchFollowUps();
          fetchSummary();
        }}
      />
    </AppShell>
  );
};
