import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import type {
  PropertyUnit,
  PropertyProject,
  PropertyWing,
  Amenity,
  UnitFormData,
  UnitAvailability,
  ParkingType,
} from '../../types/property.types';
import {
  Building2,
  Layers,
  Home,
  DollarSign,
  Maximize2,
  Car,
  Compass,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => Promise<void>;
  initialData?: PropertyUnit | null;
  projects: PropertyProject[];
  amenities: Amenity[];
}

export const UnitFormModal: React.FC<UnitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects,
  amenities,
}) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState<UnitFormData>({
    project_id: '',
    wing_id: '',
    unit_number: '',
    floor: 1,
    configuration: '2 BHK',
    carpet_area: 850,
    built_up_area: 1100,
    price: 8500000,
    parking_type: 'Included',
    parking_slot: '',
    availability_status: 'Available',
    facing: 'East Facing',
    description: '',
    amenity_ids: [],
  });

  const [availableWings, setAvailableWings] = useState<PropertyWing[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        project_id: initialData.project_id,
        wing_id: initialData.wing_id,
        unit_number: initialData.unit_number,
        floor: initialData.floor,
        configuration: initialData.configuration,
        carpet_area: initialData.carpet_area,
        built_up_area: initialData.built_up_area,
        price: initialData.price,
        parking_type: initialData.parking_type,
        parking_slot: initialData.parking_slot || '',
        availability_status: initialData.availability_status,
        facing: initialData.facing || '',
        description: initialData.description || '',
        amenity_ids: initialData.amenity_ids || initialData.amenities?.map((a) => a.id) || [],
      });

      // Load wings for project
      const proj = projects.find((p) => p.id === initialData.project_id);
      setAvailableWings(proj?.wings || []);
    } else {
      const defaultProj = projects[0];
      const defaultWing = defaultProj?.wings?.[0];

      setFormData({
        project_id: defaultProj?.id || '',
        wing_id: defaultWing?.id || '',
        unit_number: '',
        floor: 1,
        configuration: '2 BHK',
        carpet_area: 850,
        built_up_area: 1100,
        price: 8500000,
        parking_type: 'Included',
        parking_slot: '',
        availability_status: 'Available',
        facing: 'East Facing',
        description: '',
        amenity_ids: ['amn_clubhouse', 'amn_security', 'amn_backup', 'amn_parking'],
      });

      setAvailableWings(defaultProj?.wings || []);
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen, projects]);

  // Handle Project Change
  const handleProjectChange = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const wings = proj?.wings || [];
    setAvailableWings(wings);
    setFormData((prev) => ({
      ...prev,
      project_id: projectId,
      wing_id: wings[0]?.id || '',
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const finalVal = type === 'number' ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: finalVal }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => {
      const current = prev.amenity_ids || [];
      const exists = current.includes(amenityId);
      const updated = exists ? current.filter((id) => id !== amenityId) : [...current, amenityId];
      return { ...prev, amenity_ids: updated };
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.project_id) errs.project_id = 'Please select a project';
    if (!formData.wing_id) errs.wing_id = 'Please select a building/wing';
    if (!formData.unit_number.trim()) errs.unit_number = 'Unit number is required (e.g. A-101)';
    if (formData.floor === undefined || isNaN(formData.floor)) errs.floor = 'Valid floor number is required';
    if (!formData.carpet_area || formData.carpet_area <= 0) errs.carpet_area = 'Valid carpet area is required';
    if (!formData.built_up_area || formData.built_up_area <= 0) errs.built_up_area = 'Valid built-up area is required';
    if (formData.built_up_area < formData.carpet_area) {
      errs.built_up_area = 'Built-up area must be ≥ carpet area';
    }
    if (!formData.price || formData.price <= 0) errs.price = 'Valid price in INR is required';

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
      setServerError(err.message || 'Failed to save inventory unit.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const configOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Penthouse'];
  const availabilityOptions: UnitAvailability[] = ['Available', 'Reserved', 'Sold'];
  const parkingOptions: ParkingType[] = ['Included', 'Not Included'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Unit: ${formData.unit_number}` : 'Add Inventory Unit'}
      description="Record flat specification, pricing, parking slot, and amenities."
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
            {isEdit ? 'Save Changes' : 'Register Unit'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Validation / System Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Section 1: Location & Identification */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Building Placement</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Project" required error={errors.project_id}>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={isSubmitting || isEdit}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code} - {p.city})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Wing / Tower" required error={errors.wing_id}>
              <select
                name="wing_id"
                value={formData.wing_id}
                onChange={handleChange}
                disabled={isSubmitting || isEdit || availableWings.length === 0}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Wing</option>
                {availableWings.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.total_floors} Floors)
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Unit Number" required error={errors.unit_number}>
              <Input
                name="unit_number"
                placeholder="e.g. A-101"
                value={formData.unit_number}
                onChange={handleChange}
                error={errors.unit_number}
                leftIcon={<Home className="w-4 h-4" />}
                disabled={isSubmitting}
                className="font-bold"
              />
            </FormField>

            <FormField label="Floor Number" required error={errors.floor}>
              <Input
                name="floor"
                type="number"
                placeholder="e.g. 1"
                value={formData.floor}
                onChange={handleChange}
                error={errors.floor}
                leftIcon={<Layers className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Configuration" required>
              <select
                name="configuration"
                value={formData.configuration}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100 font-semibold"
              >
                {configOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Section 2: Area & Pricing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Specifications & Pricing</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Carpet Area (sq ft)" required error={errors.carpet_area}>
              <Input
                name="carpet_area"
                type="number"
                placeholder="e.g. 850"
                value={formData.carpet_area}
                onChange={handleChange}
                error={errors.carpet_area}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Built-up Area (sq ft)" required error={errors.built_up_area}>
              <Input
                name="built_up_area"
                type="number"
                placeholder="e.g. 1100"
                value={formData.built_up_area}
                onChange={handleChange}
                error={errors.built_up_area}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Price (₹ INR)" required error={errors.price}>
              <Input
                name="price"
                type="number"
                placeholder="e.g. 8500000"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                leftIcon={<DollarSign className="w-4 h-4" />}
                disabled={isSubmitting}
                className="font-bold text-slate-900 dark:text-slate-100"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Parking Provision" required>
              <select
                name="parking_type"
                value={formData.parking_type}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100"
              >
                {parkingOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Parking Slot Tag">
              <Input
                name="parking_slot"
                placeholder="e.g. P-A101"
                value={formData.parking_slot || ''}
                onChange={handleChange}
                leftIcon={<Car className="w-4 h-4" />}
                disabled={isSubmitting || formData.parking_type === 'Not Included'}
              />
            </FormField>

            <FormField label="Facing / View Orientation">
              <Input
                name="facing"
                placeholder="e.g. East (Garden View)"
                value={formData.facing || ''}
                onChange={handleChange}
                leftIcon={<Compass className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Availability Status */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>Availability Status</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Current Status" required>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100 font-semibold"
              >
                {availabilityOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unit Remarks / Notes</label>
              <Input
                name="description"
                placeholder="e.g. Corner flat, balcony deck, morning light..."
                value={formData.description || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Amenities Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Select Unit / Project Amenities ({formData.amenity_ids?.length || 0})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-[#141A24] rounded-lg border border-slate-200/80 dark:border-[#242F42] max-h-36 overflow-y-auto">
            {amenities.map((a) => {
              const selected = formData.amenity_ids?.includes(a.id);
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`flex items-center gap-2 p-2 rounded-md border text-left transition-colors text-[11px] cursor-pointer ${
                    selected
                      ? 'bg-brand-50 dark:bg-amber-950/40 border-brand-300 dark:border-amber-700/50 text-brand-900 dark:text-amber-200 font-semibold'
                      : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2230]'
                  }`}
                >
                  {selected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-brand-600 dark:text-amber-400 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <span className="truncate">{a.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
};
