import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service.js';

export class LeadController {
  public static async getLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string,
        stage: req.query.stage as any,
        qualification_status: req.query.qualification_status as any,
        flat_type: req.query.flat_type as any,
        assigned_to: req.query.assigned_to as string,
        priority: req.query.priority as any,
        loan_required: req.query.loan_required !== undefined ? parseInt(req.query.loan_required as string, 10) : undefined,
        minBudget: req.query.minBudget ? parseFloat(req.query.minBudget as string) : undefined,
        maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await LeadService.getLeads(filters, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getPipelineBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string,
        assigned_to: req.query.assigned_to as string,
        flat_type: req.query.flat_type as any,
        qualification_status: req.query.qualification_status as any,
      };

      const result = await LeadService.getPipelineBoard(filters, req.user!);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLeadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await LeadService.getLeadById(id, req.user!);
      if (!lead) {
        res.status(404).json({ success: false, error: 'Lead not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: { lead },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLeadTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const timeline = await LeadService.getLeadTimeline(id, req.user!);
      res.status(200).json({
        success: true,
        data: timeline,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await LeadService.createLead(req.body, req.user!);
      res.status(201).json({
        success: true,
        message: 'Lead successfully created.',
        data: { lead },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async qualifyLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await LeadService.qualifyLead(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Lead qualification updated.',
        data: { lead },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { pipeline_stage, remarks } = req.body;
      const lead = await LeadService.updateStage(id, pipeline_stage, remarks, req.user!);
      res.status(200).json({
        success: true,
        message: `Lead pipeline stage updated to ${pipeline_stage}.`,
        data: { lead },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async addFollowUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const followUp = await LeadService.addFollowUp(id, req.body, req.user!);
      res.status(201).json({
        success: true,
        message: 'Follow-up interaction recorded.',
        data: { followUp },
      });
    } catch (err) {
      next(err);
    }
  }
}
