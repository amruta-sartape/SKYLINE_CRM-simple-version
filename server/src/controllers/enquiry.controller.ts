import { Request, Response, NextFunction } from 'express';
import { EnquiryService } from '../services/enquiry.service.js';

export class EnquiryController {
  public static async getEnquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string,
        source: req.query.source as any,
        configuration: req.query.configuration as any,
        status: req.query.status as any,
        assigned_to: req.query.assigned_to as string,
        city: req.query.city as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await EnquiryService.getEnquiries(filters, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getEnquiryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const enquiry = await EnquiryService.getEnquiryById(id, req.user!);
      if (!enquiry) {
        res.status(404).json({ success: false, error: 'Enquiry not found.' });
        return;
      }
      res.status(200).json({
        success: true,
        data: { enquiry },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enquiry = await EnquiryService.createEnquiry(req.body, req.user!);
      res.status(201).json({
        success: true,
        message: 'Client enquiry successfully logged.',
        data: { enquiry },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const enquiry = await EnquiryService.updateEnquiry(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Enquiry updated successfully.',
        data: { enquiry },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async convertToLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await EnquiryService.convertToLead(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Enquiry successfully converted to CRM Lead.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
