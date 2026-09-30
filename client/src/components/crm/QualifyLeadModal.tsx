import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type {
  Lead,
  QualifyLeadFormData,
} from '../../types/crm.types';
import { ShieldCheck, DollarSign } from 'lucide-react';

interface QualifyLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSubmit: (leadId: string, data: QualifyLeadFormData) => Promise<void>;
}

export const QualifyLeadModal: React.FC<QualifyLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSubmit,
}) => {
  if (!lead) return null;

  const [formData, setFormData] = useState<QualifyLeadFormData>({
    qualification_status: lead.qualification_status || 'Qualified',
    budget: lead.budget,
    loan_required: lead.loan_required || 0,
    preferred_location: lead.preferred_location || '',
    flat_type: lead.flat_type || '2 BHK',
    purchase_timeline: lead.purchase_timeline || '1-3 Months',
    purpose: lead.purpose || 'Self Use',
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        qualification_status: lead.qualification_status || 'Qualified',
        budget: lead.budget,
        loan_required: lead.loan_required || 0,
        preferred_location: lead.preferred_location || '',
        flat_type: lead.flat_type || '2 BHK',
        purchase_timeline: lead.purchase_timeline || '1-3 Months',
        purpose: lead.purpose || 'Self Use',
        remarks: '',
      });
    }
    setServerError(null);
  }, [lead, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else if (name === 'budget') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(lead.id, formData);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to update qualification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Qualification & Buyer Criteria"
      description={`Qualify and update buyer requirements for ${lead.customer_name}.`}
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
            leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          >
            Save Qualification Status
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Update Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Qualification Status Picker */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="font-bold text-slate-800 text-xs block">
            Lead Qualification Outcome
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'Qualified', label: 'Qualified', color: 'emerald' },
              { id: 'Future Prospect', label: 'Future Prospect', color: 'blue' },
              { id: 'Not Interested', label: 'Not Interested', color: 'rose' },
              { id: 'Wrong Number', label: 'Wrong Number', color: 'slate' },
              { id: 'Duplicate', label: 'Duplicate', color: 'amber' },
            ].map((st) => (
              <label
                key={st.id}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer font-medium transition-all ${
                  formData.qualification_status === st.id
                    ? 'bg-white border-slate-900 shadow-2xs font-bold text-slate-900 ring-1 ring-slate-900'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="qualification_status"
                  value={st.id}
                  checked={formData.qualification_status === st.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    st.color === 'emerald'
                      ? 'bg-emerald-500'
                      : st.color === 'blue'
                      ? 'bg-blue-500'
                      : st.color === 'rose'
                      ? 'bg-rose-500'
                      : st.color === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span>{st.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            label="Verified Budget"
            helperText={`₹${((Number(formData.budget) || 0) / 100000).toFixed(1)} Lakhs`}
          >
            <Input
              name="budget"
              type="number"
              step="100000"
              value={formData.budget || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </FormField>

          <FormField label="Flat Type Configuration">
            <select
              name="flat_type"
              value={formData.flat_type || '2 BHK'}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
            >
              <option value="1 BHK">1 BHK Apartment</option>
              <option value="2 BHK">2 BHK Apartment</option>
              <option value="3 BHK">3 BHK Luxury</option>
              <option value="4 BHK">4 BHK Penthouse/Suite</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Preferred Location">
            <Input
              name="preferred_location"
              value={formData.preferred_location || ''}
              onChange={handleChange}
              placeholder="e.g. Bandra, Kalyani Nagar"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Purchase Timeline">
            <select
              name="purchase_timeline"
              value={formData.purchase_timeline || '1-3 Months'}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
            >
              <option value="Immediate">Immediate</option>
              <option value="1-3 Months">1-3 Months</option>
              <option value="3-6 Months">3-6 Months</option>
              <option value="6+ Months">6+ Months</option>
            </select>
          </FormField>

          <FormField label="Self Use / Investment">
            <select
              name="purpose"
              value={formData.purpose || 'Self Use'}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
            >
              <option value="Self Use">Self Use</option>
              <option value="Investment">Investment</option>
            </select>
          </FormField>
        </div>

        {/* Loan Required Toggle */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
          <div>
            <label htmlFor="qual_loan_required" className="font-bold text-slate-800 cursor-pointer">
              Bank Home Loan Required?
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Identifies financing needs for loan processing assistance
            </p>
          </div>
          <input
            id="qual_loan_required"
            type="checkbox"
            name="loan_required"
            checked={Boolean(formData.loan_required)}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        {/* Qualification Remarks */}
        <FormField label="Qualification Notes & Executive Remarks">
          <textarea
            name="remarks"
            rows={2}
            value={formData.remarks || ''}
            onChange={handleChange}
            placeholder="e.g. Verified budget capability, client looking for possession within 6 months..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
