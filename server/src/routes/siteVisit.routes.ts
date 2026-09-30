import { Router } from 'express';
import { SiteVisitController } from '../controllers/siteVisit.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  validateBody,
  createSiteVisitSchema,
  updateSiteVisitSchema,
  updateSiteVisitStatusSchema,
  rescheduleSiteVisitSchema,
  reassignSiteVisitSchema,
} from '../middleware/validation.middleware.js';

const router = Router();

// All site visit routes require authenticated token
router.use(authenticateToken);

// List and Summary
router.get('/', SiteVisitController.list);
router.get('/summary', SiteVisitController.getSummary);
router.get('/:id', SiteVisitController.getById);

// Creation & Modifications
router.post('/', validateBody(createSiteVisitSchema), SiteVisitController.create);
router.put('/:id', validateBody(updateSiteVisitSchema), SiteVisitController.update);
router.patch('/:id/status', validateBody(updateSiteVisitStatusSchema), SiteVisitController.updateStatus);
router.patch('/:id/reschedule', validateBody(rescheduleSiteVisitSchema), SiteVisitController.reschedule);
router.patch('/:id/assignment', validateBody(reassignSiteVisitSchema), SiteVisitController.reassign);

export default router;
