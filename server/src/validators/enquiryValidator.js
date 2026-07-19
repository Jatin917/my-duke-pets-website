import { body } from 'express-validator';

export const enquiryValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('phone')
    .trim()
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pet').notEmpty().withMessage('Pet reference is required'),
];
