import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { CompleteFollowUpModal } from '../components/followUp/CompleteFollowUpModal';
import { FollowUpRescheduleModal } from '../components/followUp/FollowUpRescheduleModal';
import { followUpService } from '../services/followUp.service';
import { useToast } from '../context/ToastContext';
import { FollowUpItem, FollowUpType } from '../types/followUp.types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Users,
  Video,
  Building,
  RotateCcw,
  XCircle,
  MapPin,
  Activity,
} from 'lucide-react';

export const FollowUpDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [followUp, setFollowUp] = useState<FollowUpItem | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const fetchFollowUp = useCallback(async () => {
    if (!id) {
      setError('No follow-up ID provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res: any = await followUpService.getById(id);
      if (!res) {
        setError('Follow-up record not found.');
        setFollowUp(null);
        return;
      }

      const item: FollowUpItem = res.followUp ? res.followUp : res;
      const acts: any[] = res.activities || [];

      if (!item || !item.id) {
        setError('Follow-up record not found.');
        setFollowUp(null);
        return;
      }

      setFollowUp(item);
      setActivities(acts);
    } catch (err: any) {
      console.error('Error loading follow-up:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load follow-up details.');
      setFollowUp(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFollowUp();
  }, [fetchFollowUp]);

  const handleCancelFollowUp = async () => {
    if (!followUp) return;
    if (!window.confirm(`Are you sure you want to cancel the follow-up with ${followUp.customer_name || 'this customer'}?`)) {
      return;
    }

    try {
      await followUpService.cancel(followUp.id, 'Cancelled from follow-up detail page');
      showToast({
        variant: 'success',
        title: 'Follow-up Cancelled',
        message: 'The follow-up status has been marked as Cancelled.',
      });
      fetchFollowUp();
    } catch (err: any) {
      showToast({
        variant: 'error',
        title: 'Cancellation Failed',
        message: err.response?.data?.error || err.message || 'Failed to cancel follow-up.',
      });
    }
  };

  const getTypeIcon = (type?: FollowUpType | string) => {
    switch (type) {
      case 'Phone Call':
        return <PhoneCall className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'Meeting':
        return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Video Call':
        return <Video className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" variant="primary" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading follow-up profile...</span>
        </div>
      </AppShell>
    );
  }

  if (error || !followUp) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-12 space-y-4 text-left">
          <Alert
            variant="error"
            title="Follow-Up Record Not Found"
            message={error || 'The requested follow-up item could not be located in the system.'}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/follow-ups')} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Follow-Ups
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchFollowUp} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Retry
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const hasPropertyInfo = Boolean(
    followUp.property_id ||
    followUp.property_title ||
    followUp.property_code ||
    followUp.project_name ||
    followUp.property_cover_image
  );

  const formattedDate = followUp.scheduled_date || 'Date Unspecified';
  const formattedTime = followUp.scheduled_time || 'Time Unspecified';
  const taskId = followUp.id ? (followUp.id.length > 8 ? followUp.id.slice(0, 8) : followUp.id) : 'Record';

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Header Breadcrumbs & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#242F42] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/follow-ups" className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Follow-Ups</span>
              </Link>
              <span>/</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">Task #{taskId}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Follow-Up: {followUp.customer_name || 'Client Engagement'}
              </h1>
              <Badge followUpStatus={followUp.status} size="md" />
              <Badge followUpType={followUp.follow_up_type} size="md" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(followUp.status === 'Scheduled' || followUp.status === 'Rescheduled') && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  leftIcon={<Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                >
                  Reschedule
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsCompleteModalOpen(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Complete Follow-Up
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCancelFollowUp}
                  className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/50"
                  leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                >
                  Cancel
                </Button>
              </>
            )}
            {followUp.lead_id ? (
              <Link to={`/leads/${followUp.lead_id}`}>
                <Button
                  variant="outline"
                  size="md"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Customer 360
                </Button>
              </Link>
            ) : (
              <Link to="/leads">
                <Button
                  variant="outline"
                  size="md"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Leads
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Follow-up Details */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {getTypeIcon(followUp.follow_up_type)}
                <span>Engagement Details</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/70 dark:bg-[#101622] rounded-xl border border-slate-200/60 dark:border-[#242F42]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Channel</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{followUp.follow_up_type || 'General'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Scheduled Date</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Scheduled Time</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formattedTime}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Status</span>
                  <div className="mt-0.5">
                    <Badge followUpStatus={followUp.status} size="xs" />
                  </div>
                </div>
              </div>

              {/* Purpose / Agenda */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Follow-Up Agenda & Objective</span>
                <div className="p-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[60px]">
                  {followUp.remarks || <span className="text-slate-400 dark:text-slate-500 italic">No notes provided for this follow-up interaction.</span>}
                </div>
              </div>

              {/* Recorded Outcome */}
              {followUp.outcome && (
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">Recorded Outcome</span>
                  <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">{followUp.outcome}</div>
                </div>
              )}

              {/* Next follow-up linked info */}
              {followUp.next_follow_up_date && (
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300 block">Next Follow-Up Commitment</span>
                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200">{followUp.next_follow_up_date}</span>
                  </div>
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>

            {/* Linked Site Visit Context */}
            {followUp.site_visit_id && (
              <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Linked Site Visit Context</span>
                  </h2>
                  <Link
                    to={`/site-visits/${followUp.site_visit_id}`}
                    className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View Site Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This engagement touchpoint was generated following Site Visit #{followUp.site_visit_id.length > 8 ? followUp.site_visit_id.slice(0, 8) : followUp.site_visit_id}.
                </p>
              </div>
            )}

            {/* Activity History Timeline */}
            {activities.length > 0 && (
              <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <span>Interaction Log & Audit</span>
                </h2>

                <div className="space-y-3">
                  {activities.slice(0, 5).map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-3 bg-slate-50/70 dark:bg-[#101622] rounded-xl border border-slate-200/60 dark:border-[#242F42] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{act.title || act.activity_type}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {act.created_at ? new Date(act.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{act.description}</p>
                      {act.performer_name && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          By: <span className="font-medium text-slate-700 dark:text-slate-300">{act.performer_name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Customer Details</span>
                </h2>
                {followUp.lead_id && (
                  <Link
                    to={`/leads/${followUp.lead_id}`}
                    className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>360° View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {followUp.customer_name ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Customer Name</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{followUp.customer_name}</span>
                  </div>

                  {followUp.customer_phone && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <a href={`tel:${followUp.customer_phone}`} className="font-semibold hover:underline">
                        {followUp.customer_phone}
                      </a>
                    </div>
                  )}

                  {followUp.customer_email && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <a href={`mailto:${followUp.customer_email}`} className="truncate hover:underline">
                        {followUp.customer_email}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-[#101622] rounded-lg border border-slate-200 dark:border-[#242F42] text-xs text-slate-500 dark:text-slate-400 italic">
                  Customer contact information is currently unavailable for this record.
                </div>
              )}
            </div>

            {/* Property Interest */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Property Context</span>
                </h2>
                {followUp.property_id && (
                  <Link
                    to={`/discovery/${followUp.property_id}`}
                    className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Explore</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {hasPropertyInfo ? (
                <Link
                  to={followUp.property_id ? `/discovery/${followUp.property_id}` : '/discovery'}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#101622] hover:bg-slate-100 dark:hover:bg-[#1A2230] border border-slate-200/80 dark:border-[#242F42] rounded-xl transition-colors cursor-pointer group"
                >
                  <img
                    src={
                      followUp.property_cover_image ||
                      ((followUp.property_title || followUp.project_name || '').toLowerCase().includes('penthouse') ||
                      (followUp.property_title || followUp.project_name || '').toLowerCase().includes('aurora')
                        ? '/images/property-penthouse.jpg'
                        : '/images/classifications/apartment.jpg')
                    }
                    alt={followUp.property_title || followUp.project_name || 'Property'}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-[#242F42] shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/classifications/apartment.jpg';
                    }}
                  />

                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {followUp.property_code && (
                        <span className="font-mono text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                          {followUp.property_code}
                        </span>
                      )}
                      {followUp.property_subtype && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {followUp.property_subtype}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {followUp.property_title || followUp.project_name}
                    </div>
                    {(followUp.property_location || followUp.property_city) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {[followUp.property_location, followUp.property_city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {followUp.property_price && (
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {followUp.property_price}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-[#101622] rounded-xl border border-dashed border-slate-200 dark:border-[#242F42] text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="italic">Property information is currently unavailable for this follow-up.</p>
                  <Link
                    to="/discovery"
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-amber-400 hover:underline text-[11px]"
                  >
                    <span>Browse Property Catalog</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Executive Assignment & System Metadata */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Assignment & Log</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Executive Responsible</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{followUp.assigned_user_name || 'Unassigned'}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#242F42] text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div>Created by: <span className="font-medium text-slate-700 dark:text-slate-300">{followUp.created_by_name || 'System Admin'}</span></div>
                  <div>
                    Recorded on:{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {followUp.created_at ? new Date(followUp.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompleteFollowUpModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        followUp={followUp}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Completed',
            message: 'Interaction status successfully updated.',
          });
          fetchFollowUp();
        }}
      />

      <FollowUpRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        followUp={followUp}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Rescheduled',
            message: 'New schedule saved successfully.',
          });
          fetchFollowUp();
        }}
      />
    </AppShell>
  );
};
