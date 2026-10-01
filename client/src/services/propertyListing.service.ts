import api from './api';
import {
  PropertyMainCategory,
  PropertySubtype,
} from '../types/discovery.types';

export interface PropertyListingDTO {
  id?: string;
  title: string;
  code?: string;
  main_category: PropertyMainCategory;
  subtype: PropertySubtype;
  price: number;
  price_label?: string;
  price_per_sqft?: number;
  location: string;
  city: string;
  state?: string;
  developer?: string;
  availability?: string;
  status?: string;
  description?: string;
  highlights?: string[];
  address_details?: Record<string, any>;
  specs_data?: Record<string, any>;
  amenity_ids?: string[];
  cover_image?: string;
}

export interface UploadImageInput {
  filename: string;
  contentType: string;
  base64Data: string;
  label?: string;
  category?: string;
  isCover?: boolean;
}

export interface PropertyImageRecord {
  id: string;
  property_id: string;
  url: string;
  label: string;
  category: string;
  alt_text?: string;
  is_cover: number;
  display_order: number;
  created_at: string;
}

export const propertyListingService = {
  /**
   * List properties from database (Admin and Discovery)
   */
  async list(filters: {
    search?: string;
    category?: string;
    subtype?: string;
    city?: string;
    status?: string;
    is_active?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    properties: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.subtype) params.append('subtype', filters.subtype);
    if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    if (filters.status) params.append('status', filters.status);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/property-listings?${params.toString()}`);
    return response.data;
  },

  /**
   * Get property listing by ID or Code
   */
  async getById(id: string): Promise<any> {
    const response = await api.get(`/property-listings/${id}`);
    return response.data.property;
  },

  /**
   * Create new property listing (Admin Only)
   */
  async create(data: PropertyListingDTO): Promise<any> {
    const response = await api.post('/property-listings', data);
    return response.data.property;
  },

  /**
   * Update existing property listing (Admin Only)
   */
  async update(id: string, data: Partial<PropertyListingDTO>): Promise<any> {
    const response = await api.put(`/property-listings/${id}`, data);
    return response.data.property;
  },

  /**
   * Archive property listing (Admin Only)
   */
  async archive(id: string): Promise<any> {
    const response = await api.post(`/property-listings/${id}/archive`);
    return response.data.property;
  },

  /**
   * Restore archived property listing (Admin Only)
   */
  async restore(id: string): Promise<any> {
    const response = await api.post(`/property-listings/${id}/restore`);
    return response.data.property;
  },

  /**
   * Upload property images (Admin Only)
   */
  async uploadImages(id: string, images: UploadImageInput[]): Promise<PropertyImageRecord[]> {
    const response = await api.post(`/property-listings/${id}/images`, { images });
    return response.data.images;
  },

  /**
   * Set cover image (Admin Only)
   */
  async setCover(id: string, imageId: string): Promise<any> {
    const response = await api.post(`/property-listings/${id}/images/${imageId}/set-cover`);
    return response.data.property;
  },

  /**
   * Delete image from property (Admin Only)
   */
  async deleteImage(id: string, imageId: string): Promise<PropertyImageRecord[]> {
    const response = await api.delete(`/property-listings/${id}/images/${imageId}`);
    return response.data.images;
  },
};
