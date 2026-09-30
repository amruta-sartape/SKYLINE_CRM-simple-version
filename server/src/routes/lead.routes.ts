import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  validateBody,
  createLeadSchema,
  updateLeadSchema,
  qualifyLeadSchema,
  updateLeadStageSchema,
  createFollowUpSchema,
} from '../middleware/validation.middleware.js';

const router = Router();

// All lead routes require authentication
router.use(authenticateToken);

router.get('/', LeadController.getLeads);
router.get('/pipeline', LeadController.getPipelineBoard);
router.get('/:id', LeadController.getLeadById);
router.get('/:id/timeline', LeadController.getLeadTimeline);
router.post('/', validateBody(createLeadSchema), LeadController.createLead);
router.put('/:id', validateBody(updateLeadSchema), LeadController.updateLead);
router.post('/:id/qualify', validateBody(qualifyLeadSchema), LeadController.qualifyLead);
router.post('/:id/stage', validateBody(updateLeadStageSchema), LeadController.updateStage);
router.post('/:id/follow-up', validateBody(createFollowUpSchema), LeadController.addFollowUp);

export default router;
