import { Router } from 'express';
import { PropertyListingController } from '../controllers/propertyListing.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Read endpoints: accessible to everyone (Public discovery, Customer, Staff)
router.get('/', PropertyListingController.list);
router.get('/:id', PropertyListingController.getById);

// Admin-Only Property Management Endpoints (Strict RBAC Enforcement)
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.create
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.update
);

router.post(
  '/:id/archive',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.archive
);

router.post(
  '/:id/restore',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.restore
);

// Admin-Only Image Upload & Management Endpoints
router.post(
  '/:id/images',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.uploadImages
);

router.post(
  '/:id/images/:imageId/set-cover',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.setCover
);

router.delete(
  '/:id/images/:imageId',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  PropertyListingController.deleteImage
);

export const propertyListingRoutes = router;
export default router;
