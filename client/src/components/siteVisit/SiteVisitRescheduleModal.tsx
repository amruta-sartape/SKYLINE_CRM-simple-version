import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { siteVisitService } from '../../services/siteVisit.service';
import { SiteVisit } from '../../types/siteVisit.types';
import { AlertTriangle } from 'lucide-react';

interface SiteVisitRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  visit: SiteVisit | null;
}

export const SiteVisitRescheduleModal: React.FC<SiteVisitRescheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  visit,
}) => {
  if (!visit) return null;

  const [visitDate, setVisitDate] = useState(visit.visit_date || '');
  const [visitTime, setVisitTime] = useState(visit.visit_time || '11:00');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate || !visitTime) {
      setServerError('Both visit date and time are required.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await siteVisitService.reschedule(visit.id, {
        visit_date: visitDate,
        visit_time: visitTime,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to reschedule site visit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Site Visit"
      description={`Move appointment time for ${visit.customer_name || 'Customer'}`}
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
            Confirm Reschedule
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Rescheduling Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold">Current Booking:</span> {visit.visit_date} at {visit.visit_time} with executive{' '}
            <span className="font-semibold">{visit.assigned_user_name || 'Assigned Agent'}</span>.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="New Visit Date" required>
            <Input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="New Visit Time" required>
            <Input
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        <FormField label="Reason for Rescheduling" helperText="Customer request or executive conflict note">
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Client requested postponement due to office meeting..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
