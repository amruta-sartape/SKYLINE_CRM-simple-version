import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { LeadCard } from '../components/crm/LeadCard';
import { StageChangeModal } from '../components/crm/StageChangeModal';
import { LeadFormModal } from '../components/crm/LeadFormModal';
import { leadService } from '../services/lead.service';
import { useToast } from '../context/ToastContext';
import {
  PipelineStageSummary,
  PipelineStage,
  Lead,
  LeadFormData,
  UserSummary,
} from '../types/crm.types';
import {
  Search,
  Plus,
  List,
  DollarSign,
  Users,
  Building,
} from 'lucide-react';

export const LeadPipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [stages, setStages] = useState<PipelineStageSummary[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPipelineValue, setTotalPipelineValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [executives, setExecutives] = useState<UserSummary[]>([]);

  // Modals
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [targetLead, setTargetLead] = useState<Lead | null>(null);
  const [targetStage, setTargetStage] = useState<PipelineStage | null>(null);

  useEffect(() => {
    leadService
      .getExecutives()
      .then(setExecutives)
      .catch((err) => console.warn('Failed to fetch executives:', err));
  }, []);

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        search: searchTerm || undefined,
        assigned_to: selectedExecutive || undefined,
        flat_type: selectedConfig || undefined,
      };

      const result = await leadService.getPipelineBoard(params);
      setStages(result.stages);
      setTotalLeads(result.totalLeads);
      setTotalPipelineValue(result.totalPipelineValue);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pipeline stages.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedExecutive, selectedConfig]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleStageTransition = async (
    leadId: string,
    newStage: PipelineStage,
    remarks?: string
  ) => {
    try {
      await leadService.updateStage(leadId, newStage, remarks);
      showToast({
        variant: 'success',
        title: 'Stage Updated',
        message: `Lead successfully moved to ${newStage}.`,
      });
      fetchPipeline();
    } catch (err: any) {
      showToast({
        variant: 'error',
        title: 'Transition Failed',
        message: err.message || 'Failed to update pipeline stage.',
      });
    }
  };

  const handleCreateLead = async (data: LeadFormData) => {
    const newLead = await leadService.createLead(data);
    showToast({
      variant: 'success',
      title: 'Lead Added',
      message: `Lead ${newLead.customer_name} added to pipeline.`,
    });
    fetchPipeline();
  };

  const stageColorBadges: Record<PipelineStage, string> = {
    New: 'border-t-sky-500 bg-sky-50/40 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300',
    Contacted: 'border-t-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300',
    'Follow-up': 'border-t-purple-500 bg-purple-50/40 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300',
    'Site Visit': 'border-t-amber-500 bg-amber-50/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300',
    Negotiation: 'border-t-orange-500 bg-orange-50/40 dark:bg-orange-950/30 text-orange-900 dark:text-orange-300',
    Converted: 'border-t-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300',
    Lost: 'border-t-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300',
  };

  return (
    <AppShell>
      <div className="space-y-6 text-left animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                Lead Pipeline Board
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-amber-950/40 text-brand-700 dark:text-amber-400 border border-brand-200 dark:border-amber-800/60">
                Visual CRM Kanban
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Interactive pipeline stages from initial prospect contact to site visits and deal closings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/leads">
              <Button
                variant="outline"
                size="md"
                leftIcon={<List className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              >
                Table View
              </Button>
            </Link>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsFormModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Direct Lead
            </Button>
          </div>
        </div>

        {/* Metrics Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-4 shadow-subtle flex items-center gap-3.5">
            <div className="p-3 bg-brand-50 dark:bg-amber-950/40 text-brand-600 dark:text-amber-400 rounded-xl border border-brand-100 dark:border-amber-800/60">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Pipeline Leads</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalLeads}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-4 shadow-subtle flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/60">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Pipeline Value</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                ₹{(totalPipelineValue / 10000000).toFixed(2)} Cr
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">
                  (₹{(totalPipelineValue / 100000).toFixed(1)} L)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-4 shadow-subtle flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800/60">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Active Stages</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">7 Stages</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] p-3.5 shadow-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search leads by customer, property, city..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={selectedExecutive}
                onChange={(e) => setSelectedExecutive(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 dark:text-slate-100"
              >
                <option value="">All Assigned Executives</option>
                {executives.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 dark:text-slate-100"
              >
                <option value="">All Flat Types</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <Alert
            variant="error"
            title="Failed to load pipeline"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Visual Pipeline Board (Horizontal Scrollable Kanban) */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" variant="primary" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading Pipeline Board...</span>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1400px]">
              {stages.map((col) => (
                <div
                  key={col.stage}
                  className="w-72 shrink-0 bg-slate-50/90 dark:bg-[#141A24] rounded-xl border border-slate-200/90 dark:border-[#242F42] flex flex-col max-h-[780px]"
                >
                  {/* Column Header */}
                  <div
                    className={`p-3 rounded-t-xl border-t-4 border-b border-slate-200/80 dark:border-[#242F42] ${
                      stageColorBadges[col.stage]
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs uppercase tracking-wider">{col.stage}</h3>
                      <span className="text-[11px] font-extrabold bg-white/90 dark:bg-[#101622] text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-[#242F42] shadow-2xs">
                        {col.count}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                      <span>Volume:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        ₹{(col.totalValue / 100000).toFixed(1)} L
                      </strong>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3">
                    {col.leads.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs border-2 border-dashed border-slate-200 dark:border-[#242F42] rounded-lg">
                        No leads in {col.stage}
                      </div>
                    ) : (
                      col.leads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onView={(l) => navigate(`/leads/${l.id}`)}
                          onMoveStage={(l, next) => {
                            setTargetLead(l);
                            setTargetStage(next);
                            setIsStageModalOpen(true);
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stage Change Modal */}
      <StageChangeModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        lead={targetLead}
        targetStage={targetStage}
        onSubmit={handleStageTransition}
      />

      {/* Direct Add Lead Modal */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateLead}
        executives={executives}
      />
    </AppShell>
  );
};
