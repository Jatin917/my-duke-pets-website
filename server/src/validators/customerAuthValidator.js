import { body } from 'express-validator';

export const sendOtpValidator = [
  body('channel').isIn(['email', 'phone']).withMessage('Channel must be email or phone'),
  body('email')
    .if(body('channel').equals('email'))
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .if(body('channel').equals('phone'))
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];

export const verifyOtpValidator = [
  body('channel').isIn(['email', 'phone']).withMessage('Channel must be email or phone'),
  body('otp')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('OTP must be a 6-digit number'),
  body('email')
    .if(body('channel').equals('email'))
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .if(body('channel').equals('phone'))
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];

export const completeSignupValidator = [
  body('signupToken').notEmpty().withMessage('Signup token is required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Please enter your full name (at least 2 characters)'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];
