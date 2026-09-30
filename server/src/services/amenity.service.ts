import { db } from '../db/database.js';
import { Amenity } from '../types/index.js';

export class AmenityService {
  /**
   * List all active amenities
   */
  static async listAmenities(): Promise<Amenity[]> {
    const rows = await db.all<any>(
      `SELECT * FROM amenities WHERE is_active = 1 ORDER BY category ASC, name ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      icon: r.icon,
      is_active: r.is_active,
      created_at: r.created_at,
    }));
  }
}
