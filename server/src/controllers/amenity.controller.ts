import { Request, Response } from 'express';
import { AmenityService } from '../services/amenity.service.js';

export class AmenityController {
  /**
   * GET /api/amenities - List active amenities
   */
  static async list(_req: Request, res: Response): Promise<void> {
    try {
      const amenities = await AmenityService.listAmenities();
      res.status(200).json({
        success: true,
        data: amenities,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch amenities.',
      });
    }
  }
}
