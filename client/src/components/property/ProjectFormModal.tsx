import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type { PropertyProject, ProjectFormData, ProjectStatus } from '../../types/property.types';
import { Building2, MapPin, Layers, Plus, Trash2, ShieldCheck, Tag } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: PropertyProject | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    code: '',
    location: '',
    city: '',
    state: 'Maharashtra',
    developer: 'Skyline Realty Group',
    status: 'Active',
    description: '',
    wings: [{ name: 'Wing A', total_floors: 10, units_per_floor: 4 }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        location: initialData.location,
        city: initialData.city,
        state: initialData.state,
        developer: initialData.developer || 'Skyline Realty Group',
        status: initialData.status,
        description: initialData.description || '',
        wings: initialData.wings && initialData.wings.length > 0
          ? initialData.wings.map((w) => ({
              name: w.name,
              total_floors: w.total_floors,
              units_per_floor: w.units_per_floor,
            }))
          : [{ name: 'Wing A', total_floors: 10, units_per_floor: 4 }],
      });
    } else {
      setFormData({
        name: '',
        code: '',
        location: '',
        city: '',
        state: 'Maharashtra',
        developer: 'Skyline Realty Group',
        status: 'Active',
        description: '',
        wings: [{ name: 'Wing A', total_floors: 10, units_per_floor: 4 }],
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleWingChange = (
    index: number,
    field: 'name' | 'total_floors' | 'units_per_floor',
    val: any
  ) => {
    setFormData((prev) => {
      const updatedWings = [...(prev.wings || [])];
      updatedWings[index] = {
        ...updatedWings[index],
        [field]: field === 'name' ? val : Number(val) || 1,
      };
      return { ...prev, wings: updatedWings };
    });
  };

  const addWing = () => {
    setFormData((prev) => {
      const wings = prev.wings || [];
      const nextLetter = String.fromCharCode(65 + wings.length);
      return {
        ...prev,
        wings: [...wings, { name: `Wing ${nextLetter}`, total_floors: 10, units_per_floor: 4 }],
      };
    });
  };

  const removeWing = (index: number) => {
    setFormData((prev) => {
      const wings = [...(prev.wings || [])];
      if (wings.length <= 1) return prev; // Keep at least one
      wings.splice(index, 1);
      return { ...prev, wings };
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) errs.name = 'Project name is required';
    if (!formData.code.trim()) errs.code = 'Project code is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';

    if (!isEdit && (!formData.wings || formData.wings.length === 0)) {
      errs.wings = 'At least one wing is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to save project.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: ProjectStatus[] = ['Upcoming', 'Active', 'Completed', 'On Hold'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Property Project' : 'Register New Property Project'}
      description="Create master real-estate project entry with wing configurations."
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
            {isEdit ? 'Save Changes' : 'Create Project'}
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

        {/* Section 1: Identification */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Project Identity</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <FormField label="Project Name" required error={errors.name}>
                <Input
                  name="name"
                  placeholder="e.g. Skyline Heights"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <FormField label="Project Code" required error={errors.code}>
              <Input
                name="code"
                placeholder="e.g. SKH"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                leftIcon={<Tag className="w-4 h-4" />}
                disabled={isSubmitting || isEdit}
                className="uppercase font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Developer / Firm" required>
              <Input
                name="developer"
                placeholder="e.g. Skyline Realty Group"
                value={formData.developer || ''}
                onChange={handleChange}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Project Lifecycle Status" required>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Project Location</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <FormField label="Locality / Area" required error={errors.location}>
                <Input
                  name="location"
                  placeholder="e.g. Kharadi IT Park"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <FormField label="City" required error={errors.city}>
              <Input
                name="city"
                placeholder="e.g. Pune"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="State" required error={errors.state}>
              <Input
                name="state"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Wing Structure (Only for new projects or wing summary) */}
        {!isEdit && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Building / Wing Configurations ({formData.wings?.length || 0})</span>
              </h4>
              <button
                type="button"
                onClick={addWing}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Wing</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.wings?.map((w, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 items-center"
                >
                  <div className="col-span-5">
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      Wing Name
                    </label>
                    <input
                      type="text"
                      value={w.name}
                      onChange={(e) => handleWingChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Wing A"
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                      required
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      Floors
                    </label>
                    <input
                      type="number"
                      value={w.total_floors || 10}
                      onChange={(e) => handleWingChange(idx, 'total_floors', e.target.value)}
                      min={1}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      Units/Floor
                    </label>
                    <input
                      type="number"
                      value={w.units_per_floor || 4}
                      onChange={(e) => handleWingChange(idx, 'units_per_floor', e.target.value)}
                      min={1}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="col-span-1 text-right pt-4">
                    {formData.wings && formData.wings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWing(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove Wing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Project Overview & Amenities</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Key architectural highlights, panoramic views, connectivity, and clubhouse features..."
            value={formData.description || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
      </form>
    </Modal>
  );
};
