import express from 'express';
import {
  sendOtp,
  verifyOtp,
  verifyMsg91,
  completeSignup,
  getCustomerMe,
  updateCustomerProfile,
} from '../controllers/customerAuthController.js';
import { protectCustomer } from '../middleware/authMiddleware.js';
import {
  sendOtpValidator,
  verifyOtpValidator,
  verifyMsg91Validator,
  completeSignupValidator,
} from '../validators/customerAuthValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/send-otp', sendOtpValidator, validate, sendOtp);
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtp);
router.post('/verify-msg91', verifyMsg91Validator, validate, verifyMsg91);
router.post('/complete-signup', completeSignupValidator, validate, completeSignup);
router.get('/me', protectCustomer, getCustomerMe);
router.put('/profile', protectCustomer, updateCustomerProfile);

export default router;
