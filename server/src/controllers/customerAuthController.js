import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendOtpFailureAdminEmail,
  sendRegistrationAdminEmail,
} from '../utils/email.js';
import { normalizeIndianMobile, verifyMsg91AccessToken } from '../utils/msg91.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const VERIFY_TOKEN_EXPIRES = '30m';

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const formatCustomer = (customer) => ({
  id: customer._id,
  name: customer.name || '',
  email: customer.email || '',
  phone: customer.phone || '',
  state: customer.state || '',
  city: customer.city || '',
  emailVerified: Boolean(customer.emailVerified),
  phoneVerified: Boolean(customer.phoneVerified),
});

const createEmailVerifyToken = (email) =>
  jwt.sign({ type: 'email-verify', email }, process.env.JWT_SECRET, {
    expiresIn: VERIFY_TOKEN_EXPIRES,
  });

const readEmailVerifyToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'email-verify' || !decoded.email) return null;
    return String(decoded.email).toLowerCase();
  } catch {
    return null;
  }
};

// @desc    Send email OTP (optional verification during register)
// @route   POST /api/customer/auth/send-otp
export const sendOtp = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }

  await Otp.updateMany(
    { identifier: email, channel: 'email', verified: false },
    { $set: { verified: true } }
  );

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await Otp.create({ channel: 'email', identifier: email, code, expiresAt });

  const result = await sendOtpEmail({ email, code });
  if (!result?.success) {
    const errorDetail =
      typeof result?.error === 'string'
        ? result.error
        : JSON.stringify(result?.error || 'SMTP send failed');
    console.error('[otp] Email delivery failed for', email, '—', errorDetail);
    sendOtpFailureAdminEmail({ email, error: errorDetail }).catch(() => {});
    res.status(503);
    throw new Error(`Could not send OTP email: ${errorDetail}`);
  }

  res.json({
    success: true,
    message: 'OTP sent to your email. Please check your inbox.',
    channel: 'email',
    identifier: email.replace(/(.{2}).+(@.+)/, '$1***$2'),
    expiresIn: 600,
  });
});

// @desc    Verify email OTP → returns short-lived proof token (does not log in)
// @route   POST /api/customer/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }
  if (!/^[0-9]{6}$/.test(otp)) {
    res.status(400);
    throw new Error('Please enter a valid 6-digit OTP');
  }

  const otpDoc = await Otp.findOne({
    identifier: email,
    channel: 'email',
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    res.status(400);
    throw new Error('OTP not found or already used. Please request a new one.');
  }
  if (otpDoc.expiresAt < new Date()) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }
  if (otpDoc.attempts >= MAX_ATTEMPTS) {
    res.status(400);
    throw new Error('Too many incorrect attempts. Please request a new OTP.');
  }
  if (otpDoc.code !== otp) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    res.status(400);
    throw new Error('Invalid OTP. Please try again.');
  }

  otpDoc.verified = true;
  await otpDoc.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
    emailVerifyToken: createEmailVerifyToken(email),
    email,
  });
});

// @desc    Verify MSG91 phone access token (optional proof during register)
// @route   POST /api/customer/auth/verify-msg91
export const verifyMsg91 = asyncHandler(async (req, res) => {
  const accessToken = (req.body.accessToken || req.body['access-token'] || '').trim();
  const claimedPhone = normalizeIndianMobile(req.body.phone);

  if (!accessToken) {
    res.status(400);
    throw new Error('MSG91 access token is required');
  }

  let verified;
  try {
    verified = await verifyMsg91AccessToken(accessToken, { fallbackPhone: claimedPhone });
  } catch (err) {
    res.status(401);
    throw new Error(err.message || 'MSG91 verification failed');
  }

  if (claimedPhone && claimedPhone !== verified.phone) {
    res.status(400);
    throw new Error('Verified mobile does not match the number you entered');
  }

  res.json({
    success: true,
    message: 'Mobile verified successfully',
    phone: verified.phone,
    phoneAccessToken: accessToken,
  });
});

// @desc    Register with password (email/phone verification optional)
// @route   POST /api/customer/auth/register
export const register = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const phone = normalizeIndianMobile(req.body.phone);
  const state = (req.body.state || '').trim();
  const city = (req.body.city || '').trim();
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirmPassword || '');
  const emailVerifyToken = (req.body.emailVerifyToken || '').trim();
  const phoneAccessToken = (req.body.phoneAccessToken || req.body.accessToken || '').trim();

  if (!name || name.length < 2) {
    res.status(400);
    throw new Error('Please enter your full name');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid 10-digit phone number');
  }
  if (!state) {
    res.status(400);
    throw new Error('Please select your state');
  }
  if (!city) {
    res.status(400);
    throw new Error('Please select your city');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const emailTaken = await Customer.findOne({ email });
  if (emailTaken) {
    res.status(400);
    throw new Error('An account with this email already exists. Please login.');
  }
  const phoneTaken = await Customer.findOne({ phone });
  if (phoneTaken) {
    res.status(400);
    throw new Error('An account with this phone number already exists. Please login.');
  }

  let emailVerified = false;
  const verifiedEmail = readEmailVerifyToken(emailVerifyToken);
  if (verifiedEmail) {
    if (verifiedEmail !== email) {
      res.status(400);
      throw new Error('Verified email does not match the email you entered');
    }
    emailVerified = true;
  }

  let phoneVerified = false;
  if (phoneAccessToken) {
    try {
      const verified = await verifyMsg91AccessToken(phoneAccessToken, { fallbackPhone: phone });
      if (verified.phone !== phone) {
        res.status(400);
        throw new Error('Verified mobile does not match the number you entered');
      }
      phoneVerified = true;
    } catch (err) {
      res.status(401);
      throw new Error(err.message || 'Mobile verification failed');
    }
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    password,
    state,
    city,
    emailVerified,
    phoneVerified,
    isVerified: emailVerified || phoneVerified,
    lastLogin: new Date(),
  });

  Promise.all([
    sendWelcomeEmail({ email: customer.email, name: customer.name }),
    sendRegistrationAdminEmail({ customer }),
  ]).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(customer._id, 'customer'),
    customer: formatCustomer(customer),
  });
});

// @desc    Login with email or phone + password
// @route   POST /api/customer/auth/login
export const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
  const password = String(req.body.password || '');

  if (!identifier || !password) {
    res.status(400);
    throw new Error('Email/phone and password are required');
  }

  const isEmail = identifier.includes('@');
  const query = isEmail
    ? { email: identifier.toLowerCase() }
    : { phone: normalizeIndianMobile(identifier) };

  const customer = await Customer.findOne(query).select('+password');
  if (!customer || !(await customer.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email/phone or password');
  }

  if (!customer.password) {
    res.status(401);
    throw new Error('This account has no password set. Please register again or contact support.');
  }

  customer.lastLogin = new Date();
  await customer.save();

  if (customer.email) {
    sendLoginAlertEmail({ email: customer.email, name: customer.name }).catch(() => {});
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(customer._id, 'customer'),
    customer: formatCustomer(customer),
  });
});

export const getCustomerMe = asyncHandler(async (req, res) => {
  res.json({ success: true, customer: formatCustomer(req.customer) });
});

export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  if (req.body.name !== undefined) customer.name = req.body.name.trim();
  if (req.body.state !== undefined) customer.state = String(req.body.state).trim();
  if (req.body.city !== undefined) customer.city = String(req.body.city).trim();
  if (req.body.email && !customer.email) {
    customer.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.phone && !customer.phone) {
    customer.phone = normalizeIndianMobile(req.body.phone);
  }

  await customer.save();
  res.json({ success: true, customer: formatCustomer(customer) });
});
