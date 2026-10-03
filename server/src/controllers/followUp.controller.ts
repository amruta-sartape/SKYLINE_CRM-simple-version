import { Request, Response, NextFunction } from 'express';
import { FollowUpService, FollowUpFilters } from '../services/followUp.service.js';

export class FollowUpController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: FollowUpFilters = {
        search: req.query.search as string,
        leadId: req.query.leadId as string,
        assignedUserId: req.query.assignedUserId as string,
        type: req.query.type as any,
        status: req.query.status as any,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        view: req.query.view as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as any) || 'DESC',
      };

      const result = await FollowUpService.list(filters, req.user!);
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
      const summary = await FollowUpService.getSummary(req.user!);
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
      const result = await FollowUpService.getById(id, req.user!);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Follow-up record not found.',
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
      const followUp = await FollowUpService.create(req.body, req.user!.userId);
      res.status(201).json({
        success: true,
        message: 'Follow-up logged successfully.',
        data: followUp,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const followUp = await FollowUpService.update(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Follow-up updated successfully.',
        data: followUp,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const followUp = await FollowUpService.complete(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Follow-up marked as completed.',
        data: followUp,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async reschedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const followUp = await FollowUpService.reschedule(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Follow-up rescheduled successfully.',
        data: followUp,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const followUp = await FollowUpService.cancel(id, req.body.remarks, req.user!);
      res.status(200).json({
        success: true,
        message: 'Follow-up cancelled.',
        data: followUp,
      });
    } catch (err) {
      next(err);
    }
  }
}
