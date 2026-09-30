import api from './api';
import {
  Enquiry,
  EnquiryFormData,
  ConvertEnquiryFormData,
  Lead,
  ApiResponse,
} from '../types/crm.types';

export const enquiryService = {
  /**
   * Fetch paginated and filtered enquiries
   */
  async getEnquiries(params: Record<string, any> = {}): Promise<{
    enquiries: Enquiry[];
    total: number;
    page: number;
    limit: number;
  }> {
    const res = await api.get<
      ApiResponse<{ enquiries: Enquiry[]; total: number; page: number; limit: number }>
    >('/enquiries', { params });
    return res.data.data!;
  },

  /**
   * Fetch single enquiry by ID
   */
  async getEnquiryById(id: string): Promise<Enquiry> {
    const res = await api.get<ApiResponse<{ enquiry: Enquiry }>>(`/enquiries/${id}`);
    return res.data.data!.enquiry;
  },

  /**
   * Create new Client Enquiry
   */
  async createEnquiry(data: EnquiryFormData): Promise<Enquiry> {
    const res = await api.post<ApiResponse<{ enquiry: Enquiry }>>('/enquiries', data);
    return res.data.data!.enquiry;
  },

  /**
   * Update existing enquiry
   */
  async updateEnquiry(id: string, data: Partial<EnquiryFormData>): Promise<Enquiry> {
    const res = await api.put<ApiResponse<{ enquiry: Enquiry }>>(`/enquiries/${id}`, data);
    return res.data.data!.enquiry;
  },

  /**
   * Convert Enquiry to CRM Lead
   */
  async convertToLead(
    id: string,
    data: ConvertEnquiryFormData
  ): Promise<{ lead: Lead; enquiry: Enquiry }> {
    const res = await api.post<ApiResponse<{ lead: Lead; enquiry: Enquiry }>>(
      `/enquiries/${id}/convert`,
      data
    );
    return res.data.data!;
  },
};
