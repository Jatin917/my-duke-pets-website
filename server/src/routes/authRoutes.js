import express from 'express';
import { login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginValidator } from '../validators/authValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
