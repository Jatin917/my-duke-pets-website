import express from 'express';
import { getDonateSettings, updateDonateSettings, acknowledgeDonation } from '../controllers/donateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getDonateSettings);
router.post('/acknowledge', acknowledgeDonation);
router.put('/', protect, authorize('admin', 'superadmin'), upload.single('qrImage'), updateDonateSettings);

export default router;
