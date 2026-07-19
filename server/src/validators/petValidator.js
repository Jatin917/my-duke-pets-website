import { body } from 'express-validator';

export const petValidator = [
  body('name').trim().notEmpty().withMessage('Pet name is required'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('age').trim().notEmpty().withMessage('Age is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('gender').optional().isIn(['Male', 'Female', 'Unknown']),
];
