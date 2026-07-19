import express from 'express';
import {
  createSellRequest,
  getSellRequests,
  getSellRequest,
  updateSellRequest,
  deleteSellRequest,
} from '../controllers/sellController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', upload.array('images', 10), createSellRequest);
router.get('/', protect, authorize('admin', 'superadmin'), getSellRequests);
router.get('/:id', protect, authorize('admin', 'superadmin'), getSellRequest);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateSellRequest);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteSellRequest);

export default router;
