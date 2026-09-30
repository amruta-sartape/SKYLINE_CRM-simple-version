import api from './api';
import {
  PropertyProject,
  PropertyWing,
  ProjectFormData,
  ProjectStatus,
} from '../types/property.types';

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  city?: string;
  is_active?: number;
  page?: number;
  limit?: number;
}

export const projectService = {
  /**
   * List projects with search, filter, and pagination
   */
  async list(filters: ProjectFilters = {}): Promise<{
    projects: PropertyProject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/projects?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get single project by ID with wings
   */
  async getById(id: string): Promise<PropertyProject> {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  /**
   * Create new project
   */
  async create(data: ProjectFormData): Promise<PropertyProject> {
    const response = await api.post('/projects', data);
    return response.data.data;
  },

  /**
   * Update project details
   */
  async update(id: string, data: Partial<ProjectFormData>): Promise<PropertyProject> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.data;
  },

  /**
   * Archive / Deactivate project
   */
  async archive(id: string): Promise<PropertyProject> {
    const response = await api.post(`/projects/${id}/archive`);
    return response.data.data;
  },

  /**
   * List wings for project
   */
  async listWings(projectId: string): Promise<PropertyWing[]> {
    const response = await api.get(`/projects/${projectId}/wings`);
    return response.data.data;
  },

  /**
   * Add wing to project
   */
  async createWing(
    projectId: string,
    data: { name: string; total_floors?: number; units_per_floor?: number }
  ): Promise<PropertyWing> {
    const response = await api.post(`/projects/${projectId}/wings`, data);
    return response.data.data;
  },
};
