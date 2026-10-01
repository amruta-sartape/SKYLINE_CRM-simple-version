import { Router } from 'express';
import { PropertyListingController } from '../controllers/propertyListing.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Read endpoints: accessible to authenticated users (Admin, Employee, Agent)
router.get('/', PropertyListingController.list);
router.get('/:id', PropertyListingController.getById);

// Admin-Only Property Management Endpoints (Strict RBAC Enforcement)
router.post(
  '/',
  requireRole(UserRole.ADMIN),
  PropertyListingController.create
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN),
  PropertyListingController.update
);

router.post(
  '/:id/archive',
  requireRole(UserRole.ADMIN),
  PropertyListingController.archive
);

router.post(
  '/:id/restore',
  requireRole(UserRole.ADMIN),
  PropertyListingController.restore
);

// Admin-Only Image Upload & Management Endpoints
router.post(
  '/:id/images',
  requireRole(UserRole.ADMIN),
  PropertyListingController.uploadImages
);

router.post(
  '/:id/images/:imageId/set-cover',
  requireRole(UserRole.ADMIN),
  PropertyListingController.setCover
);

router.delete(
  '/:id/images/:imageId',
  requireRole(UserRole.ADMIN),
  PropertyListingController.deleteImage
);

export const propertyListingRoutes = router;
export default router;
