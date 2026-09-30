import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service.js';

export class ProjectController {
  /**
   * GET /api/projects - List projects with filters
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, city, is_active, page, limit } = req.query;

      const result = await ProjectService.listProjects({
        search: search as string,
        status: status as any,
        city: city as string,
        is_active: is_active !== undefined ? Number(is_active) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch projects.',
      });
    }
  }

  /**
   * GET /api/projects/:id - Get project by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const project = await ProjectService.getProjectById(id);

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve project details.',
      });
    }
  }

  /**
   * POST /api/projects - Create new project
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const actorId = req.user!.userId;
      const project = await ProjectService.createProject(req.body, actorId);

      res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        data: project,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to create project.',
      });
    }
  }

  /**
   * PUT /api/projects/:id - Update existing project
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorId = req.user!.userId;
      const project = await ProjectService.updateProject(id, req.body, actorId);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully.',
        data: project,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to update project.',
      });
    }
  }

  /**
   * POST /api/projects/:id/archive - Archive / Deactivate project
   */
  static async archive(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorId = req.user!.userId;
      const project = await ProjectService.archiveProject(id, actorId);

      res.status(200).json({
        success: true,
        message: 'Project archived successfully.',
        data: project,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to archive project.',
      });
    }
  }

  /**
   * GET /api/projects/:id/wings - List wings for project
   */
  static async listWings(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const wings = await ProjectService.listWings(id);

      res.status(200).json({
        success: true,
        data: wings,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch project wings.',
      });
    }
  }

  /**
   * POST /api/projects/:id/wings - Add wing to project
   */
  static async createWing(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const actorId = req.user!.userId;
      const wing = await ProjectService.createWing(id, req.body, actorId);

      res.status(201).json({
        success: true,
        message: 'Wing created successfully.',
        data: wing,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to create wing.',
      });
    }
  }
}
