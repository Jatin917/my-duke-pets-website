import express from 'express';
import { submitContactForm, submitHelpEnquiry } from '../controllers/contactController.js';
import { contactFormValidator, helpEnquiryValidator } from '../validators/contactValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.post('/', contactFormValidator, validate, submitContactForm);
router.post('/help', helpEnquiryValidator, validate, submitHelpEnquiry);

export default router;
