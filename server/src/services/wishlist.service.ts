import crypto from 'crypto';
import { WishlistModel } from '../models/index.js';

export class WishlistService {
  /**
   * Fetch all saved wishlist items for an authenticated user
   */
  public static async getWishlist(userId: string) {
    const items = await WishlistModel.find({ user_id: userId }).sort({ created_at: -1 });
    const wishlist = items.map((item) => ({
      ...item.property_data,
      id: item.property_id,
      property_id: item.property_id,
      savedAt: typeof item.created_at === 'string' ? item.created_at : item.created_at.toISOString(),
    }));
    return {
      wishlist,
      total: wishlist.length,
    };
  }

  /**
   * Toggle save state for a property on an authenticated user's wishlist
   */
  public static async toggle(userId: string, property: any) {
    if (!property) {
      throw new Error('Property payload is required to toggle wishlist.');
    }

    const rawId = property.id || property._id || property.property_id || property.code || property.title;
    const propertyId = String(rawId).trim();
    const cleanId = propertyId.toLowerCase();

    // Check if already in user's wishlist (case-insensitive check)
    const existing = await WishlistModel.findOne({
      user_id: userId,
      $or: [
        { property_id: propertyId },
        { property_id: cleanId },
        { 'property_data.id': propertyId },
        { 'property_data.id': cleanId },
      ],
    });

    if (existing) {
      await WishlistModel.findByIdAndDelete(existing._id);
      return {
        saved: false,
        propertyId,
        message: 'Property removed from your wishlist.',
      };
    }

    const coverImg =
      property.images?.cover ||
      property.cover_image ||
      property.coverImage ||
      (property.subtype === 'Penthouse'
        ? '/images/classifications/penthouse.jpg'
        : property.subtype === 'Villa'
        ? '/images/classifications/villa.jpg'
        : '/images/classifications/apartment.jpg');

    const formattedPrice =
      property.priceLabel ||
      property.price_formatted ||
      (property.price ? `₹${(property.price / 10000000).toFixed(2)} Cr` : 'Price on Request');

    const snapshot = {
      id: propertyId,
      code: property.code,
      title: property.title || property.name || 'Prime Real Estate Property',
      subtype: property.subtype || 'Apartment',
      mainCategory: property.mainCategory || 'Residential',
      location: property.location || 'Prime Corridor',
      city: property.city || 'Mumbai',
      state: property.state || 'Maharashtra',
      price: Number(property.price) || 0,
      priceLabel: formattedPrice,
      pricePerSqft: property.pricePerSqft,
      areaLabel: property.areaLabel || (property.carpetArea ? `${property.carpetArea} sq.ft` : undefined),
      area: property.carpetArea || property.area,
      availability: property.availability || property.availability_status || 'Available',
      status: property.status || 'Active',
      developer: property.developer || 'Skyline Realty Group',
      highlights: property.highlights || [],
      coverImage: coverImg,
      savedAt: new Date().toISOString(),
    };

    const doc = await WishlistModel.create({
      _id: `wsh_${crypto.randomUUID()}`,
      user_id: userId,
      property_id: propertyId,
      property_data: snapshot,
    });

    return {
      saved: true,
      propertyId,
      item: snapshot,
      message: 'Property saved to your wishlist.',
    };
  }

  /**
   * Remove a specific property from an authenticated user's wishlist
   */
  public static async remove(userId: string, propertyId: string) {
    const cleanId = String(propertyId).trim().toLowerCase();
    await WishlistModel.deleteMany({
      user_id: userId,
      $or: [
        { property_id: propertyId },
        { property_id: cleanId },
        { 'property_data.id': propertyId },
        { 'property_data.id': cleanId },
      ],
    });
    return { success: true, message: 'Property removed from wishlist.' };
  }

  /**
   * Clear all wishlist items for an authenticated user
   */
  public static async clear(userId: string) {
    await WishlistModel.deleteMany({ user_id: userId });
    return { success: true, message: 'Wishlist cleared successfully.' };
  }
}
