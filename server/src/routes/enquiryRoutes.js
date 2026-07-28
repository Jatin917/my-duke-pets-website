import express from 'express';
import {
  createEnquiry,
  createPromptEnquiry,
  getEnquiries,
  getEnquiry,
  updateEnquiry,
  deleteEnquiry,
  exportEnquiries,
  getDashboardStats,
  getGoogleSheet,
} from '../controllers/enquiryController.js';
import { protect, protectCustomer } from '../middleware/authMiddleware.js';
import { enquiryValidator, promptEnquiryValidator } from '../validators/enquiryValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/', protectCustomer, enquiryValidator, validate, createEnquiry);
router.post('/prompt', promptEnquiryValidator, validate, createPromptEnquiry);
router.get('/', protect, getEnquiries);
router.get('/export/excel', protect, exportEnquiries);
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/google-sheet', protect, getGoogleSheet);
router.get('/:id', protect, getEnquiry);
router.put('/:id', protect, updateEnquiry);
router.delete('/:id', protect, deleteEnquiry);

export default router;
