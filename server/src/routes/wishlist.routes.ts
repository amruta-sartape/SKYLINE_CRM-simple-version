import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All wishlist endpoints require valid authentication token
router.use(authenticateToken);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggle);
router.delete('/:propertyId', WishlistController.remove);
router.delete('/', WishlistController.clear);

export default router;
