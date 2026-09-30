export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  AGENT = 'AGENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  created_at: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  roles: UserRole[];
  created_at: string;
  last_login_at: string | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

export interface AuthSuccessResponse {
  user: UserDTO;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// ============================================================================
// PHASE 2 CRM ENUMS & INTERFACES
// ============================================================================

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
  | 'REQUIREMENT_UPDATED'
  | 'SITE_VISIT_SCHEDULED'
  | 'SITE_VISIT_RESCHEDULED'
  | 'SITE_VISIT_COMPLETED'
  | 'SITE_VISIT_CANCELLED'
  | 'SITE_VISIT_NO_SHOW'
  | 'SITE_VISIT_REASSIGNED'
  | 'FOLLOW_UP_CREATED'
  | 'FOLLOW_UP_COMPLETED'
  | 'FOLLOW_UP_RESCHEDULED'
  | 'FOLLOW_UP_CANCELLED'
  | 'FOLLOW_UP_REASSIGNED';

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
  project_id?: string | null;
  unit_id?: string | null;
  status: EnquiryStatus;
  enquiry_date: string;
  converted_lead_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_name?: string | null;
  assigned_email?: string | null;
  created_by_name?: string | null;
  project_name?: string | null;
  unit_number?: string | null;
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
  project_id?: string | null;
  unit_id?: string | null;
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
  // Joined fields
  assigned_name?: string | null;
  assigned_email?: string | null;
  created_by_name?: string | null;
  project_name?: string | null;
  unit_number?: string | null;
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
  // Joined
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
  // Joined
  executive_name?: string | null;
}

// ============================================================================
// PHASE 3 PROPERTY CATALOG & INVENTORY ENUMS & INTERFACES
// ============================================================================

export type ProjectStatus = 'Upcoming' | 'Active' | 'Completed' | 'On Hold';

export type UnitAvailability = 'Available' | 'Reserved' | 'Sold';

export type ParkingType = 'Included' | 'Not Included';

export type AmenityCategory =
  | 'Sports & Wellness'
  | 'Security'
  | 'Convenience'
  | 'Leisure'
  | 'Green Living'
  | 'General';

export type PropertyActivityType =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_ARCHIVED'
  | 'UNIT_CREATED'
  | 'UNIT_UPDATED'
  | 'AVAILABILITY_CHANGED';

export interface PropertyProject {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  state: string;
  description?: string | null;
  developer: string;
  status: ProjectStatus;
  total_wings: number;
  total_units: number;
  is_active: number; // 1 or 0
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Computed / Joined fields
  available_units?: number;
  reserved_units?: number;
  sold_units?: number;
  wings?: PropertyWing[];
  created_by_name?: string | null;
}

export interface PropertyWing {
  id: string;
  project_id: string;
  name: string;
  total_floors: number;
  units_per_floor: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  total_units?: number;
  available_units?: number;
  reserved_units?: number;
  sold_units?: number;
}

export interface Amenity {
  id: string;
  name: string;
  category: AmenityCategory;
  icon?: string | null;
  is_active: number;
  created_at: string;
}

export interface PropertyUnit {
  id: string;
  project_id: string;
  wing_id: string;
  unit_number: string;
  floor: number;
  configuration: string; // '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Penthouse'
  carpet_area: number; // In sq ft
  built_up_area: number; // In sq ft
  price: number; // In INR
  parking_type: ParkingType;
  parking_slot?: string | null;
  availability_status: UnitAvailability;
  facing?: string | null;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  project_name?: string;
  project_code?: string;
  project_city?: string;
  wing_name?: string;
  amenities?: Amenity[];
  amenity_ids?: string[];
  created_by_name?: string | null;
}

export interface PropertyActivity {
  id: string;
  resource_type: 'PROJECT' | 'UNIT';
  resource_id: string;
  activity_type: PropertyActivityType;
  title: string;
  description?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  performed_by?: string | null;
  created_at: string;
  // Joined
  performer_name?: string | null;
  performer_email?: string | null;
}

export interface InventorySummary {
  total_units: number;
  available_units: number;
  reserved_units: number;
  sold_units: number;
  total_valuation: number;
  available_valuation: number;
  avg_sqft_price: number;
}

export interface FloorMatrixUnit {
  id: string;
  unit_number: string;
  floor: number;
  configuration: string;
  carpet_area: number;
  price: number;
  availability_status: UnitAvailability;
  parking_type: ParkingType;
  parking_slot?: string | null;
}

export interface FloorMatrixFloor {
  floor: number;
  units: FloorMatrixUnit[];
}

export interface FloorMatrixData {
  project_id: string;
  project_name: string;
  wing_id: string;
  wing_name: string;
  total_floors: number;
  floors: FloorMatrixFloor[];
}

// ============================================================================
// PHASE 4: SITE VISIT & COMPLETE FOLLOW-UP ENUMS & INTERFACES
// ============================================================================

export type SiteVisitStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled' | 'No Show';

export type SiteVisitType = 'Direct Visit' | 'Executive Accompanied' | 'Pickup & Drop';

export type SiteVisitOutcome = 'Interested' | 'Follow-up Required' | 'Not Interested' | 'Needs More Time';

export type FollowUpStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';

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

export interface FollowUpItem {
  id: string;
  lead_id: string;
  site_visit_id?: string | null;
  assigned_user_id?: string | null; // also executive_id
  follow_up_type: FollowUpType; // also type
  scheduled_date: string; // 'YYYY-MM-DD' (also followup_date)
  scheduled_time?: string | null; // (also followup_time)
  remarks: string;
  status: FollowUpStatus;
  outcome?: string | null;
  next_follow_up_date?: string | null; // (also next_followup_date)
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
  is_overdue?: boolean;
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

export interface FollowUpSummary {
  total: number;
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
}

