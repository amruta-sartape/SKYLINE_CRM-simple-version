import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type {
  Enquiry,
  ConvertEnquiryFormData,
  UserSummary,
} from '../../types/crm.types';
import { ArrowRight } from 'lucide-react';

interface ConvertToLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: Enquiry | null;
  onSubmit: (enquiryId: string, data: ConvertEnquiryFormData) => Promise<void>;
  executives: UserSummary[];
}

export const ConvertToLeadModal: React.FC<ConvertToLeadModalProps> = ({
  isOpen,
  onClose,
  enquiry,
  onSubmit,
  executives,
}) => {
  if (!enquiry) return null;

  const [formData, setFormData] = useState<ConvertEnquiryFormData>({
    preferred_location: enquiry.city || '',
    loan_required: 0,
    purchase_timeline: '1-3 Months',
    purpose: 'Self Use',
    assigned_to: enquiry.assigned_to || '',
    priority: 'Medium',
    notes: `Converted from inbound ${enquiry.lead_source} enquiry for ${enquiry.interested_property}.`,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(enquiry.id, formData);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to convert enquiry to lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Enquiry to CRM Lead"
      description={`Initialize sales pipeline & qualification for ${enquiry.customer_name}.`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="luxury"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Confirm & Convert to Lead
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Conversion Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Enquiry Summary Pill */}
        <div className="p-3 bg-brand-50/70 dark:bg-amber-950/30 border border-brand-200/80 dark:border-amber-800/40 rounded-lg flex items-center justify-between">
          <div>
            <div className="font-bold text-brand-950 dark:text-amber-200 text-sm">{enquiry.customer_name}</div>
            <div className="text-[11px] text-brand-800 dark:text-amber-300/80">
              {enquiry.configuration} • {enquiry.interested_property} • ₹
              {(enquiry.budget / 100000).toFixed(1)} Lakhs
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-[#101622] px-2 py-1 rounded border border-brand-200 dark:border-amber-800/40 text-brand-700 dark:text-amber-300">
            Source: {enquiry.lead_source}
          </span>
        </div>

        {/* Qualification & Pipeline Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <FormField label="Preferred Location / Micro-Market">
            <Input
              name="preferred_location"
              placeholder="e.g. Bandra West, Whitefield"
              value={formData.preferred_location || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Assigned Sales Agent / Executive">
            <select
              name="assigned_to"
              value={formData.assigned_to || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Unassigned --</option>
              {executives.map((exec) => (
                <option key={exec.id} value={exec.id}>
                  {exec.name} ({exec.role || 'Staff'})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Purchase Timeline">
            <select
              name="purchase_timeline"
              value={formData.purchase_timeline || '1-3 Months'}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
            >
              <option value="Immediate">Immediate (0-30 days)</option>
              <option value="1-3 Months">1-3 Months</option>
              <option value="3-6 Months">3-6 Months</option>
              <option value="6+ Months">6+ Months</option>
            </select>
          </FormField>

          <FormField label="Purchase Purpose">
            <select
              name="purpose"
              value={formData.purpose || 'Self Use'}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
            >
              <option value="Self Use">Self Use (End User)</option>
              <option value="Investment">Investment (Rental/Capital)</option>
            </select>
          </FormField>

          <FormField label="Lead Priority">
            <select
              name="priority"
              value={formData.priority || 'Medium'}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent 🔥</option>
            </select>
          </FormField>
        </div>

        {/* Loan Requirement Checkbox */}
        <div className="p-3 bg-slate-50 dark:bg-[#141A24] border border-slate-200/80 dark:border-[#242F42] rounded-lg flex items-center justify-between">
          <div>
            <label htmlFor="loan_required" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              Home Loan Assistance Required?
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Flag lead for bank verification & loan processing desk
            </p>
          </div>
          <input
            id="loan_required"
            type="checkbox"
            name="loan_required"
            checked={Boolean(formData.loan_required)}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-slate-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        {/* Notes */}
        <FormField label="Initial Lead Remarks / Strategy Notes">
          <textarea
            name="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
            placeholder="Key preferences, customer availability for site visits..."
          />
        </FormField>
      </form>
    </Modal>
  );
};
