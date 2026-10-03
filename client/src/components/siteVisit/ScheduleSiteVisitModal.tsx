import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { siteVisitService } from '../../services/siteVisit.service';
import { projectService } from '../../services/project.service';
import { unitService } from '../../services/unit.service';
import { leadService } from '../../services/lead.service';
import { PropertyProject, PropertyUnit } from '../../types/property.types';
import { Lead, UserSummary } from '../../types/crm.types';
import { SiteVisitType, SiteVisitFormData } from '../../types/siteVisit.types';
import { Building, User, Car } from 'lucide-react';

interface ScheduleSiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedLead?: Lead | null;
  preselectedProperty?: {
    id: string;
    title: string;
    code?: string;
    project_id?: string;
    cover_image?: string;
    subtype?: string;
    city?: string;
    price_formatted?: string;
  } | null;
}

export const ScheduleSiteVisitModal: React.FC<ScheduleSiteVisitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedLead,
  preselectedProperty,
}) => {
  const { user } = useAuth();
  const isCustomer = Boolean(
    user?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
    String((user as any)?.role || '').toUpperCase().trim() === 'CUSTOMER'
  );

  const [formData, setFormData] = useState<SiteVisitFormData>({
    lead_id: preselectedLead?.id || '',
    project_id: preselectedProperty?.project_id || preselectedProperty?.id || preselectedLead?.interested_property || '',
    unit_id: '',
    property_id: preselectedProperty?.id || undefined,
    assigned_user_id: preselectedLead?.assigned_to || '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '11:00',
    visit_type: 'Executive Accompanied',
    remarks: '',
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [executives, setExecutives] = useState<UserSummary[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load initial dropdown data
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchInitialData = async () => {
      setIsLoadingDropdowns(true);
      setServerError(null);
      try {
        const [projRes, execRes] = await Promise.all([
          projectService.list({ is_active: 1, limit: 100 }),
          leadService.getExecutives().catch(() => [] as UserSummary[]),
        ]);

        if (!isMounted) return;
        setProjects(projRes.projects || []);
        setExecutives(execRes || []);

        if (!isCustomer && !preselectedLead) {
          const leadsRes = await leadService.getLeads({ limit: 100 }).catch(() => ({ leads: [] }));
          if (isMounted) setLeads(leadsRes.leads || []);
        }
      } catch (err: any) {
        if (isMounted) setServerError('Failed to load initial scheduling options.');
      } finally {
        if (isMounted) setIsLoadingDropdowns(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, preselectedLead, isCustomer]);

  // Sync preselected lead & property changes
  useEffect(() => {
    if (preselectedLead || preselectedProperty) {
      setFormData((prev) => ({
        ...prev,
        lead_id: preselectedLead ? preselectedLead.id : prev.lead_id,
        project_id: preselectedProperty?.project_id || preselectedProperty?.id || preselectedLead?.interested_property || prev.project_id,
        property_id: preselectedProperty?.id || (preselectedLead?.property_id ?? prev.property_id),
        assigned_user_id: preselectedLead?.assigned_to || prev.assigned_user_id,
      }));
    }
  }, [preselectedLead, preselectedProperty]);

  // Load units when project changes
  useEffect(() => {
    if (!formData.project_id) {
      setUnits([]);
      return;
    }

    let isMounted = true;
    const fetchUnits = async () => {
      try {
        const res = await unitService.list({ project_id: formData.project_id, limit: 100 });
        if (isMounted) setUnits(res.units || []);
      } catch {
        if (isMounted) setUnits([]);
      }
    };

    fetchUnits();

    return () => {
      isMounted = false;
    };
  }, [formData.project_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const u = { ...prev };
        delete u[name];
        return u;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isCustomer && !formData.lead_id) errs.lead_id = 'Please select a customer/lead';
    if (!formData.project_id && !preselectedProperty) errs.project_id = 'Please select a property project';
    if (!isCustomer && !formData.assigned_user_id) errs.assigned_user_id = 'Please assign an executive/agent';
    if (!formData.visit_date) errs.visit_date = 'Visit date is required';
    if (!formData.visit_time) errs.visit_time = 'Visit time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await siteVisitService.create({
        ...formData,
        project_id: formData.project_id || preselectedProperty?.project_id || preselectedProperty?.id || '',
        assigned_user_id: formData.assigned_user_id || executives[0]?.id || 'usr_agent_001',
        unit_id: formData.unit_id || null,
        remarks: formData.remarks || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to schedule site visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visitTypes: { type: SiteVisitType; label: string; icon: React.ReactNode }[] = [
    {
      type: 'Executive Accompanied',
      label: 'Executive Accompanied',
      icon: <User className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      type: 'Direct Visit',
      label: 'Direct Client Walk-in',
      icon: <Building className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      type: 'Pickup & Drop',
      label: 'Pickup & Drop Cab',
      icon: <Car className="w-3.5 h-3.5 text-amber-600" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Property Site Visit"
      description={
        isCustomer
          ? 'Book an exclusive on-site property walkthrough with a dedicated SKYLINE advisor'
          : preselectedLead
          ? `Booking on-site physical tour for ${preselectedLead.customer_name}`
          : 'Coordinate client property walkthrough with assigned executive'
      }
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isLoadingDropdowns}
          >
            Confirm & Schedule Visit
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Scheduling Conflict / Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {preselectedProperty && (
          <div className="p-3 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-[#141A24] dark:to-[#1C2433] border border-stone-200/20 dark:border-[#242F42] rounded-xl flex items-center gap-3.5 shadow-md">
            {preselectedProperty.cover_image ? (
              <img
                src={preselectedProperty.cover_image}
                alt={preselectedProperty.title}
                className="w-14 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-stone-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-amber-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {preselectedProperty.code || 'PROPERTY'}
                </span>
                {preselectedProperty.subtype && (
                  <span className="text-[11px] text-stone-300 font-medium truncate">
                    {preselectedProperty.subtype}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                {preselectedProperty.title}
              </h4>
              <p className="text-xs text-amber-400 font-medium">
                {preselectedProperty.price_formatted || (preselectedProperty.city ? `Located in ${preselectedProperty.city}` : '')}
              </p>
            </div>
          </div>
        )}

        {/* Lead Selection */}
        {isCustomer ? (
          <div className="p-3 bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#242F42] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-stone-500 dark:text-slate-400">Visitor Profile</div>
              <div className="text-sm font-bold text-stone-900 dark:text-slate-100">{user?.name || 'Customer'}</div>
              <div className="text-xs text-stone-500 dark:text-slate-400">{user?.email}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Verified Client</span>
              <span className="text-xs font-semibold text-stone-600 dark:text-slate-300">Direct Booking</span>
            </div>
          </div>
        ) : preselectedLead ? (
          <div className="p-3 bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Selected Lead</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{preselectedLead.customer_name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{preselectedLead.phone} • {preselectedLead.city}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Stage</span>
              <span className="text-xs font-semibold text-brand-600 dark:text-amber-400">{preselectedLead.pipeline_stage}</span>
            </div>
          </div>
        ) : (
          <FormField label="Select Customer / Lead" required error={errors.lead_id}>
            <select
              name="lead_id"
              value={formData.lead_id}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingDropdowns}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#2A364C] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-500/20 focus:border-slate-900 dark:focus:border-amber-500 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="">-- Choose Lead --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.customer_name} ({l.phone}) - {l.pipeline_stage}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {/* Property Project & Unit Picker */}
        {!isCustomer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Property Project" required error={errors.project_id}>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                disabled={isSubmitting || isLoadingDropdowns}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#2A364C] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-500/20 focus:border-slate-900 dark:focus:border-amber-500 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) - {p.location}, {p.city}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Specific Unit / Flat (Optional)"
              helperText="Leave empty if touring general sample flats"
            >
              <select
                name="unit_id"
                value={formData.unit_id || ''}
                onChange={handleChange}
                disabled={isSubmitting || !formData.project_id || units.length === 0}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#2A364C] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-500/20 focus:border-slate-900 dark:focus:border-amber-500 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="">-- Any Available / Sample Flat --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unit_number} ({u.configuration} • {u.floor}F • {u.availability_status})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        )}

        {/* Assigned Executive (Staff Only) */}
        {!isCustomer && (
          <FormField
            label="Assigned Executive / Tour Host"
            required
            error={errors.assigned_user_id}
            helperText="Executive will be verified for calendar schedule conflicts"
          >
            <select
              name="assigned_user_id"
              value={formData.assigned_user_id}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingDropdowns}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#2A364C] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-500/20 focus:border-slate-900 dark:focus:border-amber-500 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="">-- Select Executive --</option>
              {executives.map((exec) => (
                <option key={exec.id} value={exec.id}>
                  {exec.name} ({exec.role}) - {exec.email}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Visit Date" required error={errors.visit_date}>
            <div className="relative">
              <Input
                name="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </FormField>

          <FormField label="Visit Time" required error={errors.visit_time}>
            <div className="relative">
              <Input
                name="visit_time"
                type="time"
                value={formData.visit_time}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </FormField>
        </div>

        {/* Visit Type Picker */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-200 text-xs block">Site Visit Format</label>
          <div className="grid grid-cols-3 gap-2">
            {visitTypes.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visit_type: item.type }))}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  formData.visit_type === item.type
                    ? 'bg-brand-50 dark:bg-amber-950/40 border-brand-500 dark:border-amber-500 shadow-xs text-brand-900 dark:text-amber-300 ring-1 ring-brand-500 dark:ring-amber-500'
                    : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2230]'
                }`}
              >
                <div className="mb-1">{item.icon}</div>
                <span className="text-[11px] font-bold leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Remarks / Instructions */}
        <FormField
          label="Preparation Instructions / Notes"
          helperText="Gate pass requirements, sample flat keys, client preferences"
        >
          <textarea
            name="remarks"
            rows={2}
            value={formData.remarks || ''}
            onChange={handleChange}
            placeholder="e.g. Client family arriving by car. Show East-facing 3 BHK sample flat first..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#2A364C] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-500/20 focus:border-slate-900 dark:focus:border-amber-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
