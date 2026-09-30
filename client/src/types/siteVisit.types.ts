import { QualificationStatus, PropertyConfiguration, PipelineStage } from './crm.types';
import { UnitAvailability } from './property.types';

export type SiteVisitStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled' | 'No Show';

export type SiteVisitType = 'Direct Visit' | 'Executive Accompanied' | 'Pickup & Drop';

export type SiteVisitOutcome = 'Interested' | 'Follow-up Required' | 'Not Interested' | 'Needs More Time';

export interface SiteVisit {
  id: string;
  lead_id: string;
  project_id: string;
  unit_id?: string | null;
  assigned_user_id: string;
  visit_date: string; // 'YYYY-MM-DD'
  visit_time: string; // 'HH:mm'
  visit_status: SiteVisitStatus;
  visit_type: SiteVisitType;
  remarks?: string | null;
  outcome?: SiteVisitOutcome | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  lead_status?: QualificationStatus;
  lead_budget?: number;
  lead_flat_type?: PropertyConfiguration;
  lead_pipeline_stage?: PipelineStage;
  project_name?: string;
  project_code?: string;
  project_city?: string;
  project_location?: string;
  unit_number?: string;
  unit_configuration?: string;
  unit_price?: number;
  unit_availability?: UnitAvailability;
  assigned_user_name?: string;
  assigned_user_email?: string;
  created_by_name?: string;
}

export interface SiteVisitFormData {
  lead_id: string;
  project_id: string;
  unit_id?: string | null;
  assigned_user_id: string;
  visit_date: string;
  visit_time: string;
  visit_type: SiteVisitType;
  remarks?: string | null;
}

export interface SiteVisitSummary {
  total_visits: number;
  scheduled_visits: number;
  completed_visits: number;
  rescheduled_visits: number;
  cancelled_visits: number;
  no_show_visits: number;
  today_visits: number;
  upcoming_visits: number;
}
