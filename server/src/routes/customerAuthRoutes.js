import express from 'express';
import {
  sendOtp,
  verifyOtp,
  verifyMsg91,
  register,
  login,
  getCustomerMe,
  updateCustomerProfile,
} from '../controllers/customerAuthController.js';
import { protectCustomer } from '../middleware/authMiddleware.js';
import {
  sendOtpValidator,
  verifyOtpValidator,
  verifyMsg91Validator,
  registerValidator,
  loginValidator,
} from '../validators/customerAuthValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/send-otp', sendOtpValidator, validate, sendOtp);
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtp);
router.post('/verify-msg91', verifyMsg91Validator, validate, verifyMsg91);
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', protectCustomer, getCustomerMe);
router.put('/profile', protectCustomer, updateCustomerProfile);

export default router;
