import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import type {
  PropertyUnit,
  UpdateAvailabilityFormData,
  UnitAvailability,
} from '../../types/property.types';
import { ShieldCheck, CheckCircle2, Clock, CheckCheck, ArrowRight } from 'lucide-react';

interface UnitAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: PropertyUnit | null;
  onSubmit: (unitId: string, data: UpdateAvailabilityFormData) => Promise<void>;
  userRole?: string;
}

export const UnitAvailabilityModal: React.FC<UnitAvailabilityModalProps> = ({
  isOpen,
  onClose,
  unit,
  onSubmit,
  userRole = 'ADMIN',
}) => {
  if (!unit) return null;

  const [targetStatus, setTargetStatus] = useState<UnitAvailability>(
    unit.availability_status === 'Available'
      ? 'Reserved'
      : unit.availability_status === 'Reserved'
      ? 'Sold'
      : 'Available'
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      if (unit.availability_status === 'Available') setTargetStatus('Reserved');
      else if (unit.availability_status === 'Reserved') setTargetStatus('Sold');
      else setTargetStatus('Available');
      setRemarks('');
      setServerError(null);
    }
  }, [unit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    setIsSubmitting(true);
    try {
      await onSubmit(unit.id, {
        availability_status: targetStatus,
        remarks: remarks.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to update availability status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine allowed options based on current status and role
  const current = unit.availability_status;
  const isAdmin = userRole === 'ADMIN';

  const options: Array<{
    status: UnitAvailability;
    label: string;
    description: string;
    disabled?: boolean;
    icon: React.ReactNode;
  }> = [
    {
      status: 'Available',
      label: 'Available (Open Pool)',
      description:
        current === 'Reserved'
          ? 'Release client reservation back to active inventory'
          : current === 'Sold'
          ? 'Admin cancellation / deal forfeit release'
          : 'Unit is currently open for prospective buyers',
      disabled: current === 'Available' || (current === 'Sold' && !isAdmin),
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      status: 'Reserved',
      label: 'Reserved (Token Hold)',
      description:
        current === 'Available'
          ? 'Place client reservation hold upon token deposit'
          : 'Cannot move directly from Sold to Reserved',
      disabled: current === 'Reserved' || current === 'Sold',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
    {
      status: 'Sold',
      label: 'Sold Out (Closed Deal)',
      description:
        current === 'Reserved'
          ? 'Finalize booking and mark unit as sold'
          : isAdmin
          ? 'Admin direct sale booking'
          : 'Requires prior reservation hold',
      disabled: current === 'Sold' || (current === 'Available' && !isAdmin),
      icon: <CheckCheck className="w-4 h-4 text-slate-600" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Availability: Unit ${unit.unit_number}`}
      description={`${unit.project_name || 'Project'} • ${unit.wing_name || 'Wing'} • Floor ${unit.floor}`}
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
            disabled={targetStatus === current}
          >
            Confirm Transition
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
        {serverError && (
          <Alert
            variant="error"
            title="State Machine Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Current State Indicator */}
        <div className="p-3 bg-slate-50 dark:bg-[#141A24] rounded-lg border border-slate-200/90 dark:border-[#242F42] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Current Status:</span>
            <Badge availability={unit.availability_status} size="sm" />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">New Status:</span>
            <Badge availability={targetStatus} size="sm" />
          </div>
        </div>

        {/* Target Options Radio Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Select Target Status
          </label>
          <div className="space-y-2">
            {options.map((opt) => (
              <label
                key={opt.status}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  opt.disabled
                    ? 'opacity-40 bg-slate-100 dark:bg-[#141A24] border-slate-200 dark:border-[#242F42] cursor-not-allowed'
                    : targetStatus === opt.status
                    ? 'bg-brand-50/70 dark:bg-amber-950/40 border-brand-400 dark:border-amber-500/50 shadow-2xs'
                    : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] hover:bg-slate-50 dark:hover:bg-[#1A2230]'
                }`}
              >
                <input
                  type="radio"
                  name="targetStatus"
                  value={opt.status}
                  checked={targetStatus === opt.status}
                  onChange={() => !opt.disabled && setTargetStatus(opt.status)}
                  disabled={opt.disabled}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Remarks */}
        <FormField label="Audit Remarks & Client Context">
          <textarea
            rows={2}
            placeholder="e.g. Client deposited ₹2,00,000 token for booking. Holding unit for 7 days."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white dark:bg-[#101622] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </FormField>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Every status change is permanently logged into the property audit ledger.</span>
        </div>
      </form>
    </Modal>
  );
};
