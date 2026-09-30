export type LeadSource =
  | 'Website'
  | 'Facebook / Instagram'
  | 'Google Ads'
  | 'WhatsApp'
  | 'Phone Call'
  | 'Walk-in'
  | 'Referral'
  | 'Property Portal';

export type PropertyConfiguration = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK';

export type EnquiryStatus = 'New Lead' | 'In Progress' | 'Converted' | 'Dropped';

export type PipelineStage =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Site Visit'
  | 'Negotiation'
  | 'Converted'
  | 'Lost';

export type QualificationStatus =
  | 'Qualified'
  | 'Not Interested'
  | 'Future Prospect'
  | 'Wrong Number'
  | 'Duplicate';

export type PurchaseTimeline = 'Immediate' | '1-3 Months' | '3-6 Months' | '6+ Months';

export type PurchasePurpose = 'Self Use' | 'Investment';

export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type FollowUpType =
  | 'Phone Call'
  | 'WhatsApp'
  | 'Email'
  | 'SMS'
  | 'Meeting'
  | 'Video Call';

export type ActivityType =
  | 'LEAD_CREATED'
  | 'ENQUIRY_CONVERTED'
  | 'STAGE_CHANGED'
  | 'QUALIFICATION_UPDATED'
  | 'EXECUTIVE_ASSIGNED'
  | 'FOLLOW_UP_LOGGED'
  | 'NOTE_UPDATED'
  | 'REQUIREMENT_UPDATED';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  budget: number;
  interested_property: string;
  configuration: PropertyConfiguration;
  lead_source: LeadSource;
  assigned_to?: string | null;
  status: EnquiryStatus;
  enquiry_date: string;
  converted_lead_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  assigned_name?: string | null;
  assigned_email?: string | null;
  created_by_name?: string | null;
}

export interface Lead {
  id: string;
  enquiry_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  budget: number;
  preferred_location?: string | null;
  flat_type: PropertyConfiguration;
  interested_property?: string | null;
  loan_required: number; // 0 or 1
  purchase_timeline?: PurchaseTimeline | null;
  purpose?: PurchasePurpose | null;
  assigned_to?: string | null;
  pipeline_stage: PipelineStage;
  qualification_status: QualificationStatus;
  priority: LeadPriority;
  next_followup_date?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  assigned_name?: string | null;
  assigned_email?: string | null;
  created_by_name?: string | null;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  performed_by?: string | null;
  metadata?: string | null;
  created_at: string;
  performer_name?: string | null;
  performer_email?: string | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  type: FollowUpType;
  followup_date: string;
  followup_time?: string | null;
  remarks: string;
  next_followup_date?: string | null;
  executive_id?: string | null;
  status: 'Completed' | 'Planned' | 'Cancelled';
  created_at: string;
  executive_name?: string | null;
}

export interface PipelineStageSummary {
  stage: PipelineStage;
  count: number;
  totalValue: number;
  leads: Lead[];
}

export interface EnquiryFormData {
  customer_name: string;
  phone: string;
  email?: string;
  city?: string;
  budget: number;
  interested_property: string;
  configuration: PropertyConfiguration;
  lead_source: LeadSource;
  assigned_to?: string;
  status?: EnquiryStatus;
  enquiry_date?: string;
}

export interface LeadFormData {
  customer_name: string;
  phone: string;
  email?: string;
  city?: string;
  budget: number;
  preferred_location?: string;
  flat_type: PropertyConfiguration;
  interested_property?: string;
  loan_required: number;
  purchase_timeline?: PurchaseTimeline;
  purpose?: PurchasePurpose;
  assigned_to?: string;
  pipeline_stage?: PipelineStage;
  qualification_status?: QualificationStatus;
  priority?: LeadPriority;
  next_followup_date?: string;
  notes?: string;
}

export interface ConvertEnquiryFormData {
  preferred_location?: string;
  loan_required?: number;
  purchase_timeline?: PurchaseTimeline;
  purpose?: PurchasePurpose;
  assigned_to?: string;
  priority?: LeadPriority;
  notes?: string;
}

export interface QualifyLeadFormData {
  qualification_status: QualificationStatus;
  budget?: number;
  loan_required?: number;
  preferred_location?: string;
  flat_type?: PropertyConfiguration;
  purchase_timeline?: PurchaseTimeline;
  purpose?: PurchasePurpose;
  remarks?: string;
}

export interface FollowUpFormData {
  type: FollowUpType;
  followup_date: string;
  followup_time?: string;
  remarks: string;
  next_followup_date?: string;
  executive_id?: string;
}
