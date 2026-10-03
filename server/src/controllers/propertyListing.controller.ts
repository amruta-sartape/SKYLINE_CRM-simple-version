import { Request, Response, NextFunction } from 'express';
import { PropertyListingService } from '../services/propertyListing.service.js';

export class PropertyListingController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        category,
        subtype,
        city,
        status,
        is_active,
        page,
        limit,
      } = req.query;

      const result = await PropertyListingService.listProperties({
        search: search as string,
        category: category as string,
        subtype: subtype as string,
        city: city as string,
        status: status as string,
        is_active: is_active !== undefined ? Number(is_active) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const property = await PropertyListingService.getPropertyById(id);

      if (!property) {
        res.status(404).json({
          success: false,
          error: `Property ${id} not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        property,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const property = await PropertyListingService.createProperty(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Property created successfully.',
        property,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const property = await PropertyListingService.updateProperty(id, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Property updated successfully.',
        property,
      });
    } catch (err) {
      next(err);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const property = await PropertyListingService.archiveProperty(id, userId);

      res.status(200).json({
        success: true,
        message: 'Property archived successfully.',
        property,
      });
    } catch (err) {
      next(err);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const property = await PropertyListingService.restoreProperty(id, userId);

      res.status(200).json({
        success: true,
        message: 'Property restored successfully.',
        property,
      });
    } catch (err) {
      next(err);
    }
  }

  static async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const { images } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Images array is required.',
        });
        return;
      }

      const savedImages = await PropertyListingService.uploadPropertyImages(id, images, userId);

      res.status(200).json({
        success: true,
        message: `${images.length} images uploaded successfully.`,
        images: savedImages,
      });
    } catch (err) {
      next(err);
    }
  }

  static async setCover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const imageId = req.params.imageId as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const property = await PropertyListingService.setCoverImage(id, imageId, userId);

      res.status(200).json({
        success: true,
        message: 'Cover image updated successfully.',
        property,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const imageId = req.params.imageId as string;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const remainingImages = await PropertyListingService.deletePropertyImage(id, imageId, userId);

      res.status(200).json({
        success: true,
        message: 'Image removed successfully.',
        images: remainingImages,
      });
    } catch (err) {
      next(err);
    }
  }
}
