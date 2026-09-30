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

export interface PropertyWing {
  id: string;
  project_id: string;
  name: string;
  total_floors: number;
  units_per_floor: number;
  created_at: string;
  updated_at: string;
  total_units?: number;
  available_units?: number;
  reserved_units?: number;
  sold_units?: number;
}

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
  is_active: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  available_units?: number;
  reserved_units?: number;
  sold_units?: number;
  wings?: PropertyWing[];
  created_by_name?: string | null;
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
  configuration: string;
  carpet_area: number;
  built_up_area: number;
  price: number;
  parking_type: ParkingType;
  parking_slot?: string | null;
  availability_status: UnitAvailability;
  facing?: string | null;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
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

// Form Data Interfaces
export interface ProjectFormData {
  name: string;
  code: string;
  location: string;
  city: string;
  state: string;
  description?: string;
  developer?: string;
  status?: ProjectStatus;
  wings?: Array<{
    name: string;
    total_floors?: number;
    units_per_floor?: number;
  }>;
}

export interface UnitFormData {
  project_id: string;
  wing_id: string;
  unit_number: string;
  floor: number;
  configuration: string;
  carpet_area: number;
  built_up_area: number;
  price: number;
  parking_type: ParkingType;
  parking_slot?: string;
  availability_status?: UnitAvailability;
  facing?: string;
  description?: string;
  amenity_ids?: string[];
}

export interface UpdateAvailabilityFormData {
  availability_status: UnitAvailability;
  remarks?: string;
  customer_lead_id?: string;
}
