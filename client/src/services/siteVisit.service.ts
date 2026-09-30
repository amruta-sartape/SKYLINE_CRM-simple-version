import api from './api';
import {
  SiteVisit,
  SiteVisitFormData,
  SiteVisitSummary,
  SiteVisitStatus,
  SiteVisitOutcome,
} from '../types/siteVisit.types';

export interface SiteVisitFilters {
  lead_id?: string;
  project_id?: string;
  unit_id?: string;
  assigned_user_id?: string;
  visit_status?: SiteVisitStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const siteVisitService = {
  /**
   * List site visits with filters, search, and pagination
   */
  async list(filters: SiteVisitFilters = {}): Promise<{
    visits: SiteVisit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.lead_id) params.append('lead_id', filters.lead_id);
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.unit_id) params.append('unit_id', filters.unit_id);
    if (filters.assigned_user_id) params.append('assigned_user_id', filters.assigned_user_id);
    if (filters.visit_status) params.append('visit_status', filters.visit_status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/site-visits?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get KPI summary of site visits
   */
  async getSummary(): Promise<SiteVisitSummary> {
    const response = await api.get('/site-visits/summary');
    return response.data.data;
  },

  /**
   * Get single site visit by ID
   */
  async getById(id: string): Promise<SiteVisit> {
    const response = await api.get(`/site-visits/${id}`);
    return response.data.data;
  },

  /**
   * Schedule new site visit
   */
  async create(data: SiteVisitFormData): Promise<SiteVisit> {
    const response = await api.post('/site-visits', data);
    return response.data.data;
  },

  /**
   * Update site visit details
   */
  async update(id: string, data: Partial<SiteVisitFormData>): Promise<SiteVisit> {
    const response = await api.put(`/site-visits/${id}`, data);
    return response.data.data;
  },

  /**
   * Update status (e.g. Completed with outcome & remarks, Cancelled, or No Show)
   */
  async updateStatus(
    id: string,
    data: { visit_status: SiteVisitStatus; outcome?: SiteVisitOutcome; remarks?: string }
  ): Promise<SiteVisit> {
    const response = await api.patch(`/site-visits/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Reschedule site visit date and time
   */
  async reschedule(
    id: string,
    data: { visit_date: string; visit_time: string; remarks?: string }
  ): Promise<SiteVisit> {
    const response = await api.patch(`/site-visits/${id}/reschedule`, data);
    return response.data.data;
  },

  /**
   * Reassign site visit to different executive (Admin only)
   */
  async reassign(id: string, assigned_user_id: string): Promise<SiteVisit> {
    const response = await api.patch(`/site-visits/${id}/assignment`, { assigned_user_id });
    return response.data.data;
  },
};
