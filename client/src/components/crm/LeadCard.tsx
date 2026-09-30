import type { Lead, PipelineStage } from '../../types/crm.types';
import { Badge } from '../ui/Badge';
import {
  User,
  Building,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onMoveStage?: (lead: Lead, newStage: PipelineStage) => void;
  availableStages?: PipelineStage[];
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onView,
  onMoveStage,
  availableStages = [
    'New',
    'Contacted',
    'Follow-up',
    'Site Visit',
    'Negotiation',
    'Converted',
    'Lost',
  ],
}) => {
  const currentIndex = availableStages.indexOf(lead.pipeline_stage);
  const prevStage = currentIndex > 0 ? availableStages[currentIndex - 1] : null;
  const nextStage =
    currentIndex < availableStages.length - 1 ? availableStages[currentIndex + 1] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-subtle p-3.5 space-y-3 transition-all text-left group">
      {/* Top Header: Customer Name & Priority */}
      <div className="flex items-start justify-between gap-2">
        <div className="cursor-pointer" onClick={() => onView(lead)}>
          <h4 className="font-bold text-xs text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1">
            <span>{lead.customer_name}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <span className="text-[10px] text-slate-500 font-medium">
            {lead.city ? `${lead.city} • ` : ''}
            {lead.flat_type}
          </span>
        </div>

        <Badge priority={lead.priority} size="xs" />
      </div>

      {/* Property & Budget */}
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px] truncate">
          <Building className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="truncate">{lead.interested_property || 'Unspecified Project'}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-slate-500">Budget:</span>
          <span className="font-bold text-slate-900">
            ₹{(lead.budget / 100000).toFixed(1)} L
          </span>
        </div>
      </div>

      {/* Badges: Qualification & Loan */}
      <div className="flex flex-wrap items-center gap-1">
        <Badge qualification={lead.qualification_status} size="xs" />
        {lead.loan_required === 1 && (
          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
            Loan Req
          </span>
        )}
      </div>

      {/* Footer info: Assigned & Follow-up */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1 truncate max-w-[120px]">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{lead.assigned_name || 'Unassigned'}</span>
        </div>

        {lead.next_followup_date ? (
          <div className="flex items-center gap-1 text-amber-700 font-medium shrink-0">
            <Clock className="w-3 h-3" />
            <span>{lead.next_followup_date.split('T')[0]}</span>
          </div>
        ) : (
          <span className="text-slate-400">No date set</span>
        )}
      </div>

      {/* Quick Pipeline Stage Mover Controls */}
      {onMoveStage && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {prevStage ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveStage(lead, prevStage);
              }}
              title={`Move back to ${prevStage}`}
              className="flex items-center gap-0.5 px-1.5 py-1 text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>{prevStage}</span>
            </button>
          ) : (
            <div />
          )}

          {nextStage ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveStage(lead, nextStage);
              }}
              title={`Advance to ${nextStage}`}
              className="flex items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-white bg-slate-900 hover:bg-brand-600 rounded transition-colors ml-auto shadow-2xs"
            >
              <span>{nextStage}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
};
