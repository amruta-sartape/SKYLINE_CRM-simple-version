import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { followUpService } from '../../services/followUp.service';
import { FollowUpItem } from '../../types/followUp.types';
import { AlertTriangle } from 'lucide-react';

interface FollowUpRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  followUp: FollowUpItem | null;
}

export const FollowUpRescheduleModal: React.FC<FollowUpRescheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  followUp,
}) => {
  if (!followUp) return null;

  const [scheduledDate, setScheduledDate] = useState(followUp.scheduled_date || '');
  const [scheduledTime, setScheduledTime] = useState(followUp.scheduled_time || '10:30');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) {
      setServerError('Scheduled date is required.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await followUpService.reschedule(followUp.id, {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime || undefined,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to reschedule follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Follow-Up"
      description={`Postpone or reschedule interaction with ${followUp.customer_name || 'Customer'}`}
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
            <span className="font-bold">Original Schedule:</span> {followUp.scheduled_date} {followUp.scheduled_time || ''} • {followUp.follow_up_type}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="New Date" required>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="New Time">
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        <FormField label="Reason for Rescheduling" helperText="Customer request or agenda update">
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Client asked to call back next Tuesday afternoon..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
