import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type {
  Lead,
  FollowUpFormData,
  FollowUpType,
  UserSummary,
} from '../../types/crm.types';
import { PhoneCall, MessageSquare, Mail, Calendar, Video, Users } from 'lucide-react';

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSubmit: (leadId: string, data: FollowUpFormData) => Promise<void>;
  executives: UserSummary[];
}

export const AddFollowUpModal: React.FC<AddFollowUpModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSubmit,
  executives,
}) => {
  if (!lead) return null;

  const [formData, setFormData] = useState<FollowUpFormData>({
    type: 'Phone Call',
    followup_date: new Date().toISOString().split('T')[0],
    followup_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    remarks: '',
    next_followup_date: '',
    executive_id: lead.assigned_to || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.remarks || formData.remarks.trim().length < 2) {
      errs.remarks = 'Please provide detailed follow-up remarks / interaction notes';
    }
    if (!formData.followup_date) {
      errs.followup_date = 'Follow-up date is required';
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
      await onSubmit(lead.id, formData);
      setFormData({
        type: 'Phone Call',
        followup_date: new Date().toISOString().split('T')[0],
        followup_time: '',
        remarks: '',
        next_followup_date: '',
        executive_id: lead.assigned_to || '',
      });
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to log follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const followUpTypes: { type: FollowUpType; icon: React.ReactNode }[] = [
    { type: 'Phone Call', icon: <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> },
    { type: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> },
    { type: 'Email', icon: <Mail className="w-3.5 h-3.5 text-amber-600" /> },
    { type: 'Meeting', icon: <Users className="w-3.5 h-3.5 text-purple-600" /> },
    { type: 'Video Call', icon: <Video className="w-3.5 h-3.5 text-indigo-600" /> },
    { type: 'SMS', icon: <MessageSquare className="w-3.5 h-3.5 text-slate-600" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Follow-Up Interaction"
      description={`Log client conversation details for ${lead.customer_name}.`}
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
          >
            Save Follow-Up Log
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Logging Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Interaction Type Picker */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 text-xs block">Communication Channel</label>
          <div className="grid grid-cols-3 gap-2">
            {followUpTypes.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: item.type }))}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                  formData.type === item.type
                    ? 'bg-white border-slate-900 shadow-2xs text-slate-900 ring-1 ring-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {item.icon}
                <span>{item.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Follow-Up Date" required error={errors.followup_date}>
            <Input
              name="followup_date"
              type="date"
              value={formData.followup_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Time">
            <Input
              name="followup_time"
              type="time"
              value={formData.followup_time || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Remarks */}
        <FormField
          label="Discussion Remarks & Client Feedback"
          required
          error={errors.remarks}
          helperText="Summarize key points discussed, property objections, or price feedback"
        >
          <textarea
            name="remarks"
            rows={3}
            value={formData.remarks}
            onChange={handleChange}
            placeholder="e.g. Client liked the layout of Skyline Grandeur 3 BHK. Requested sample flat video before finalizing site visit..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>

        {/* Next Action Scheduling */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Next Follow-Up Commitment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Next Follow-Up Date">
              <Input
                name="next_followup_date"
                type="datetime-local"
                value={formData.next_followup_date || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Executive Responsible">
              <select
                name="executive_id"
                value={formData.executive_id || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
              >
                <option value="">-- Keep Current Executive --</option>
                {executives.map((exec) => (
                  <option key={exec.id} value={exec.id}>
                    {exec.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </form>
    </Modal>
  );
};
