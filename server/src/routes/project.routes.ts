import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import {
  validateBody,
  createProjectSchema,
  updateProjectSchema,
  createWingSchema,
} from '../middleware/validation.middleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Read endpoints: accessible to Admin, Employee, and Agent
router.get('/', ProjectController.list);
router.get('/:id', ProjectController.getById);
router.get('/:id/wings', ProjectController.listWings);

// Administrative mutations: Admin only
router.post(
  '/',
  requireRole(UserRole.ADMIN),
  validateBody(createProjectSchema),
  ProjectController.create
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateBody(updateProjectSchema),
  ProjectController.update
);

router.post(
  '/:id/archive',
  requireRole(UserRole.ADMIN),
  ProjectController.archive
);

router.post(
  '/:id/wings',
  requireRole(UserRole.ADMIN),
  validateBody(createWingSchema),
  ProjectController.createWing
);

export const projectRoutes = router;
