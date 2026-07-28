import { body } from 'express-validator';

export const sendOtpValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
];

export const verifyOtpValidator = [
  body('otp')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('OTP must be a 6-digit number'),
  body('email').isEmail().withMessage('Please provide a valid email'),
];

export const verifyMsg91Validator = [
  body('accessToken').trim().notEmpty().withMessage('MSG91 access token is required'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];

export const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Please enter your full name (at least 2 characters)'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('state').trim().notEmpty().withMessage('Please select your state'),
  body('city').trim().notEmpty().withMessage('Please select your city'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Please confirm your password'),
];

export const loginValidator = [
  body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
