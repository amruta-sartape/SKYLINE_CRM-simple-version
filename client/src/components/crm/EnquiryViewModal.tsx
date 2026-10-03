import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Enquiry } from '../../types/crm.types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface EnquiryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: Enquiry | null;
  onEdit: (enquiry: Enquiry) => void;
  onConvert: (enquiry: Enquiry) => void;
  onNavigateToLead?: (leadId: string) => void;
}

export const EnquiryViewModal: React.FC<EnquiryViewModalProps> = ({
  isOpen,
  onClose,
  enquiry,
  onEdit,
  onConvert,
  onNavigateToLead,
}) => {
  if (!enquiry) return null;

  const isConverted = enquiry.status === 'Converted' || Boolean(enquiry.converted_lead_id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Enquiry Details"
      description={`Enquiry Reference: ${enquiry.id}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(enquiry);
              }}
            >
              Edit Details
            </Button>

            {!isConverted ? (
              <Button
                variant="luxury"
                size="sm"
                onClick={() => {
                  onClose();
                  onConvert(enquiry);
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Convert to CRM Lead
              </Button>
            ) : enquiry.converted_lead_id && onNavigateToLead ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onNavigateToLead(enquiry.converted_lead_id!);
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Converted Lead 360
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-left text-xs">
        {/* Top Status & Conversion Banner */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#141A24] border border-slate-200/80 dark:border-[#242F42]">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <Badge enquiryStatus={enquiry.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Source:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-[#101622] px-2 py-0.5 rounded border border-slate-200 dark:border-[#242F42]">
              {enquiry.lead_source}
            </span>
          </div>
        </div>

        {isConverted && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                This enquiry was successfully converted to a <strong>CRM Lead</strong>.
              </span>
            </div>
            {enquiry.converted_lead_id && onNavigateToLead && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToLead(enquiry.converted_lead_id!);
                }}
                className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
              >
                Open Lead →
              </button>
            )}
          </div>
        )}

        {/* Customer Information Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141A24] border border-slate-200/90 dark:border-[#242F42] space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Customer Profile</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Full Name:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{enquiry.customer_name}</span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Mobile Phone:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {enquiry.phone}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Email Address:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                {enquiry.email || 'Not provided'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Location / City:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {enquiry.city || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Property & Budget Interest */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141A24] border border-slate-200/90 dark:border-[#242F42] space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-[#242F42] pb-1.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Property & Budget Intent</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Interested Project:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{enquiry.interested_property}</span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Configuration:</span>
              <span className="inline-block px-2 py-0.5 font-bold text-xs bg-brand-50 dark:bg-amber-950/40 text-brand-700 dark:text-amber-300 border border-brand-200 dark:border-amber-800/40 rounded mt-0.5">
                {enquiry.configuration}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Budget:</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-0.5 mt-0.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                ₹{(enquiry.budget / 100000).toFixed(1)} Lakhs
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  (₹{enquiry.budget.toLocaleString()})
                </span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Assigned Executive:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {enquiry.assigned_name || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata & Timestamps */}
        <div className="p-3 bg-slate-50 dark:bg-[#141A24] border border-slate-200/70 dark:border-[#242F42] rounded-lg grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            <span>Enquiry Date: </span>
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">{enquiry.enquiry_date}</strong>
          </div>
          <div>
            <span>Recorded By: </span>
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">{enquiry.created_by_name || 'System'}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
};
