export type FollowUpType =
  | 'Phone Call'
  | 'WhatsApp'
  | 'Email'
  | 'SMS'
  | 'Meeting'
  | 'Video Call';

export type FollowUpStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface FollowUpItem {
  id: string;
  lead_id: string;
  site_visit_id?: string | null;
  assigned_user_id?: string | null;
  follow_up_type: FollowUpType;
  scheduled_date: string;
  scheduled_time?: string | null;
  remarks: string;
  status: FollowUpStatus;
  outcome?: string | null;
  next_follow_up_date?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  assigned_user_name?: string;
  created_by_name?: string;
  project_name?: string;
  property_id?: string;
  property_code?: string;
  property_title?: string;
  property_subtype?: string;
  property_cover_image?: string;
  is_overdue?: boolean;
}

export interface FollowUpFormData {
  lead_id: string;
  site_visit_id?: string | null;
  assigned_user_id?: string | null;
  follow_up_type: FollowUpType;
  scheduled_date: string;
  scheduled_time?: string | null;
  remarks: string;
  next_follow_up_date?: string | null;
}

export interface FollowUpSummary {
  total: number;
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
}
