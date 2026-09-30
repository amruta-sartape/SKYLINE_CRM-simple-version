import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { LeadFormModal } from '../components/crm/LeadFormModal';
import { QualifyLeadModal } from '../components/crm/QualifyLeadModal';
import { StageChangeModal } from '../components/crm/StageChangeModal';
import { AddFollowUpModal } from '../components/crm/AddFollowUpModal';
import { leadService } from '../services/lead.service';
import { useToast } from '../context/ToastContext';
import {
  Lead,
  LeadFormData,
  QualifyLeadFormData,
  FollowUpFormData,
  PipelineStage,
  UserSummary,
} from '../types/crm.types';
import {
  Search,
  Plus,
  Kanban,
  Eye,
  ShieldCheck,
  GitCommit,
  PhoneCall,
  Phone,
  User,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedQual, setSelectedQual] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isQualifyModalOpen, setIsQualifyModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [executives, setExecutives] = useState<UserSummary[]>([]);

  useEffect(() => {
    leadService
      .getExecutives()
      .then(setExecutives)
      .catch((err) => console.warn('Failed to load executives:', err));
  }, []);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        limit,
        search: searchTerm || undefined,
        stage: selectedStage || undefined,
        qualification_status: selectedQual || undefined,
        flat_type: selectedConfig || undefined,
        priority: selectedPriority || undefined,
        assigned_to: selectedExecutive || undefined,
      };

      const result = await leadService.getLeads(params);
      setLeads(result.leads);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CRM leads.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, selectedStage, selectedQual, selectedConfig, selectedPriority, selectedExecutive]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateOrUpdateLead = async (data: LeadFormData) => {
    if (activeLead) {
      await leadService.updateLead(activeLead.id, data);
      showToast({
        variant: 'success',
        title: 'Lead Updated',
        message: `Profile updated for ${data.customer_name}.`,
      });
    } else {
      const newLead = await leadService.createLead(data);
      showToast({
        variant: 'success',
        title: 'Lead Created',
        message: `Lead ${newLead.customer_name} added to pipeline.`,
      });
    }
    fetchLeads();
  };

  const handleQualifyLead = async (leadId: string, data: QualifyLeadFormData) => {
    await leadService.qualifyLead(leadId, data);
    showToast({
      variant: 'success',
      title: 'Qualification Saved',
      message: `Lead status updated to ${data.qualification_status}.`,
    });
    fetchLeads();
  };

  const handleUpdateStage = async (leadId: string, stage: PipelineStage, remarks?: string) => {
    await leadService.updateStage(leadId, stage, remarks);
    showToast({
      variant: 'success',
      title: 'Stage Updated',
      message: `Lead advanced to ${stage} stage.`,
    });
    fetchLeads();
  };

  const handleAddFollowUp = async (leadId: string, data: FollowUpFormData) => {
    await leadService.addFollowUp(leadId, data);
    showToast({
      variant: 'success',
      title: 'Follow-up Recorded',
      message: `Interaction logged with ${data.type}.`,
    });
    fetchLeads();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedQual('');
    setSelectedConfig('');
    setSelectedPriority('');
    setSelectedExecutive('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Lead Management
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {total} Active Leads
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track qualified buyers, manage assignment, and monitor sales progression across all stages.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/leads/pipeline">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Kanban className="w-4 h-4 text-brand-600" />}
              >
                Visual Pipeline Board
              </Button>
            </Link>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setActiveLead(null);
                setIsFormModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Direct Lead
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            variant="error"
            title="Unable to load leads"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search name, phone, project, location..."
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
                value={selectedStage}
                onChange={(e) => {
                  setSelectedStage(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Pipeline Stages</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <select
                value={selectedQual}
                onChange={(e) => {
                  setSelectedQual(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Qualifications</option>
                <option value="Qualified">Qualified</option>
                <option value="Future Prospect">Future Prospect</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>

            <div>
              <select
                value={selectedConfig}
                onChange={(e) => {
                  setSelectedConfig(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              >
                <option value="">All Flat Types</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
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

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" variant="primary" />
              <span className="text-xs text-slate-500 font-medium">Loading CRM leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Leads Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {searchTerm || selectedStage || selectedQual || selectedConfig
                  ? 'No leads match your current filter settings. Reset filters to view all leads.'
                  : 'Convert client enquiries or create direct leads to populate your CRM sales pipeline.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveLead(null);
                  setIsFormModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create First Lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Requirements & Property</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Pipeline Stage</th>
                    <th className="py-3 px-4">Qualification</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4">Next Follow-Up</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                          {lead.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                          {lead.city && <span>• {lead.city}</span>}
                        </div>
                      </td>

                      {/* Requirements */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {lead.flat_type} • {lead.interested_property || 'General Inquiry'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {lead.preferred_location || 'Location flexible'} •{' '}
                          {lead.purchase_timeline || 'N/A'}
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{(lead.budget / 100000).toFixed(1)} L
                      </td>

                      {/* Pipeline Stage */}
                      <td className="py-3 px-4">
                        <Badge stage={lead.pipeline_stage} size="sm" />
                      </td>

                      {/* Qualification */}
                      <td className="py-3 px-4">
                        <Badge qualification={lead.qualification_status} size="sm" />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <Badge priority={lead.priority} size="xs" />
                      </td>

                      {/* Assigned Executive */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {lead.assigned_name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Next Follow-up */}
                      <td className="py-3 px-4 text-[11px]">
                        {lead.next_followup_date ? (
                          <div className="flex items-center gap-1 text-amber-800 font-medium">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{lead.next_followup_date.split('T')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">None scheduled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* Qualify */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLead(lead);
                              setIsQualifyModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Qualify Buyer Criteria"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Move Stage */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLead(lead);
                              setIsStageModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Update Pipeline Stage"
                          >
                            <GitCommit className="w-4 h-4" />
                          </button>

                          {/* Log Follow Up */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLead(lead);
                              setIsFollowUpModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Log Follow-Up"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>

                          {/* Customer 360 View */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            rightIcon={<Eye className="w-3 h-3" />}
                          >
                            360°
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
          {!isLoading && leads.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, total)} of {total} leads
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
      <LeadFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdateLead}
        initialData={activeLead}
        executives={executives}
      />

      <QualifyLeadModal
        isOpen={isQualifyModalOpen}
        onClose={() => setIsQualifyModalOpen(false)}
        lead={activeLead}
        onSubmit={handleQualifyLead}
      />

      <StageChangeModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        lead={activeLead}
        onSubmit={handleUpdateStage}
      />

      <AddFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        lead={activeLead}
        onSubmit={handleAddFollowUp}
        executives={executives}
      />
    </AppShell>
  );
};
