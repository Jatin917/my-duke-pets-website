import { body } from 'express-validator';

export const contactFormValidator = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

export const helpEnquiryValidator = [
  body('intent').trim().notEmpty().withMessage('Please select what you need'),
  body('petType').trim().notEmpty().withMessage('Pet type is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];
