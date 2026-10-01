import api from './api';
import {
  Lead,
  LeadFormData,
  QualifyLeadFormData,
  FollowUp,
  FollowUpFormData,
  LeadActivity,
  PipelineStageSummary,
  PipelineStage,
  UserSummary,
  ApiResponse,
  PropertyInterestItem,
} from '../types/crm.types';

export const leadService = {
  /**
   * Fetch paginated and filtered leads
   */
  async getLeads(params: Record<string, any> = {}): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await api.get<
      ApiResponse<{ leads: Lead[]; total: number; page: number; limit: number }>
    >('/leads', { params });
    return res.data.data!;
  },

  /**
   * Fetch Pipeline Board data grouped by stage
   */
  async getPipelineBoard(params: Record<string, any> = {}): Promise<{
    stages: PipelineStageSummary[];
    totalLeads: number;
    totalPipelineValue: number;
  }> {
    const res = await api.get<
      ApiResponse<{
        stages: PipelineStageSummary[];
        totalLeads: number;
        totalPipelineValue: number;
      }>
    >('/leads/pipeline', { params });
    return res.data.data!;
  },

  /**
   * Fetch single lead by ID
   */
  async getLeadById(id: string): Promise<Lead> {
    const res = await api.get<ApiResponse<{ lead: Lead }>>(`/leads/${id}`);
    return res.data.data!.lead;
  },

  /**
   * Fetch complete Customer 360 Activity & Follow-up Timeline
   */
  async getLeadTimeline(
    id: string
  ): Promise<{ activities: LeadActivity[]; followUps: FollowUp[]; propertyInterests?: PropertyInterestItem[] }> {
    const res = await api.get<
      ApiResponse<{ activities: LeadActivity[]; followUps: FollowUp[]; propertyInterests?: PropertyInterestItem[] }>
    >(`/leads/${id}/timeline`);
    return res.data.data!;
  },

  /**
   * Create direct Lead
   */
  async createLead(data: LeadFormData): Promise<Lead> {
    const res = await api.post<ApiResponse<{ lead: Lead }>>('/leads', data);
    return res.data.data!.lead;
  },

  /**
   * Update lead info
   */
  async updateLead(id: string, data: Partial<LeadFormData>): Promise<Lead> {
    const res = await api.put<ApiResponse<{ lead: Lead }>>(`/leads/${id}`, data);
    return res.data.data!.lead;
  },

  /**
   * Qualify lead status & requirements
   */
  async qualifyLead(id: string, data: QualifyLeadFormData): Promise<Lead> {
    const res = await api.post<ApiResponse<{ lead: Lead }>>(`/leads/${id}/qualify`, data);
    return res.data.data!.lead;
  },

  /**
   * Transition lead to another pipeline stage
   */
  async updateStage(id: string, stage: PipelineStage, remarks?: string): Promise<Lead> {
    const res = await api.post<ApiResponse<{ lead: Lead }>>(`/leads/${id}/stage`, {
      pipeline_stage: stage,
      remarks,
    });
    return res.data.data!.lead;
  },

  /**
   * Add Follow-Up Interaction Log
   */
  async addFollowUp(id: string, data: FollowUpFormData): Promise<FollowUp> {
    const res = await api.post<ApiResponse<{ followUp: FollowUp }>>(
      `/leads/${id}/follow-up`,
      data
    );
    return res.data.data!.followUp;
  },

  /**
   * Fetch active executives/agents for assignment dropdowns
   */
  async getExecutives(): Promise<UserSummary[]> {
    const res = await api.get<ApiResponse<{ users: UserSummary[] }>>('/users/executives');
    return res.data.data!.users;
  },
};
