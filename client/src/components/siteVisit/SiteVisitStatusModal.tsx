import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { siteVisitService } from '../../services/siteVisit.service';
import { SiteVisit, SiteVisitStatus, SiteVisitOutcome } from '../../types/siteVisit.types';
import { CheckCircle2, XCircle, UserX, ThumbsUp, HelpCircle, PhoneCall, ThumbsDown } from 'lucide-react';

interface SiteVisitStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  visit: SiteVisit | null;
  initialStatus?: SiteVisitStatus;
}

export const SiteVisitStatusModal: React.FC<SiteVisitStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  visit,
  initialStatus = 'Completed',
}) => {
  if (!visit) return null;

  const [status, setStatus] = useState<SiteVisitStatus>(initialStatus);
  const [outcome, setOutcome] = useState<SiteVisitOutcome>('Interested');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const outcomes: { value: SiteVisitOutcome; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'Interested',
      label: 'Highly Interested',
      desc: 'Liked property, ready for pricing / booking discussion',
      icon: <ThumbsUp className="w-4 h-4 text-emerald-600" />,
    },
    {
      value: 'Follow-up Required',
      label: 'Follow-up Required',
      desc: 'Wants layout comparisons or loan calculation details',
      icon: <PhoneCall className="w-4 h-4 text-blue-600" />,
    },
    {
      value: 'Needs More Time',
      label: 'Needs More Time',
      desc: 'Will discuss with family or explore possession dates',
      icon: <HelpCircle className="w-4 h-4 text-amber-600" />,
    },
    {
      value: 'Not Interested',
      label: 'Not Interested',
      desc: 'Location or floor plan did not match requirements',
      icon: <ThumbsDown className="w-4 h-4 text-rose-600" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      await siteVisitService.updateStatus(visit.id, {
        visit_status: status,
        outcome: status === 'Completed' ? outcome : undefined,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to update visit status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Site Visit Outcome"
      description={`Record visit completion result and client response for ${visit.customer_name || 'Customer'}`}
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
            Save Visit Status
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Status Update Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Visit Details Box */}
        <div className="p-3 bg-slate-50 dark:bg-[#141A24] border border-slate-200 dark:border-[#242F42] rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-100">{visit.customer_name}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{visit.visit_date} at {visit.visit_time}</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300">
            Project: <span className="font-semibold text-slate-800 dark:text-slate-100">{visit.project_name}</span>
            {visit.unit_number && <span> • Unit {visit.unit_number} ({visit.unit_configuration})</span>}
          </div>
        </div>

        {/* Status Selection Buttons */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">Site Visit Resolution</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('Completed')}
              className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-bold transition-all ${
                status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                  : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2230]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Completed</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('Cancelled')}
              className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-bold transition-all ${
                status === 'Cancelled'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-500 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500'
                  : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2230]'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Cancelled</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('No Show')}
              className={`p-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-bold transition-all ${
                status === 'No Show'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500'
                  : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2230]'
              }`}
            >
              <UserX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>No Show</span>
            </button>
          </div>
        </div>

        {/* Outcome Selection if Completed */}
        {status === 'Completed' && (
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">Client Interest & Feedback Outcome</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outcomes.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutcome(opt.value)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                    outcome === opt.value
                      ? 'bg-brand-50/70 dark:bg-amber-950/30 border-brand-500 dark:border-amber-500/50 text-brand-950 dark:text-amber-200 ring-1 ring-brand-500 dark:ring-amber-500/50 shadow-2xs'
                      : 'bg-white dark:bg-[#101622] border-slate-200 dark:border-[#242F42] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A2230]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{opt.icon}</div>
                  <div>
                    <div className="font-bold text-xs leading-tight">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Remarks / Feedback */}
        <FormField
          label={status === 'Completed' ? 'Executive Debrief & Customer Feedback' : 'Reason / Remarks'}
          helperText="Detailed observations from the site walk"
        >
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              status === 'Completed'
                ? 'e.g. Customer loved the clubhouse and east balcony view. Requested customized payment schedule before booking...'
                : 'e.g. Client had unexpected travel schedule, requested rescheduling next weekend...'
            }
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white dark:bg-[#101622] border border-slate-300 dark:border-[#242F42] rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-amber-400/20 focus:border-slate-900 dark:focus:border-amber-400/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
