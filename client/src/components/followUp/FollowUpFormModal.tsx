import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { followUpService } from '../../services/followUp.service';
import { leadService } from '../../services/lead.service';
import { Lead, UserSummary } from '../../types/crm.types';
import { FollowUpType, FollowUpFormData } from '../../types/followUp.types';
import { PhoneCall, MessageSquare, Mail, Calendar, Video, Users } from 'lucide-react';

interface FollowUpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedLead?: Lead | null;
  siteVisitId?: string | null;
}

export const FollowUpFormModal: React.FC<FollowUpFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedLead,
  siteVisitId,
}) => {
  const [formData, setFormData] = useState<FollowUpFormData>({
    lead_id: preselectedLead?.id || '',
    site_visit_id: siteVisitId || null,
    assigned_user_id: preselectedLead?.assigned_to || '',
    follow_up_type: 'Phone Call',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '10:30',
    remarks: '',
    next_follow_up_date: '',
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [executives, setExecutives] = useState<UserSummary[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchDropdowns = async () => {
      setIsLoadingDropdowns(true);
      setServerError(null);
      try {
        const execRes = await leadService.getExecutives();
        if (!isMounted) return;
        setExecutives(execRes || []);

        if (!preselectedLead) {
          const leadsRes = await leadService.getLeads({ limit: 100 });
          if (isMounted) setLeads(leadsRes.leads || []);
        }
      } catch {
        if (isMounted) setServerError('Failed to load executives or leads list.');
      } finally {
        if (isMounted) setIsLoadingDropdowns(false);
      }
    };

    fetchDropdowns();

    return () => {
      isMounted = false;
    };
  }, [isOpen, preselectedLead]);

  useEffect(() => {
    if (preselectedLead) {
      setFormData((prev) => ({
        ...prev,
        lead_id: preselectedLead.id,
        assigned_user_id: preselectedLead.assigned_to || prev.assigned_user_id,
        site_visit_id: siteVisitId || prev.site_visit_id,
      }));
    }
  }, [preselectedLead, siteVisitId]);

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
    if (!formData.lead_id) errs.lead_id = 'Please select a customer/lead';
    if (!formData.scheduled_date) errs.scheduled_date = 'Scheduled date is required';
    if (!formData.remarks || formData.remarks.trim().length < 2) {
      errs.remarks = 'Please provide follow-up discussion points / purpose';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await followUpService.create({
        ...formData,
        site_visit_id: formData.site_visit_id || null,
        assigned_user_id: formData.assigned_user_id || null,
        scheduled_time: formData.scheduled_time || null,
        next_follow_up_date: formData.next_follow_up_date || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to schedule follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const followUpTypes: { type: FollowUpType; label: string; icon: React.ReactNode }[] = [
    { type: 'Phone Call', label: 'Phone Call', icon: <PhoneCall className="w-3.5 h-3.5 text-indigo-600" /> },
    { type: 'WhatsApp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> },
    { type: 'Email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-sky-600" /> },
    { type: 'Meeting', label: 'Direct Meeting', icon: <Users className="w-3.5 h-3.5 text-purple-600" /> },
    { type: 'Video Call', label: 'Video Call', icon: <Video className="w-3.5 h-3.5 text-pink-600" /> },
    { type: 'SMS', label: 'SMS Notice', icon: <MessageSquare className="w-3.5 h-3.5 text-slate-600" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Client Follow-Up"
      description={
        preselectedLead
          ? `Plan interaction for ${preselectedLead.customer_name}`
          : 'Plan phone call, WhatsApp touchpoint, or video meeting'
      }
      maxWidth="md"
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
            Save & Schedule
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Follow-up Scheduling Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Lead Selection */}
        {preselectedLead ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Target Customer</div>
              <div className="text-sm font-bold text-slate-900">{preselectedLead.customer_name}</div>
              <div className="text-xs text-slate-500">{preselectedLead.phone} • {preselectedLead.city}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage</span>
              <span className="text-xs font-semibold text-brand-600">{preselectedLead.pipeline_stage}</span>
            </div>
          </div>
        ) : (
          <FormField label="Select Customer / Lead" required error={errors.lead_id}>
            <select
              name="lead_id"
              value={formData.lead_id}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingDropdowns}
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
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

        {/* Channel Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs block">Communication Channel</label>
          <div className="grid grid-cols-3 gap-2">
            {followUpTypes.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, follow_up_type: item.type }))}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                  formData.follow_up_type === item.type
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900 ring-1 ring-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Follow-Up Date" required error={errors.scheduled_date}>
            <Input
              name="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Time">
            <Input
              name="scheduled_time"
              type="time"
              value={formData.scheduled_time || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Assigned Executive */}
        <FormField label="Assigned Executive">
          <select
            name="assigned_user_id"
            value={formData.assigned_user_id || ''}
            onChange={handleChange}
            disabled={isSubmitting || isLoadingDropdowns}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
          >
            <option value="">-- Keep Current Executive --</option>
            {executives.map((exec) => (
              <option key={exec.id} value={exec.id}>
                {exec.name} ({exec.role})
              </option>
            ))}
          </select>
        </FormField>

        {/* Remarks / Agenda */}
        <FormField
          label="Purpose / Agenda Notes"
          required
          error={errors.remarks}
          helperText="Topics to discuss or follow-up reason"
        >
          <textarea
            name="remarks"
            rows={3}
            value={formData.remarks}
            onChange={handleChange}
            placeholder="e.g. Call to discuss payment schedule options and bank loan approval status..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>

        {/* Optional Next Follow-up Commitment */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Tentative Next Follow-up Commitment (Optional)</span>
          </div>
          <Input
            name="next_follow_up_date"
            type="date"
            value={formData.next_follow_up_date || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
};
