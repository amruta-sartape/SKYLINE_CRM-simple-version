import { Router } from 'express';
import { AmenityController } from '../controllers/amenity.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// All amenity routes require authentication
router.use(requireAuth);

router.get('/', AmenityController.list);

export const amenityRoutes = router;
