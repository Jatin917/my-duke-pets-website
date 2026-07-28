import { body } from 'express-validator';

export const contactFormValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit mobile number'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

export const helpEnquiryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit mobile number'),
  body('intent').trim().notEmpty().withMessage('Please select what you need'),
  body('petType').trim().notEmpty().withMessage('Category is required'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];
