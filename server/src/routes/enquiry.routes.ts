import { Router } from 'express';
import { EnquiryController } from '../controllers/enquiry.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  validateBody,
  createEnquirySchema,
  updateEnquirySchema,
  convertEnquirySchema,
} from '../middleware/validation.middleware.js';

const router = Router();

// All enquiry routes require authentication
router.use(authenticateToken);

router.get('/', EnquiryController.getEnquiries);
router.get('/:id', EnquiryController.getEnquiryById);
router.post('/', validateBody(createEnquirySchema), EnquiryController.createEnquiry);
router.put('/:id', validateBody(updateEnquirySchema), EnquiryController.updateEnquiry);
router.post('/:id/convert', validateBody(convertEnquirySchema), EnquiryController.convertToLead);

export default router;
