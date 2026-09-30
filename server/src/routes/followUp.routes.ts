import { Router } from 'express';
import { FollowUpController } from '../controllers/followUp.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  validateBody,
  createFollowUpItemSchema,
  updateFollowUpItemSchema,
  updateFollowUpStatusSchema,
  rescheduleFollowUpSchema,
} from '../middleware/validation.middleware.js';

const router = Router();

// All follow-up routes require authenticated token
router.use(authenticateToken);

// List and Summary
router.get('/', FollowUpController.list);
router.get('/summary', FollowUpController.getSummary);
router.get('/:id', FollowUpController.getById);

// Creation & Modifications
router.post('/', validateBody(createFollowUpItemSchema), FollowUpController.create);
router.put('/:id', validateBody(updateFollowUpItemSchema), FollowUpController.update);
router.patch('/:id/status', validateBody(updateFollowUpStatusSchema), FollowUpController.complete);
router.patch('/:id/reschedule', validateBody(rescheduleFollowUpSchema), FollowUpController.reschedule);
router.post('/:id/cancel', FollowUpController.cancel);

export default router;
