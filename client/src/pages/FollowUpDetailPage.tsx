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
import { FollowUpItem } from '../types/followUp.types';
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
} from 'lucide-react';

export const FollowUpDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [followUp, setFollowUp] = useState<FollowUpItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const fetchFollowUp = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await followUpService.getById(id);
      setFollowUp(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load follow-up details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFollowUp();
  }, [fetchFollowUp]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" variant="primary" />
          <span className="text-xs text-slate-500 font-medium">Loading follow-up profile...</span>
        </div>
      </AppShell>
    );
  }

  if (error || !followUp) {
    return (
      <AppShell>
        <div className="space-y-4 text-left">
          <Alert
            variant="error"
            title="Follow-Up Record Not Found"
            message={error || 'The requested follow-up item could not be located.'}
          />
          <Button variant="outline" size="sm" onClick={() => navigate('/follow-ups')}>
            Back to Follow-Ups
          </Button>
        </div>
      </AppShell>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Phone Call':
        return <PhoneCall className="w-4 h-4 text-indigo-600" />;
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'Meeting':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'Video Call':
        return <Video className="w-4 h-4 text-pink-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Header Breadcrumbs & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/follow-ups" className="hover:text-slate-800 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Follow-Ups</span>
              </Link>
              <span>/</span>
              <span className="font-mono text-slate-700">Task #{followUp.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Follow-Up: {followUp.customer_name}
              </h1>
              <Badge followUpStatus={followUp.status} size="md" />
              <Badge followUpType={followUp.follow_up_type} size="md" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(followUp.status === 'Scheduled' || followUp.status === 'Rescheduled') && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  leftIcon={<Clock className="w-4 h-4 text-amber-600" />}
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
              </>
            )}
            <Link to={`/leads/${followUp.lead_id}`}>
              <Button
                variant="outline"
                size="md"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Customer 360
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Follow-up Details */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                {getTypeIcon(followUp.follow_up_type)}
                <span>Engagement Details</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Channel</span>
                  <span className="text-sm font-bold text-slate-900">{followUp.follow_up_type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Date</span>
                  <span className="text-sm font-bold text-slate-900">{followUp.scheduled_date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Time</span>
                  <span className="text-xs font-semibold text-slate-800">{followUp.scheduled_time || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                  <div className="mt-0.5">
                    <Badge followUpStatus={followUp.status} size="xs" />
                  </div>
                </div>
              </div>

              {/* Purpose / Agenda */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Follow-Up Agenda & Objective</span>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed">
                  {followUp.remarks}
                </div>
              </div>

              {/* Recorded Outcome */}
              {followUp.outcome && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Recorded Outcome</span>
                  <div className="text-sm font-bold text-emerald-950">{followUp.outcome}</div>
                </div>
              )}

              {/* Next follow-up linked info */}
              {followUp.next_follow_up_date && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-800 block">Next Follow-Up Commitment</span>
                    <span className="text-xs font-bold text-blue-950">{followUp.next_follow_up_date}</span>
                  </div>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>

            {/* Linked Site Visit Context */}
            {followUp.site_visit_id && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>Linked Site Visit</span>
                  </h2>
                  <Link
                    to={`/site-visits/${followUp.site_visit_id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    <span>View Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-slate-600">
                  This follow-up was generated from Site Visit #{followUp.site_visit_id.slice(0, 8)}.
                </p>
              </div>
            )}
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  <span>Customer Details</span>
                </h2>
                <Link
                  to={`/leads/${followUp.lead_id}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <span>360° View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Name</span>
                  <span className="text-sm font-bold text-slate-900">{followUp.customer_name}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{followUp.customer_phone}</span>
                </div>

                {followUp.customer_email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{followUp.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Executive Assignment & System Metadata */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Assignment & Log</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Executive Responsible</span>
                  <span className="text-sm font-bold text-slate-900">{followUp.assigned_user_name || 'Unassigned'}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div>Created by: <span className="font-medium text-slate-700">{followUp.created_by_name || 'System Admin'}</span></div>
                  <div>Recorded on: <span className="font-medium text-slate-700">{new Date(followUp.created_at).toLocaleString()}</span></div>
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
