import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  getEnquiry,
  updateEnquiry,
  deleteEnquiry,
  exportEnquiries,
  getDashboardStats,
  getGoogleSheet,
} from '../controllers/enquiryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enquiryValidator } from '../validators/enquiryValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/', enquiryValidator, validate, createEnquiry);
router.get('/', protect, getEnquiries);
router.get('/export/excel', protect, exportEnquiries);
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/google-sheet', protect, getGoogleSheet);
router.get('/:id', protect, getEnquiry);
router.put('/:id', protect, updateEnquiry);
router.delete('/:id', protect, deleteEnquiry);

export default router;
