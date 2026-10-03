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

// Read endpoints: public read access for property discovery
router.get('/', ProjectController.list);
router.get('/:id', ProjectController.getById);
router.get('/:id/wings', ProjectController.listWings);

// Administrative mutations: Admin only
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(createProjectSchema),
  ProjectController.create
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(updateProjectSchema),
  ProjectController.update
);

router.post(
  '/:id/archive',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  ProjectController.archive
);

router.post(
  '/:id/wings',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(createWingSchema),
  ProjectController.createWing
);

export const projectRoutes = router;
