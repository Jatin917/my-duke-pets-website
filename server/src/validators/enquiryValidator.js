import { body } from 'express-validator';

export const enquiryValidator = [
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pet').notEmpty().withMessage('Pet reference is required'),
];
