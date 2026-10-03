import { Router } from 'express';
import { UnitController } from '../controllers/unit.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import {
  validateBody,
  createUnitSchema,
  updateUnitSchema,
  updateAvailabilitySchema,
} from '../middleware/validation.middleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Public list endpoint
router.get('/', UnitController.list);

// Staff inventory endpoints
router.get('/summary', authenticateToken, UnitController.summary);
router.get('/matrix', authenticateToken, UnitController.matrix);

// Public get by id endpoint
router.get('/:id', UnitController.getById);

// Availability status change: Admin, Employee, Agent (Authoritative transition rules enforced in service)
router.patch(
  '/:id/availability',
  authenticateToken,
  validateBody(updateAvailabilitySchema),
  UnitController.updateAvailability
);

// Administrative inventory mutations: Admin only
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(createUnitSchema),
  UnitController.create
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  validateBody(updateUnitSchema),
  UnitController.update
);

export const unitRoutes = router;
