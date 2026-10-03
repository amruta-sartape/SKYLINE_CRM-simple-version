import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Checkbox } from '../ui/Checkbox';
import { followUpService } from '../../services/followUp.service';
import { FollowUpItem, FollowUpType } from '../../types/followUp.types';
import { CalendarPlus, PhoneCall, MessageSquare, Mail, Users, Video } from 'lucide-react';

interface CompleteFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  followUp: FollowUpItem | null;
}

export const CompleteFollowUpModal: React.FC<CompleteFollowUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  followUp,
}) => {
  if (!followUp) return null;

  const [outcome, setOutcome] = useState('');
  const [remarks, setRemarks] = useState('');
  const [createNext, setCreateNext] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [nextType, setNextType] = useState<FollowUpType>('Phone Call');
  const [nextRemarks, setNextRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const quickOutcomes = [
    'Client Confirmed Site Visit',
    'Requested Price Quotation & Floor Plan',
    'Follow-up Call Required Later',
    'Loan Approval In Progress',
    'Call Not Answered / Ringing',
    'Not Interested Currently',
  ];

  const followUpTypes: { type: FollowUpType; label: string; icon: React.ReactNode }[] = [
    { type: 'Phone Call', label: 'Call', icon: <PhoneCall className="w-3.5 h-3.5 text-indigo-600" /> },
    { type: 'WhatsApp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> },
    { type: 'Email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-sky-600" /> },
    { type: 'Meeting', label: 'Meeting', icon: <Users className="w-3.5 h-3.5 text-purple-600" /> },
    { type: 'Video Call', label: 'Video Call', icon: <Video className="w-3.5 h-3.5 text-pink-600" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) {
      setServerError('Please provide or select an outcome summary.');
      return;
    }

    if (createNext && !nextDate) {
      setServerError('Please select a date for the next follow-up.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await followUpService.complete(followUp.id, {
        outcome: outcome.trim(),
        remarks: remarks.trim() || undefined,
        next_follow_up_date: createNext && nextDate ? nextDate : undefined,
        create_next_follow_up: createNext,
        next_follow_up_type: createNext ? nextType : undefined,
        next_follow_up_remarks: createNext && nextRemarks.trim() ? nextRemarks.trim() : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to complete follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Follow-Up Interaction"
      description={`Record outcome of ${followUp.follow_up_type} with ${followUp.customer_name || 'Customer'}`}
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
            Mark Completed
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Completion Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Header summary */}
        <div className="p-3 bg-slate-50 dark:bg-[#141A24] border border-slate-200 dark:border-[#242F42] rounded-xl space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100">{followUp.customer_name}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{followUp.scheduled_date} {followUp.scheduled_time || ''}</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300">
            Agenda: <span className="text-slate-800 dark:text-slate-200 font-medium">{followUp.remarks}</span>
          </div>
        </div>

        {/* Quick Outcome Chips */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">Quick Outcomes</label>
          <div className="flex flex-wrap gap-1.5">
            {quickOutcomes.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setOutcome(opt)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                  outcome === opt
                    ? 'bg-slate-900 dark:bg-amber-400 border-slate-900 dark:border-amber-400 text-white dark:text-slate-950 shadow-2xs'
                    : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2230]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome Input */}
        <FormField
          label="Outcome Summary"
          required
          helperText="Short summary of discussion outcome"
        >
          <Input
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="e.g. Discussed pricing; client requested updated payment schedule"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Completion Remarks */}
        <FormField
          label="Detailed Interaction Remarks"
          helperText="Detailed notes or objections raised"
        >
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Client requested sample flat video on WhatsApp and scheduled site visit for Saturday..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />
        </FormField>

        {/* Auto Schedule Next Follow-up */}
        <div className="p-3 bg-blue-50/60 dark:bg-[#141A24] border border-blue-200/80 dark:border-[#242F42] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={createNext}
                onChange={(e) => setCreateNext(e.target.checked)}
                label="Automatically Schedule Next Follow-Up"
              />
            </div>
            <CalendarPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          {createNext && (
            <div className="space-y-3 pt-2 border-t border-blue-200/60 dark:border-[#242F42]">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Next Follow-up Date" required>
                  <Input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Next Channel">
                  <select
                    value={nextType}
                    onChange={(e) => setNextType(e.target.value as FollowUpType)}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100"
                  >
                    {followUpTypes.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Next Agenda">
                <Input
                  value={nextRemarks}
                  onChange={(e) => setNextRemarks(e.target.value)}
                  placeholder="e.g. Call to confirm Saturday site visit timing"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
