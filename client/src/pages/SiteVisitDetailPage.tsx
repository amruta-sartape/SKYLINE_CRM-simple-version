import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { SiteVisitStatusModal } from '../components/siteVisit/SiteVisitStatusModal';
import { SiteVisitRescheduleModal } from '../components/siteVisit/SiteVisitRescheduleModal';
import { siteVisitService } from '../services/siteVisit.service';
import { useToast } from '../context/ToastContext';
import { SiteVisit } from '../types/siteVisit.types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const SiteVisitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [visit, setVisit] = useState<SiteVisit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const fetchVisit = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await siteVisitService.getById(id);
      setVisit(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load site visit details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" variant="primary" />
          <span className="text-xs text-slate-500 font-medium">Loading visit profile...</span>
        </div>
      </AppShell>
    );
  }

  if (error || !visit) {
    return (
      <AppShell>
        <div className="space-y-4 text-left">
          <Alert
            variant="error"
            title="Site Visit Not Found"
            message={error || 'The requested site visit record could not be located.'}
          />
          <Button variant="outline" size="sm" onClick={() => navigate('/site-visits')}>
            Back to Site Visits
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Header Breadcrumbs & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#242F42] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/site-visits" className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Site Visits</span>
              </Link>
              <span>/</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">Tour #{visit.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Site Visit: {visit.customer_name}
              </h1>
              <Badge siteVisitStatus={visit.visit_status} size="md" />
              {visit.outcome && <Badge siteVisitOutcome={visit.outcome} size="md" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {visit.visit_status === 'Scheduled' && (
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
                  onClick={() => setIsStatusModalOpen(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Record Outcome
                </Button>
              </>
            )}
            <Link to={`/leads/${visit.lead_id}`}>
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
            {/* Appointment Schedule & Format */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                <span>Appointment Schedule & Format</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/70 dark:bg-[#101622] rounded-xl border border-slate-200/60 dark:border-[#242F42]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Date</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{visit.visit_date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{visit.visit_time}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Visit Format</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{visit.visit_type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Status</span>
                  <div className="mt-0.5">
                    <Badge siteVisitStatus={visit.visit_status} size="xs" />
                  </div>
                </div>
              </div>

              {/* Notes & Remarks */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Tour Remarks & Debrief Notes</span>
                <div className="p-3 bg-white dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[60px]">
                  {visit.remarks || <span className="text-slate-400 dark:text-slate-500 italic">No notes provided for this visit.</span>}
                </div>
              </div>

              {visit.outcome && (
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400 block">Recorded Outcome</span>
                    <span className="text-sm font-bold text-emerald-950 dark:text-emerald-200">{visit.outcome}</span>
                  </div>
                  <Badge siteVisitOutcome={visit.outcome} size="sm" />
                </div>
              )}
            </div>

            {/* Property Specification Details */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <span>Property & Unit Information</span>
                </h2>
                {(visit.property_id || visit.project_id) && (
                  <Link
                    to={`/discovery/${visit.property_id || visit.project_id}`}
                    className="text-xs font-semibold text-brand-600 dark:text-sky-400 hover:text-brand-800 dark:hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>View Property Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Property Cover Banner if available */}
              {(visit.property_cover_image || visit.property_title || visit.project_name) && (
                <Link
                  to={`/discovery/${visit.property_id || visit.project_id || ''}`}
                  className="p-3 bg-slate-900 dark:bg-[#101622] hover:bg-slate-800 dark:hover:bg-[#1A2230] rounded-xl text-white flex items-center gap-3.5 border border-slate-800 dark:border-[#242F42] transition-colors block cursor-pointer"
                >
                  <img
                    src={
                      visit.property_cover_image &&
                      !visit.property_cover_image.includes('placeholder') &&
                      !visit.property_cover_image.includes('/uploads/')
                        ? visit.property_cover_image
                        : (visit.property_title || visit.project_name || '').toLowerCase().includes('aurora') ||
                          (visit.property_title || visit.project_name || '').toLowerCase().includes('penthouse')
                        ? '/images/property-penthouse.jpg'
                        : '/images/projects/project-bayview/exterior.jpg'
                    }
                    alt={visit.property_title || visit.project_name || 'Property Cover'}
                    className="w-14 h-14 rounded-lg object-cover border border-white/10 dark:border-[#242F42] shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/property-penthouse.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {visit.property_code && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {visit.property_code}
                        </span>
                      )}
                      {visit.property_subtype && (
                        <span className="text-[11px] text-slate-300 font-medium">
                          {visit.property_subtype}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white truncate mt-0.5">
                      {visit.property_title || visit.project_name}
                    </div>
                    {visit.property_price && (
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">
                        {visit.property_price}
                      </div>
                    )}
                  </div>
                </Link>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/70 dark:bg-[#101622] rounded-xl border border-slate-200/60 dark:border-[#242F42] space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Project Details</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{visit.project_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{visit.project_location}, {visit.project_city}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/70 dark:bg-[#101622] rounded-xl border border-slate-200/60 dark:border-[#242F42] space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Specific Unit Spec</span>
                  {visit.unit_number ? (
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Unit {visit.unit_number}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {visit.unit_configuration}
                        {visit.unit_price && <span> • ₹{(visit.unit_price / 100000).toFixed(1)} L</span>}
                      </div>
                      <div className="mt-1">
                        <Badge availability={visit.unit_availability} size="xs" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                      General Sample Flat walkthrough (no individual unit locked)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            {/* Buyer Profile Summary */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <span>Customer Profile</span>
                </h2>
                <Link
                  to={`/leads/${visit.lead_id}`}
                  className="text-xs font-semibold text-brand-600 dark:text-sky-400 hover:text-brand-800 dark:hover:text-sky-300 flex items-center gap-1"
                >
                  <span>360° Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{visit.customer_name}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span className="font-semibold">{visit.customer_phone}</span>
                </div>

                {visit.customer_email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{visit.customer_email}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-[#242F42] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Pipeline Stage</span>
                    <Badge stage={visit.lead_pipeline_stage} size="xs" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Budget</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {visit.lead_budget ? `₹${(visit.lead_budget / 100000).toFixed(1)} L` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Assignment & System Metadata */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                <span>Executive Assignment</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Tour Host / Executive</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{visit.assigned_user_name || 'Unassigned'}</span>
                  {visit.assigned_user_email && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{visit.assigned_user_email}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#242F42] text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div>Created by: <span className="font-medium text-slate-700 dark:text-slate-300">{visit.created_by_name || 'System Admin'}</span></div>
                  <div>Recorded on: <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(visit.created_at).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SiteVisitStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        visit={visit}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Outcome Recorded',
            message: 'Site visit status successfully updated.',
          });
          fetchVisit();
        }}
      />

      <SiteVisitRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        visit={visit}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Visit Rescheduled',
            message: 'New appointment schedule saved.',
          });
          fetchVisit();
        }}
      />
    </AppShell>
  );
};
