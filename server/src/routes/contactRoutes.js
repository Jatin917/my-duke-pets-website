import express from 'express';
import { submitContactForm, submitHelpEnquiry } from '../controllers/contactController.js';
import { protectCustomer } from '../middleware/authMiddleware.js';
import { contactFormValidator, helpEnquiryValidator } from '../validators/contactValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/', protectCustomer, contactFormValidator, validate, submitContactForm);
router.post('/help', protectCustomer, helpEnquiryValidator, validate, submitHelpEnquiry);

export default router;
