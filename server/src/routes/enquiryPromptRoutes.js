import express from 'express';
import {
  getEnquiryPromptSettings,
  updateEnquiryPromptSettings,
} from '../controllers/enquiryPromptController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEnquiryPromptSettings);
router.put('/', protect, authorize('admin', 'superadmin'), updateEnquiryPromptSettings);

export default router;
