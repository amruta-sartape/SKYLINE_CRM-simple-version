import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Lead, PipelineStage } from '../../types/crm.types';
import { GitCommit, ArrowRight } from 'lucide-react';

interface StageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  targetStage?: PipelineStage | null;
  onSubmit: (leadId: string, newStage: PipelineStage, remarks?: string) => Promise<void>;
}

export const StageChangeModal: React.FC<StageChangeModalProps> = ({
  isOpen,
  onClose,
  lead,
  targetStage,
  onSubmit,
}) => {
  if (!lead) return null;

  const [selectedStage, setSelectedStage] = useState<PipelineStage>(
    targetStage || lead.pipeline_stage
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (targetStage) {
      setSelectedStage(targetStage);
    } else if (lead) {
      setSelectedStage(lead.pipeline_stage);
    }
    setRemarks('');
    setServerError(null);
  }, [lead, targetStage, isOpen]);

  const stages: { stage: PipelineStage; desc: string }[] = [
    { stage: 'New', desc: 'Fresh unconverted/raw lead' },
    { stage: 'Contacted', desc: 'First contact established over call or WhatsApp' },
    { stage: 'Follow-up', desc: 'Active communication and requirement scoping' },
    { stage: 'Site Visit', desc: 'Physical project inspection or showroom tour scheduled' },
    { stage: 'Negotiation', desc: 'Pricing, discount offers, and payment plan discussions' },
    { stage: 'Converted', desc: 'Deal finalized & ready for agreement / booking' },
    { stage: 'Lost', desc: 'Client deferred, budget mismatch, or competitor opted' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(lead.id, selectedStage, remarks);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to update pipeline stage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Pipeline Stage"
      description={`Transition sales progression for ${lead.customer_name}.`}
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
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Confirm Stage Transition
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Stage Transition Error"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        <div className="space-y-2">
          <label className="font-bold text-slate-700 text-xs block">
            Target Pipeline Stage
          </label>
          <div className="space-y-1.5">
            {stages.map((s) => (
              <label
                key={s.stage}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedStage === s.stage
                    ? 'bg-brand-50/70 border-brand-500 shadow-2xs font-bold text-brand-950 ring-1 ring-brand-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pipeline_stage"
                    value={s.stage}
                    checked={selectedStage === s.stage}
                    onChange={(e) => setSelectedStage(e.target.value as PipelineStage)}
                    className="sr-only"
                  />
                  <GitCommit
                    className={`w-3.5 h-3.5 ${
                      selectedStage === s.stage ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{s.stage}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">{s.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <FormField label="Stage Transition Remarks (Optional)">
          <textarea
            name="remarks"
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Completed initial briefing call, customer confirmed site visit date for Saturday..."
            disabled={isSubmitting}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};
