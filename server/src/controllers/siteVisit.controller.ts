import { Request, Response, NextFunction } from 'express';
import { SiteVisitService, SiteVisitFilters } from '../services/siteVisit.service.js';

export class SiteVisitController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: SiteVisitFilters = {
        search: req.query.search as string,
        leadId: req.query.leadId as string,
        projectId: req.query.projectId as string,
        unitId: req.query.unitId as string,
        assignedUserId: req.query.assignedUserId as string,
        status: req.query.status as any,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as any) || 'DESC',
      };

      const result = await SiteVisitService.list(filters, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await SiteVisitService.getSummary(req.user!);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await SiteVisitService.getById(id, req.user!);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Site visit record not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const visit = await SiteVisitService.create(req.body, req.user!.userId);
      res.status(201).json({
        success: true,
        message: 'Site visit scheduled successfully.',
        data: visit,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const visit = await SiteVisitService.update(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Site visit updated successfully.',
        data: visit,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const visit = await SiteVisitService.updateStatus(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: `Site visit marked as ${req.body.visit_status}.`,
        data: visit,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async reschedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const visit = await SiteVisitService.reschedule(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Site visit rescheduled successfully.',
        data: visit,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async reassign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const visit = await SiteVisitService.reassign(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Site visit reassigned successfully.',
        data: visit,
      });
    } catch (err) {
      next(err);
    }
  }
}
