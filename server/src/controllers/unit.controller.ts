import { Request, Response } from 'express';
import { UnitService } from '../services/unit.service.js';

export class UnitController {
  /**
   * GET /api/units - List units with multi-criteria filters
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const {
        project_id,
        wing_id,
        city,
        floor_min,
        floor_max,
        configuration,
        availability_status,
        min_price,
        max_price,
        min_carpet,
        max_carpet,
        search,
        page,
        limit,
        sort_by,
        sort_order,
      } = req.query;

      const result = await UnitService.listUnits({
        project_id: project_id as string,
        wing_id: wing_id as string,
        city: city as string,
        floor_min: floor_min !== undefined ? Number(floor_min) : undefined,
        floor_max: floor_max !== undefined ? Number(floor_max) : undefined,
        configuration: configuration as string,
        availability_status: availability_status as any,
        min_price: min_price !== undefined ? Number(min_price) : undefined,
        max_price: max_price !== undefined ? Number(max_price) : undefined,
        min_carpet: min_carpet !== undefined ? Number(min_carpet) : undefined,
        max_carpet: max_carpet !== undefined ? Number(max_carpet) : undefined,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sort_by: sort_by as any,
        sort_order: sort_order as any,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch inventory units.',
      });
    }
  }

  /**
   * GET /api/units/summary - Aggregate inventory metrics
   */
  static async summary(req: Request, res: Response): Promise<void> {
    try {
      const { project_id } = req.query;
      const summary = await UnitService.getInventorySummary(project_id as string);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch inventory summary metrics.',
      });
    }
  }

  /**
   * GET /api/units/matrix - Visual floor matrix
   */
  static async matrix(req: Request, res: Response): Promise<void> {
    try {
      const { project_id, wing_id } = req.query;

      if (!project_id || !wing_id) {
        res.status(400).json({
          success: false,
          error: 'Both project_id and wing_id are required to generate the floor matrix.',
        });
        return;
      }

      const matrix = await UnitService.getFloorMatrix(project_id as string, wing_id as string);
      if (!matrix) {
        res.status(404).json({
          success: false,
          error: 'Project or wing not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: matrix,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to generate visual floor matrix.',
      });
    }
  }

  /**
   * GET /api/units/:id - Get unit by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await UnitService.getUnitById(id);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Unit not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve unit specifications.',
      });
    }
  }

  /**
   * POST /api/units - Create new unit
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const actorId = req.user!.userId;
      const unit = await UnitService.createUnit(req.body, actorId);

      res.status(201).json({
        success: true,
        message: 'Unit created successfully.',
        data: unit,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to create unit.',
      });
    }
  }

  /**
   * PUT /api/units/:id - Update unit specifications
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorId = req.user!.userId;
      const unit = await UnitService.updateUnit(id, req.body, actorId);

      res.status(200).json({
        success: true,
        message: 'Unit specifications updated successfully.',
        data: unit,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to update unit.',
      });
    }
  }

  /**
   * PATCH /api/units/:id/availability - Controlled availability state transition
   */
  static async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorId = req.user!.userId;
      const userRole = req.user!.roles[0];
      const unit = await UnitService.updateAvailability(id, req.body, actorId, userRole);

      res.status(200).json({
        success: true,
        message: `Unit availability updated to ${unit.availability_status}.`,
        data: unit,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to update unit availability.',
      });
    }
  }
}
