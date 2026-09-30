import api from './api';
import {
  FollowUpItem,
  FollowUpFormData,
  FollowUpSummary,
  FollowUpType,
  FollowUpStatus,
} from '../types/followUp.types';

export interface FollowUpFilters {
  lead_id?: string;
  assigned_user_id?: string;
  follow_up_type?: FollowUpType;
  status?: FollowUpStatus;
  view?: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export const followUpService = {
  /**
   * List follow-ups with filters, tab view, search, and pagination
   */
  async list(filters: FollowUpFilters = {}): Promise<{
    followUps: FollowUpItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.lead_id) params.append('lead_id', filters.lead_id);
    if (filters.assigned_user_id) params.append('assigned_user_id', filters.assigned_user_id);
    if (filters.follow_up_type) params.append('follow_up_type', filters.follow_up_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.view) params.append('view', filters.view);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/follow-ups?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get KPI summary of follow-ups across views (today, upcoming, overdue, completed)
   */
  async getSummary(): Promise<FollowUpSummary> {
    const response = await api.get('/follow-ups/summary');
    return response.data.data;
  },

  /**
   * Get single follow-up by ID
   */
  async getById(id: string): Promise<FollowUpItem> {
    const response = await api.get(`/follow-ups/${id}`);
    return response.data.data;
  },

  /**
   * Schedule new follow-up
   */
  async create(data: FollowUpFormData): Promise<FollowUpItem> {
    const response = await api.post('/follow-ups', data);
    return response.data.data;
  },

  /**
   * Update follow-up details
   */
  async update(id: string, data: Partial<FollowUpFormData>): Promise<FollowUpItem> {
    const response = await api.put(`/follow-ups/${id}`, data);
    return response.data.data;
  },

  /**
   * Mark follow-up as completed with outcome & remarks
   */
  async complete(
    id: string,
    data: {
      outcome: string;
      remarks?: string;
      next_follow_up_date?: string;
      create_next_follow_up?: boolean;
      next_follow_up_type?: FollowUpType;
      next_follow_up_remarks?: string;
    }
  ): Promise<FollowUpItem> {
    const response = await api.patch(`/follow-ups/${id}/status`, {
      status: 'Completed',
      ...data,
    });
    return response.data.data;
  },

  /**
   * Reschedule follow-up
   */
  async reschedule(
    id: string,
    data: { scheduled_date: string; scheduled_time?: string; remarks?: string }
  ): Promise<FollowUpItem> {
    const response = await api.patch(`/follow-ups/${id}/reschedule`, data);
    return response.data.data;
  },

  /**
   * Cancel follow-up
   */
  async cancel(id: string, remarks?: string): Promise<FollowUpItem> {
    const response = await api.post(`/follow-ups/${id}/cancel`, { remarks });
    return response.data.data;
  },
};
