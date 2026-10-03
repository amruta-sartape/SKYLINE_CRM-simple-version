import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { QualifyLeadModal } from '../components/crm/QualifyLeadModal';
import { StageChangeModal } from '../components/crm/StageChangeModal';
import { LeadFormModal } from '../components/crm/LeadFormModal';
import { ScheduleSiteVisitModal } from '../components/siteVisit/ScheduleSiteVisitModal';
import { SiteVisitStatusModal } from '../components/siteVisit/SiteVisitStatusModal';
import { SiteVisitRescheduleModal } from '../components/siteVisit/SiteVisitRescheduleModal';
import { FollowUpFormModal } from '../components/followUp/FollowUpFormModal';
import { CompleteFollowUpModal } from '../components/followUp/CompleteFollowUpModal';
import { FollowUpRescheduleModal } from '../components/followUp/FollowUpRescheduleModal';
import { leadService } from '../services/lead.service';
import { siteVisitService } from '../services/siteVisit.service';
import { followUpService } from '../services/followUp.service';
import { useToast } from '../context/ToastContext';
import {
  Lead,
  LeadActivity,
  PipelineStage,
  QualifyLeadFormData,
  LeadFormData,
  UserSummary,
  PropertyInterestItem,
} from '../types/crm.types';
import { SiteVisit } from '../types/siteVisit.types';
import { FollowUpItem } from '../types/followUp.types';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  GitCommit,
  PhoneCall,
  Edit2,
  Layers,
  Calendar,
  ExternalLink,
  Plus,
  MessageSquare,
  Users,
  Video,
  Eye,
  Compass,
} from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [propertyInterests, setPropertyInterests] = useState<PropertyInterestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isQualifyModalOpen, setIsQualifyModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [isVisitStatusOpen, setIsVisitStatusOpen] = useState(false);
  const [isVisitRescheduleOpen, setIsVisitRescheduleOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isCompleteFollowUpOpen, setIsCompleteFollowUpOpen] = useState(false);
  const [isRescheduleFollowUpOpen, setIsRescheduleFollowUpOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpItem | null>(null);

  const [executives, setExecutives] = useState<UserSummary[]>([]);

  useEffect(() => {
    leadService
      .getExecutives()
      .then(setExecutives)
      .catch((err) => console.warn('Failed to fetch executives:', err));
  }, []);

  const fetchLeadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedLead, timeline, visitsRes, followUpsRes] = await Promise.all([
        leadService.getLeadById(id),
        leadService.getLeadTimeline(id),
        siteVisitService.list({ lead_id: id, limit: 100 }),
        followUpService.list({ lead_id: id, limit: 100 }),
      ]);

      setLead(fetchedLead);
      setActivities(timeline.activities || []);
      setPropertyInterests(timeline.propertyInterests || []);
      setSiteVisits(visitsRes.visits || []);
      setFollowUps(followUpsRes.followUps || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch lead profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  const handleQualifyLead = async (leadId: string, data: QualifyLeadFormData) => {
    await leadService.qualifyLead(leadId, data);
    showToast({
      variant: 'success',
      title: 'Qualification Updated',
      message: `Buyer status saved as "${data.qualification_status}".`,
    });
    fetchLeadData();
  };

  const handleStageTransition = async (
    leadId: string,
    newStage: PipelineStage,
    remarks?: string
  ) => {
    await leadService.updateStage(leadId, newStage, remarks);
    showToast({
      variant: 'success',
      title: 'Stage Updated',
      message: `Lead advanced to ${newStage}.`,
    });
    fetchLeadData();
  };

  const handleUpdateLead = async (data: LeadFormData) => {
    if (!id) return;
    await leadService.updateLead(id, data);
    showToast({
      variant: 'success',
      title: 'Profile Updated',
      message: 'Lead changes saved.',
    });
    fetchLeadData();
  };

  const getTypeIcon = (type: string) => {
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

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" variant="primary" />
          <span className="text-xs text-slate-500 font-medium">Loading Customer 360 View...</span>
        </div>
      </AppShell>
    );
  }

  if (error || !lead) {
    return (
      <AppShell>
        <div className="space-y-4 text-left">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/leads')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Leads
          </Button>
          <Alert
            variant="error"
            title="Lead Not Found"
            message={error || 'The requested lead does not exist or you lack authorization to view it.'}
          />
        </div>
      </AppShell>
    );
  }

  const pipelineStagesList: PipelineStage[] = [
    'New',
    'Contacted',
    'Follow-up',
    'Site Visit',
    'Negotiation',
    'Converted',
  ];

  const currentStageIndex = pipelineStagesList.indexOf(lead.pipeline_stage);

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/leads')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Leads
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">Customer 360 Profile</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Lead
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQualifyModalOpen(true)}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-brand-600" />}
            >
              Qualify Buyer
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFollowUp(null);
                setIsFollowUpModalOpen(true);
              }}
              leftIcon={<PhoneCall className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Schedule Follow-Up
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedVisit(null);
                setIsScheduleVisitOpen(true);
              }}
              leftIcon={<Calendar className="w-3.5 h-3.5 text-blue-600" />}
            >
              Schedule Site Visit
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsStageModalOpen(true)}
              leftIcon={<GitCommit className="w-3.5 h-3.5" />}
            >
              Update Stage
            </Button>
          </div>
        </div>

        {/* Customer 360 Header Banner */}
        <div className="bg-slate-900 dark:bg-[#141A24] text-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-800 dark:border-[#242F42] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 dark:bg-[#101622] border border-slate-700 dark:border-[#242F42] text-brand-300 dark:text-amber-400">
                  Lead Ref: {lead.id}
                </span>
                <Badge priority={lead.priority} size="sm" />
                <Badge qualification={lead.qualification_status} size="sm" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
                {lead.customer_name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {lead.phone}
                </span>
                {lead.email && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {lead.email}
                  </span>
                )}
                {lead.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {lead.city}
                  </span>
                )}
              </div>
            </div>

            {/* Right Financial & Executive Snapshot */}
            <div className="shrink-0 bg-slate-950/80 dark:bg-[#101622] p-4 rounded-xl border border-slate-800 dark:border-[#242F42] space-y-2 text-right">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Budget Capacity
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  ₹{(lead.budget / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 dark:border-[#242F42] text-[11px] text-slate-300">
                <span>Assigned to: </span>
                <strong className="text-white font-semibold">
                  {lead.assigned_name || 'Unassigned'}
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive Pipeline Progression Stepper */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 dark:border-[#242F42]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Pipeline Stage Progression</span>
              <span className="text-brand-300 dark:text-amber-400 font-medium">Current: {lead.pipeline_stage}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {pipelineStagesList.map((stg, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = lead.pipeline_stage === stg;

                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => handleStageTransition(lead.id, stg)}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition-all border ${
                      isCurrent
                        ? 'bg-brand-600 dark:bg-amber-500 dark:text-slate-950 text-white border-brand-500 dark:border-amber-400 shadow-md ring-2 ring-brand-400/30'
                        : isPassed
                        ? 'bg-slate-800 dark:bg-[#101622] text-slate-200 border-slate-700 dark:border-[#242F42] hover:bg-slate-700 dark:hover:bg-slate-800'
                        : 'bg-slate-950/60 dark:bg-[#101622]/40 text-slate-500 border-slate-800 dark:border-[#242F42] hover:text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold opacity-75">Step {idx + 1}</div>
                    <div className="truncate font-bold mt-0.5">{stg}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Requirements & Buyer Criteria (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Property Interest & Requirements Card */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#242F42] pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <Building className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <h3>Primary Property Interest</h3>
                </div>
                <Badge stage={lead.pipeline_stage} size="xs" />
              </div>

              {/* Property Image & Metadata preview if linked */}
              {(lead.property_cover_image || lead.property_code || lead.property_title) && (
                <div className="p-3 bg-slate-900 dark:bg-[#101622] rounded-xl border border-slate-800 dark:border-[#242F42] text-white flex gap-3 items-center">
                  {lead.property_cover_image ? (
                    <img
                      src={lead.property_cover_image}
                      alt={lead.property_title || 'Property Cover'}
                      className="w-16 h-16 rounded-lg object-cover border border-white/10 dark:border-[#242F42] shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-800 dark:bg-[#1A2230] border border-slate-700 dark:border-[#242F42] flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-brand-400 dark:text-amber-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lead.property_code && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {lead.property_code}
                        </span>
                      )}
                      {lead.property_subtype && (
                        <span className="text-[11px] text-slate-300 font-medium truncate">
                          {lead.property_subtype}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-1">
                      {lead.property_title || lead.interested_property}
                    </div>
                    {lead.property_price && (
                      <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                        {lead.property_price}
                      </div>
                    )}
                  </div>
                  {lead.property_id && (
                    <Link
                      to={`/discovery/${lead.property_id}`}
                      className="shrink-0 p-2 rounded-lg bg-white/10 dark:bg-[#1A2230] hover:bg-white/20 dark:hover:bg-slate-800 text-white transition-colors"
                      title="View Property Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-[#242F42]">
                  <span className="text-slate-500 dark:text-slate-400">Interested Project:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {lead.property_title || lead.interested_property || 'General Requirements'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-[#242F42]">
                  <span className="text-slate-500 dark:text-slate-400">Configuration:</span>
                  <span className="font-bold text-brand-700 dark:text-amber-400 bg-brand-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-amber-800/60">
                    {lead.flat_type}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-[#242F42]">
                  <span className="text-slate-500 dark:text-slate-400">Preferred Location:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {lead.preferred_location || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-[#242F42]">
                  <span className="text-slate-500 dark:text-slate-400">Purchase Timeline:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {lead.purchase_timeline || 'N/A'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-[#242F42]">
                  <span className="text-slate-500 dark:text-slate-400">Purpose of Purchase:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{lead.purpose || 'Self Use'}</span>
                </div>

                <div className="flex items-start justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Home Loan Required:</span>
                  <span
                    className={`font-semibold ${
                      lead.loan_required === 1 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lead.loan_required === 1 ? 'Yes (Bank Loan Assistance)' : 'No (Self Funded)'}
                  </span>
                </div>
              </div>

              {lead.property_id && (
                <div className="pt-2 border-t border-slate-100 dark:border-[#242F42] flex items-center gap-2">
                  <Link
                    to={`/discovery/${lead.property_id}`}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-brand-50 dark:bg-amber-950/40 hover:bg-brand-100 dark:hover:bg-amber-900/50 text-brand-700 dark:text-amber-300 font-semibold text-center text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore in Property Discovery</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Customer 360: All Property Interests & Touchpoints */}
            {propertyInterests.length > 0 && (
              <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#242F42] pb-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                    <Compass className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                    <h3>Customer Property History ({propertyInterests.length})</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">360 View</span>
                </div>

                <div className="space-y-3">
                  {propertyInterests.map((prop) => (
                    <div
                      key={`${prop.id}-${prop.source}`}
                      className="p-3 bg-slate-50 dark:bg-[#101622] border border-slate-200/80 dark:border-[#242F42] rounded-xl flex items-center gap-3"
                    >
                      {prop.cover_image ? (
                        <img
                          src={prop.cover_image}
                          alt={prop.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-[#242F42] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-brand-100 dark:bg-amber-950/60 text-brand-700 dark:text-amber-300">
                            {prop.source}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {prop.code}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                          {prop.title}
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          {prop.price_formatted} • <span className="text-slate-500 dark:text-slate-400 font-normal">{prop.city}</span>
                        </div>
                      </div>
                      <Link
                        to={`/discovery/${prop.id}`}
                        className="p-1.5 text-brand-600 dark:text-amber-400 hover:text-brand-800 dark:hover:text-amber-300 hover:bg-brand-50 dark:hover:bg-[#1A2230] rounded-lg transition-colors shrink-0"
                        title="View Property"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer Qualification Card */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#242F42] pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3>Qualification Status</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQualifyModalOpen(true)}
                >
                  Update
                </Button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#101622] rounded-lg border border-slate-200/80 dark:border-[#242F42] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                    Verified Status
                  </span>
                  <Badge qualification={lead.qualification_status} size="md" className="mt-1" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                    Priority Tier
                  </span>
                  <Badge priority={lead.priority} size="md" className="mt-1" />
                </div>
              </div>

              {lead.notes && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-amber-950 dark:text-amber-300 text-[11px] block">
                    Lead Notes & Strategy:
                  </span>
                  <p className="text-amber-900 dark:text-amber-200 leading-relaxed">{lead.notes}</p>
                </div>
              )}
            </div>

            {/* Site Visits Section (Phase 4) */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#242F42] pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <h3>Site Visits ({siteVisits.length})</h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedVisit(null);
                    setIsScheduleVisitOpen(true);
                  }}
                  leftIcon={<Plus className="w-3 h-3" />}
                >
                  Schedule Visit
                </Button>
              </div>

              {siteVisits.length === 0 ? (
                <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-[#242F42] rounded-lg">
                  No site visits scheduled for this customer yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {siteVisits.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 bg-slate-50 dark:bg-[#101622] border border-slate-200/80 dark:border-[#242F42] rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{v.visit_date}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">at {v.visit_time}</span>
                        </div>
                        <Badge siteVisitStatus={v.visit_status} size="xs" />
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        Project: <span className="font-semibold text-slate-800 dark:text-slate-200">{v.project_name}</span>
                        {v.unit_number && <span> • Unit {v.unit_number}</span>}
                      </div>

                      {v.outcome && (
                        <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 w-fit">
                          Outcome: {v.outcome}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-[#242F42] text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Host: <strong className="text-slate-700 dark:text-slate-300">{v.assigned_user_name || 'Staff'}</strong></span>
                        <div className="flex items-center gap-2">
                          {v.visit_status === 'Scheduled' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVisit(v);
                                  setIsVisitRescheduleOpen(true);
                                }}
                                className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVisit(v);
                                  setIsVisitStatusOpen(true);
                                }}
                                className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                              >
                                Outcome
                              </button>
                            </>
                          )}
                          <Link to={`/site-visits/${v.id}`} className="text-brand-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-0.5">
                            Details <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Follow-Ups & Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Follow-Up Logs Section */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#242F42] pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <PhoneCall className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <h3>Follow-Up Interaction Log ({followUps.length})</h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedFollowUp(null);
                    setIsFollowUpModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3 h-3" />}
                >
                  Schedule Follow-Up
                </Button>
              </div>

              {followUps.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-[#242F42] rounded-lg">
                  No follow-up interactions recorded yet. Log your first client phone call or meeting.
                </div>
              ) : (
                <div className="space-y-3">
                  {followUps.map((fol) => (
                    <div
                      key={fol.id}
                      className="p-3.5 bg-slate-50 dark:bg-[#101622] border border-slate-200/80 dark:border-[#242F42] rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-[#141A24] px-2 py-0.5 rounded border border-slate-200 dark:border-[#242F42] shadow-2xs">
                            {getTypeIcon(fol.follow_up_type)}
                            <span>{fol.follow_up_type}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {fol.scheduled_date} {fol.scheduled_time ? `at ${fol.scheduled_time}` : ''}
                          </span>
                          {fol.is_overdue && (
                            <span className="px-1.5 py-0.2 text-[9px] rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold uppercase">
                              Overdue
                            </span>
                          )}
                        </div>

                        <Badge followUpStatus={fol.status} size="xs" />
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#141A24] p-2.5 rounded-lg border border-slate-100 dark:border-[#242F42]">
                        {fol.remarks}
                      </p>

                      {fol.outcome && (
                        <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800/60">
                          Outcome: {fol.outcome}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-[#242F42] text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Executive: <strong className="text-slate-700 dark:text-slate-300">{fol.assigned_user_name || 'Staff'}</strong></span>
                        <div className="flex items-center gap-2">
                          {(fol.status === 'Scheduled' || fol.status === 'Rescheduled') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFollowUp(fol);
                                  setIsRescheduleFollowUpOpen(true);
                                }}
                                className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFollowUp(fol);
                                  setIsCompleteFollowUpOpen(true);
                                }}
                                className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          <Link to={`/follow-ups/${fol.id}`} className="text-brand-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-0.5">
                            Details <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Activity Timeline (Customer 360 View) */}
            <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#242F42] pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <Layers className="w-4 h-4 text-brand-600 dark:text-amber-400" />
                  <h3>Customer 360 Audit & Activity Timeline</h3>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {activities.length} Recorded Events
                </span>
              </div>

              {activities.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No activities recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#242F42]">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 mt-1 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-amber-400 ring-4 ring-white dark:ring-[#141A24]" />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{act.title}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {act.created_at ? act.created_at.split('T')[0] : 'Recently'}
                          </span>
                        </div>

                        {act.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#101622] p-2.5 rounded-lg border border-slate-100 dark:border-[#242F42]">
                            {act.description}
                          </p>
                        )}

                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          Action by: {act.performer_name || 'System Auto'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QualifyLeadModal
        isOpen={isQualifyModalOpen}
        onClose={() => setIsQualifyModalOpen(false)}
        lead={lead}
        onSubmit={handleQualifyLead}
      />

      <StageChangeModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        lead={lead}
        onSubmit={handleStageTransition}
      />

      <LeadFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateLead}
        initialData={lead}
        executives={executives}
      />

      {/* Site Visit Modals */}
      <ScheduleSiteVisitModal
        isOpen={isScheduleVisitOpen}
        onClose={() => setIsScheduleVisitOpen(false)}
        preselectedLead={lead}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Visit Scheduled',
            message: 'Property site visit successfully booked.',
          });
          fetchLeadData();
        }}
      />

      <SiteVisitStatusModal
        isOpen={isVisitStatusOpen}
        onClose={() => setIsVisitStatusOpen(false)}
        visit={selectedVisit}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Outcome Recorded',
            message: 'Site visit outcome saved.',
          });
          fetchLeadData();
        }}
      />

      <SiteVisitRescheduleModal
        isOpen={isVisitRescheduleOpen}
        onClose={() => setIsVisitRescheduleOpen(false)}
        visit={selectedVisit}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Visit Rescheduled',
            message: 'New site visit schedule confirmed.',
          });
          fetchLeadData();
        }}
      />

      {/* Follow-Up Modals */}
      <FollowUpFormModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        preselectedLead={lead}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Scheduled',
            message: 'Follow-up interaction planned successfully.',
          });
          fetchLeadData();
        }}
      />

      <CompleteFollowUpModal
        isOpen={isCompleteFollowUpOpen}
        onClose={() => setIsCompleteFollowUpOpen(false)}
        followUp={selectedFollowUp}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Completed',
            message: 'Outcome and interaction notes saved.',
          });
          fetchLeadData();
        }}
      />

      <FollowUpRescheduleModal
        isOpen={isRescheduleFollowUpOpen}
        onClose={() => setIsRescheduleFollowUpOpen(false)}
        followUp={selectedFollowUp}
        onSuccess={() => {
          showToast({
            variant: 'success',
            title: 'Follow-up Rescheduled',
            message: 'New follow-up schedule saved.',
          });
          fetchLeadData();
        }}
      />
    </AppShell>
  );
};
