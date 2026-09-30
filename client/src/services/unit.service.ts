import api from './api';
import {
  PropertyUnit,
  PropertyActivity,
  Amenity,
  InventorySummary,
  FloorMatrixData,
  UnitFormData,
  UpdateAvailabilityFormData,
  UnitAvailability,
} from '../types/property.types';

export interface UnitFilters {
  project_id?: string;
  wing_id?: string;
  city?: string;
  floor_min?: number;
  floor_max?: number;
  configuration?: string;
  availability_status?: UnitAvailability;
  min_price?: number;
  max_price?: number;
  min_carpet?: number;
  max_carpet?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export const unitService = {
  /**
   * List inventory units with multi-criteria filters
   */
  async list(filters: UnitFilters = {}): Promise<{
    units: PropertyUnit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.wing_id) params.append('wing_id', filters.wing_id);
    if (filters.city) params.append('city', filters.city);
    if (filters.floor_min !== undefined) params.append('floor_min', String(filters.floor_min));
    if (filters.floor_max !== undefined) params.append('floor_max', String(filters.floor_max));
    if (filters.configuration) params.append('configuration', filters.configuration);
    if (filters.availability_status) params.append('availability_status', filters.availability_status);
    if (filters.min_price !== undefined) params.append('min_price', String(filters.min_price));
    if (filters.max_price !== undefined) params.append('max_price', String(filters.max_price));
    if (filters.min_carpet !== undefined) params.append('min_carpet', String(filters.min_carpet));
    if (filters.max_carpet !== undefined) params.append('max_carpet', String(filters.max_carpet));
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const response = await api.get(`/units?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get single unit by ID with activity audit history
   */
  async getById(id: string): Promise<{ unit: PropertyUnit; activities: PropertyActivity[] }> {
    const response = await api.get(`/units/${id}`);
    return response.data.data;
  },

  /**
   * Get aggregated inventory summary metrics
   */
  async getSummary(projectId?: string): Promise<InventorySummary> {
    const params = projectId ? `?project_id=${projectId}` : '';
    const response = await api.get(`/units/summary${params}`);
    return response.data.data;
  },

  /**
   * Get visual floor matrix data for a project and wing
   */
  async getFloorMatrix(projectId: string, wingId: string): Promise<FloorMatrixData> {
    const response = await api.get(`/units/matrix?project_id=${projectId}&wing_id=${wingId}`);
    return response.data.data;
  },

  /**
   * Create new inventory unit
   */
  async create(data: UnitFormData): Promise<PropertyUnit> {
    const response = await api.post('/units', data);
    return response.data.data;
  },

  /**
   * Update existing unit specifications
   */
  async update(id: string, data: Partial<UnitFormData>): Promise<PropertyUnit> {
    const response = await api.put(`/units/${id}`, data);
    return response.data.data;
  },

  /**
   * Controlled availability state machine update
   */
  async updateAvailability(id: string, data: UpdateAvailabilityFormData): Promise<PropertyUnit> {
    const response = await api.patch(`/units/${id}/availability`, data);
    return response.data.data;
  },

  /**
   * List active amenities catalog
   */
  async listAmenities(): Promise<Amenity[]> {
    const response = await api.get('/amenities');
    return response.data.data;
  },
};
