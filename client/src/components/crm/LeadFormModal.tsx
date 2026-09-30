import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type {
  Lead,
  LeadFormData,
  UserSummary,
} from '../../types/crm.types';
import type { PropertyProject } from '../../types/property.types';
import { projectService } from '../../services/project.service';
import { User, Phone, Mail, MapPin, Building, DollarSign, Calendar } from 'lucide-react';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
  initialData?: Lead | null;
  executives: UserSummary[];
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  executives,
}) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState<LeadFormData>({
    customer_name: '',
    phone: '',
    email: '',
    city: '',
    budget: 15000000,
    preferred_location: '',
    flat_type: '2 BHK',
    interested_property: '',
    loan_required: 0,
    purchase_timeline: '1-3 Months',
    purpose: 'Self Use',
    assigned_to: '',
    pipeline_stage: 'New',
    qualification_status: 'Future Prospect',
    priority: 'Medium',
    next_followup_date: '',
    notes: '',
  });

  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    projectService.list({ limit: 50 }).then((res) => setProjects(res.projects)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        customer_name: initialData.customer_name,
        phone: initialData.phone,
        email: initialData.email || '',
        city: initialData.city || '',
        budget: initialData.budget,
        preferred_location: initialData.preferred_location || '',
        flat_type: initialData.flat_type,
        interested_property: initialData.interested_property || '',
        loan_required: initialData.loan_required,
        purchase_timeline: initialData.purchase_timeline || '1-3 Months',
        purpose: initialData.purpose || 'Self Use',
        assigned_to: initialData.assigned_to || '',
        pipeline_stage: initialData.pipeline_stage,
        qualification_status: initialData.qualification_status,
        priority: initialData.priority,
        next_followup_date: initialData.next_followup_date || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        city: '',
        budget: 15000000,
        preferred_location: '',
        flat_type: '2 BHK',
        interested_property: '',
        loan_required: 0,
        purchase_timeline: '1-3 Months',
        purpose: 'Self Use',
        assigned_to: '',
        pipeline_stage: 'New',
        qualification_status: 'Future Prospect',
        priority: 'Medium',
        next_followup_date: '',
        notes: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      errs.customer_name = 'Customer name is required';
    }
    if (!formData.phone || formData.phone.trim().length < 7) {
      errs.phone = 'Valid mobile phone number is required';
    }
    if (!formData.budget || Number(formData.budget) <= 0) {
      errs.budget = 'Please provide a valid budget';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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

    if (errors[name]) {
      setErrors((prev) => {
        const u = { ...prev };
        delete u[name];
        return u;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to save lead.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit CRM Lead Profile' : 'Create Direct CRM Lead'}
      description="Record direct client lead with buyer criteria and pipeline assignment."
      maxWidth="xl"
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
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Submission Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Section 1: Customer Profile */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer Profile</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Customer Full Name" required error={errors.customer_name}>
              <Input
                name="customer_name"
                placeholder="e.g. Ananya Deshmukh"
                value={formData.customer_name}
                onChange={handleChange}
                error={errors.customer_name}
                leftIcon={<User className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Mobile Phone" required error={errors.phone}>
              <Input
                name="phone"
                type="tel"
                placeholder="e.g. +1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email Address">
              <Input
                name="email"
                type="email"
                placeholder="e.g. name@company.com"
                value={formData.email || ''}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="City / Residence Location">
              <Input
                name="city"
                placeholder="e.g. Pune, Mumbai"
                value={formData.city || ''}
                onChange={handleChange}
                leftIcon={<MapPin className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Requirements */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Requirements & Interest</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField
              label="Budget (₹)"
              required
              error={errors.budget}
              helperText={`₹${((Number(formData.budget) || 0) / 100000).toFixed(1)} Lakhs`}
            >
              <Input
                name="budget"
                type="number"
                step="100000"
                value={formData.budget || ''}
                onChange={handleChange}
                error={errors.budget}
                leftIcon={<DollarSign className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Flat Configuration" required>
              <select
                name="flat_type"
                value={formData.flat_type}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
              </select>
            </FormField>

            <FormField label="Preferred Location">
              <Input
                name="preferred_location"
                placeholder="e.g. Koregaon Park"
                value={formData.preferred_location || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Interested Project / Property">
              <div className="space-y-1.5">
                {projects.length > 0 && (
                  <select
                    onChange={(e) => {
                      const selectedProj = projects.find((p) => p.id === e.target.value);
                      if (selectedProj) {
                        setFormData((prev) => ({
                          ...prev,
                          interested_property: selectedProj.name,
                          preferred_location: prev.preferred_location || selectedProj.location,
                        }));
                      }
                    }}
                    className="w-full text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 mb-1"
                  >
                    <option value="">-- Quick Pick Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.city})
                      </option>
                    ))}
                  </select>
                )}
                <Input
                  name="interested_property"
                  placeholder="e.g. Skyline Grandeur"
                  value={formData.interested_property || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
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
        </div>

        {/* Section 3: Assignment & Pipeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Assignment & Pipeline Status</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <FormField label="Sales Executive">
              <select
                name="assigned_to"
                value={formData.assigned_to || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
              >
                <option value="">-- Unassigned --</option>
                {executives.map((exec) => (
                  <option key={exec.id} value={exec.id}>
                    {exec.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Pipeline Stage">
              <select
                name="pipeline_stage"
                value={formData.pipeline_stage || 'New'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </FormField>

            <FormField label="Qualification Status">
              <select
                name="qualification_status"
                value={formData.qualification_status || 'Future Prospect'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
              >
                <option value="Future Prospect">Future Prospect</option>
                <option value="Qualified">Qualified</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </FormField>

            <FormField label="Priority Level">
              <select
                name="priority"
                value={formData.priority || 'Medium'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent 🔥</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Lead Notes */}
        <FormField label="Lead Notes & Strategy">
          <textarea
            name="notes"
            rows={2}
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Special requirements, parking needs, decision timeline..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
