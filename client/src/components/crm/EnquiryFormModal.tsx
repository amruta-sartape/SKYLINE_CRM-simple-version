import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../context/AuthContext';
import type {
  Enquiry,
  EnquiryFormData,
  UserSummary,
} from '../../types/crm.types';
import type { PropertyProject } from '../../types/property.types';
import { projectService } from '../../services/project.service';
import { User, Phone, Mail, MapPin, Building, DollarSign, Calendar } from 'lucide-react';

interface EnquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EnquiryFormData) => Promise<void>;
  initialData?: Enquiry | null;
  initialPropertyContext?: {
    id: string;
    title: string;
    code?: string;
    subtype?: string;
    city?: string;
    price?: number | string;
    price_formatted?: string;
    cover_image?: string;
  } | null;
  executives: UserSummary[];
}

export const EnquiryFormModal: React.FC<EnquiryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialPropertyContext,
  executives,
}) => {
  const { user } = useAuth();
  const isEdit = Boolean(initialData);
  const isCustomer = Boolean(
    user?.roles?.some((r: string) => String(r).toUpperCase().trim() === 'CUSTOMER') ||
    String((user as any)?.role || '').toUpperCase().trim() === 'CUSTOMER'
  );

  const [formData, setFormData] = useState<EnquiryFormData>({
    customer_name: user?.name || '',
    phone: user?.phone || '+1 (555) 0100',
    email: user?.email || '',
    city: 'Mumbai',
    budget: 10000000,
    interested_property: '',
    property_id: undefined,
    configuration: '2 BHK',
    lead_source: 'Website',
    assigned_to: '',
    status: 'New Lead',
    enquiry_date: new Date().toISOString().split('T')[0],
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
        interested_property: initialData.interested_property,
        property_id: initialData.property_id || undefined,
        configuration: initialData.configuration,
        lead_source: initialData.lead_source,
        assigned_to: initialData.assigned_to || '',
        status: initialData.status,
        enquiry_date: initialData.enquiry_date ? initialData.enquiry_date.split('T')[0] : '',
      });
    } else if (initialPropertyContext) {
      // Parse numeric budget if possible
      let budgetVal = 10000000;
      if (typeof initialPropertyContext.price === 'number') {
        budgetVal = initialPropertyContext.price;
      }

      setFormData({
        customer_name: user?.name || '',
        phone: user?.phone || '+1 (555) 0100',
        email: user?.email || '',
        city: initialPropertyContext.city || 'Mumbai',
        budget: budgetVal,
        interested_property: initialPropertyContext.title,
        property_id: initialPropertyContext.id,
        configuration: '2 BHK',
        lead_source: 'Website',
        assigned_to: executives[0]?.id || '',
        status: 'New Lead',
        enquiry_date: new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        customer_name: user?.name || '',
        phone: user?.phone || '+1 (555) 0100',
        email: user?.email || '',
        city: 'Mumbai',
        budget: 10000000,
        interested_property: '',
        property_id: undefined,
        configuration: '2 BHK',
        lead_source: 'Website',
        assigned_to: executives[0]?.id || '',
        status: 'New Lead',
        enquiry_date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, initialPropertyContext, isOpen, user, executives]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      errs.customer_name = 'Customer name must be at least 2 characters';
    }
    if (!formData.phone || formData.phone.trim().length < 7) {
      errs.phone = 'Valid phone number is required';
    }
    if (!formData.interested_property || formData.interested_property.trim().length < 2) {
      errs.interested_property = 'Interested property name is required';
    }
    if (!formData.budget || Number(formData.budget) <= 0) {
      errs.budget = 'Please specify a valid budget greater than 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value,
    }));
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
      setServerError(err.message || 'Failed to save enquiry. Please check your input.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Client Enquiry' : 'Log New Client Enquiry'}
      description="Capture inbound prospect inquiries across marketing channels."
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
            {isEdit ? 'Save Changes' : 'Submit Enquiry'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-left" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Submission Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {initialPropertyContext && (
          <div className="p-3 bg-gradient-to-r from-navy-900/90 to-navy-800 border border-gold-500/30 rounded-xl flex items-center gap-3.5 shadow-md">
            {initialPropertyContext.cover_image ? (
              <img
                src={initialPropertyContext.cover_image}
                alt={initialPropertyContext.title}
                className="w-14 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-navy-700/60 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-gold-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  {initialPropertyContext.code || 'PROPERTY'}
                </span>
                {initialPropertyContext.subtype && (
                  <span className="text-[11px] text-slate-300 font-medium truncate">
                    {initialPropertyContext.subtype}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                {initialPropertyContext.title}
              </h4>
              <p className="text-xs text-gold-400 font-medium">
                {initialPropertyContext.price_formatted || (initialPropertyContext.city ? `Located in ${initialPropertyContext.city}` : '')}
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Customer Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer Information</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Customer Name" required error={errors.customer_name}>
              <Input
                name="customer_name"
                placeholder="e.g. Rahul Sharma"
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
            <FormField label="Email Address" error={errors.email}>
              <Input
                name="email"
                type="email"
                placeholder="e.g. name@example.com"
                value={formData.email || ''}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="City / Region" error={errors.city}>
              <Input
                name="city"
                placeholder="e.g. Mumbai, Pune, Bangalore"
                value={formData.city || ''}
                onChange={handleChange}
                error={errors.city}
                leftIcon={<MapPin className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Property Interest */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Property Interest & Budget</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Interested Property" required error={errors.interested_property}>
              <div className="space-y-1.5">
                {projects.length > 0 && (
                  <select
                    onChange={(e) => {
                      const selectedProj = projects.find((p) => p.id === e.target.value);
                      if (selectedProj) {
                        setFormData((prev) => ({
                          ...prev,
                          interested_property: selectedProj.name,
                          city: prev.city || selectedProj.city,
                        }));
                      }
                    }}
                    className="w-full text-[11px] px-2 py-1 bg-slate-50 dark:bg-[#101622] border border-slate-200 dark:border-[#242F42] rounded text-slate-600 dark:text-slate-300 mb-1"
                  >
                    <option value="">-- Quick Pick from Project Master --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code} - {p.city})
                      </option>
                    ))}
                  </select>
                )}
                <Input
                  name="interested_property"
                  placeholder="e.g. Skyline Heights"
                  value={formData.interested_property}
                  onChange={handleChange}
                  error={errors.interested_property}
                  leftIcon={<Building className="w-4 h-4" />}
                  disabled={isSubmitting}
                />
              </div>
            </FormField>

            <FormField label="Flat Configuration" required error={errors.configuration}>
              <select
                name="configuration"
                value={formData.configuration}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
              >
                <option value="1 BHK">1 BHK Apartment</option>
                <option value="2 BHK">2 BHK Apartment</option>
                <option value="3 BHK">3 BHK Luxury</option>
                <option value="4 BHK">4 BHK Penthouse/Suite</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Estimated Budget (in ₹ or Currency Value)"
              required
              error={errors.budget}
              helperText={`₹${((Number(formData.budget) || 0) / 100000).toFixed(1)} Lakhs`}
            >
              <Input
                name="budget"
                type="number"
                step="100000"
                min="0"
                placeholder="e.g. 15000000"
                value={formData.budget || ''}
                onChange={handleChange}
                error={errors.budget}
                leftIcon={<DollarSign className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Lead Source" required error={errors.lead_source}>
              <select
                name="lead_source"
                value={formData.lead_source}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
              >
                <option value="Website">Website</option>
                <option value="Facebook / Instagram">Facebook / Instagram</option>
                <option value="Google Ads">Google Ads</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Referral">Referral</option>
                <option value="Property Portal">Property Portal</option>
              </select>
            </FormField>
          </div>
        </div>
        {/* Section 3: Assignment & Status (Staff Only) */}
        {!isCustomer && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Assignment & Status</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Assigned Sales Executive">
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

              <FormField label="Enquiry Status">
                <select
                  name="status"
                  value={formData.status || 'New Lead'}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </FormField>

              <FormField label="Enquiry Date">
                <Input
                  name="enquiry_date"
                  type="date"
                  value={formData.enquiry_date || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

