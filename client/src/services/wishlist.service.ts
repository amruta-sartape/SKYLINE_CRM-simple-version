import api from './api';
import { WishlistProperty } from '../context/WishlistContext';

export interface WishlistApiResponse {
  success: boolean;
  data: {
    wishlist: WishlistProperty[];
    total: number;
  };
}

export const wishlistService = {
  /**
   * Fetch all saved wishlist items for the authenticated user from MongoDB
   */
  async getWishlist(): Promise<WishlistProperty[]> {
    const res = await api.get<WishlistApiResponse>('/wishlist');
    return res.data.data?.wishlist || [];
  },

  /**
   * Toggle save state for a property in MongoDB
   */
  async toggleSave(property: any): Promise<{ saved: boolean; propertyId: string; item?: WishlistProperty }> {
    const res = await api.post<{ success: boolean; data: { saved: boolean; propertyId: string; item?: WishlistProperty } }>(
      '/wishlist/toggle',
      { property }
    );
    return res.data.data;
  },

  /**
   * Remove a property from the authenticated user's wishlist in MongoDB
   */
  async removeSaved(propertyId: string): Promise<void> {
    await api.delete(`/wishlist/${propertyId}`);
  },

  /**
   * Clear all wishlist items for the authenticated user in MongoDB
   */
  async clearWishlist(): Promise<void> {
    await api.delete('/wishlist');
  },
};
