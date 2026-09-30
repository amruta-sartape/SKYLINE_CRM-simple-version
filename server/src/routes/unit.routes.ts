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

// All unit routes require authentication
router.use(authenticateToken);

// Read endpoints: accessible to Admin, Employee, and Agent
router.get('/', UnitController.list);
router.get('/summary', UnitController.summary);
router.get('/matrix', UnitController.matrix);
router.get('/:id', UnitController.getById);

// Availability status change: Admin, Employee, Agent (Authoritative transition rules enforced in service)
router.patch(
  '/:id/availability',
  validateBody(updateAvailabilitySchema),
  UnitController.updateAvailability
);

// Administrative inventory mutations: Admin only
router.post(
  '/',
  requireRole(UserRole.ADMIN),
  validateBody(createUnitSchema),
  UnitController.create
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateBody(updateUnitSchema),
  UnitController.update
);

export const unitRoutes = router;
