import { AmenityModel } from '../models/index.js';
import { Amenity } from '../types/index.js';

export class AmenityService {
  /**
   * List all active amenities
   */
  static async listAmenities(): Promise<Amenity[]> {
    const rows = await AmenityModel.find({ is_active: 1 }).sort({ category: 1, name: 1 });
    return rows.map((r) => ({
      id: r._id,
      name: r.name,
      category: r.category as any,
      icon: r.icon,
      is_active: r.is_active,
      created_at: typeof r.created_at === 'string' ? r.created_at : r.created_at.toISOString(),
    }));
  }
}
