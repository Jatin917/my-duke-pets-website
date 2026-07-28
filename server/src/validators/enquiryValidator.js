import { body } from 'express-validator';

export const enquiryValidator = [
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pet').notEmpty().withMessage('Pet reference is required'),
];

export const promptEnquiryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit mobile number'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
];
