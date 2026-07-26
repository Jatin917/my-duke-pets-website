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

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const SIGNUP_TOKEN_EXPIRES = '15m';

const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const normalizeIdentifier = (channel, email, phone) => {
  if (channel === 'email') return (email || '').trim().toLowerCase();
  return normalizeIndianMobile(phone);
};

const formatCustomer = (customer) => ({
  id: customer._id,
  name: customer.name || '',
  email: customer.email || '',
  phone: customer.phone || '',
});

const createSignupToken = (channel, identifier) =>
  jwt.sign({ type: 'signup', channel, identifier }, process.env.JWT_SECRET, {
    expiresIn: SIGNUP_TOKEN_EXPIRES,
  });

const verifySignupToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type !== 'signup' || !decoded.channel || !decoded.identifier) {
    throw new Error('Invalid signup token');
  }
  return decoded;
};

const finishVerifiedLogin = async (res, channel, identifier) => {
  const query = channel === 'email' ? { email: identifier } : { phone: identifier };
  const customer = await Customer.findOne(query);

  if (customer) {
    customer.isVerified = true;
    customer.lastLogin = new Date();
    await customer.save();

    if (customer.email) {
      sendLoginAlertEmail({ email: customer.email, name: customer.name }).catch(() => {});
    }

    return res.json({
      success: true,
      isNewUser: false,
      message: 'Login successful',
      token: generateToken(customer._id, 'customer'),
      customer: formatCustomer(customer),
    });
  }

  return res.json({
    success: true,
    isNewUser: true,
    message: 'OTP verified. Please complete your profile.',
    signupToken: createSignupToken(channel, identifier),
    channel,
    identifier:
      channel === 'email'
        ? identifier.replace(/(.{2}).+(@.+)/, '$1***$2')
        : `******${identifier.slice(-4)}`,
  });
};

// @desc    Send OTP via email (phone OTP is handled by MSG91 widget on the client)
// @route   POST /api/customer/auth/send-otp
// @access  Public
export const sendOtp = asyncHandler(async (req, res) => {
  const { channel, email, phone } = req.body;

  if (!['email', 'phone'].includes(channel)) {
    res.status(400);
    throw new Error('Channel must be email or phone');
  }

  if (channel === 'phone') {
    res.status(400);
    throw new Error('Phone OTP is sent via MSG91 on the login page. Use email OTP here, or verify with MSG91.');
  }

  const identifier = normalizeIdentifier(channel, email, phone);

  if (!/^\S+@\S+\.\S+$/.test(identifier)) {
    res.status(400);
    throw new Error('Please provide a valid email');
  }

  await Otp.updateMany(
    { identifier, channel, verified: false },
    { $set: { verified: true } }
  );

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await Otp.create({ channel, identifier, code, expiresAt });

  const result = await sendOtpEmail({ email: identifier, code });
  const emailSent = Boolean(result?.success);
  if (!emailSent) {
    sendOtpFailureAdminEmail({
      email: identifier,
      error:
        typeof result?.error === 'string'
          ? result.error
          : JSON.stringify(result?.error || 'SMTP send failed'),
    }).catch(() => {});
  }

  res.json({
    success: true,
    message: emailSent
      ? 'OTP sent to your email. Please check your inbox.'
      : 'OTP generated. Email delivery failed — please try again.',
    channel,
    identifier: identifier.replace(/(.{2}).+(@.+)/, '$1***$2'),
    expiresIn: 600,
    emailSent,
  });
});

// @desc    Verify email OTP — existing users log in; new users get a signup token
// @route   POST /api/customer/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { channel, email, phone, otp } = req.body;

  if (channel === 'phone') {
    res.status(400);
    throw new Error('Phone OTP must be verified via MSG91. Submit the MSG91 access token instead.');
  }

  if (channel !== 'email') {
    res.status(400);
    throw new Error('Channel must be email or phone');
  }

  if (!otp || String(otp).length !== 6) {
    res.status(400);
    throw new Error('Please enter a valid 6-digit OTP');
  }

  const identifier = normalizeIdentifier(channel, email, phone);

  const otpDoc = await Otp.findOne({
    identifier,
    channel,
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

  if (otpDoc.code !== String(otp).trim()) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    res.status(400);
    throw new Error('Invalid OTP. Please try again.');
  }

  otpDoc.verified = true;
  await otpDoc.save();

  return finishVerifiedLogin(res, 'email', identifier);
});

// @desc    Verify MSG91 widget access token (phone OTP)
// @route   POST /api/customer/auth/verify-msg91
// @access  Public
export const verifyMsg91 = asyncHandler(async (req, res) => {
  const accessToken = (req.body.accessToken || req.body['access-token'] || '').trim();
  const claimedPhone = normalizeIndianMobile(req.body.phone);

  if (!accessToken) {
    res.status(400);
    throw new Error('MSG91 access token is required');
  }

  let verified;
  try {
    verified = await verifyMsg91AccessToken(accessToken);
  } catch (err) {
    res.status(401);
    throw new Error(err.message || 'MSG91 verification failed');
  }

  if (claimedPhone && claimedPhone !== verified.phone) {
    res.status(400);
    throw new Error('Verified mobile does not match the number you entered');
  }

  return finishVerifiedLogin(res, 'phone', verified.phone);
});

// @desc    Complete signup for new customers after OTP verification
// @route   POST /api/customer/auth/complete-signup
// @access  Public (signup token)
export const completeSignup = asyncHandler(async (req, res) => {
  const { signupToken, name, email, phone } = req.body;

  if (!signupToken) {
    res.status(400);
    throw new Error('Signup session expired. Please verify OTP again.');
  }

  let decoded;
  try {
    decoded = verifySignupToken(signupToken);
  } catch {
    res.status(401);
    throw new Error('Signup session expired. Please verify OTP again.');
  }

  const { channel, identifier } = decoded;
  const trimmedName = (name || '').trim();

  if (!trimmedName || trimmedName.length < 2) {
    res.status(400);
    throw new Error('Please enter your full name');
  }

  const existing =
    channel === 'email'
      ? await Customer.findOne({ email: identifier })
      : await Customer.findOne({ phone: identifier });

  if (existing) {
    res.status(400);
    throw new Error('Account already exists. Please login again.');
  }

  const payload = {
    name: trimmedName,
    isVerified: true,
    lastLogin: new Date(),
    ...(channel === 'email' ? { email: identifier } : { phone: identifier }),
  };

  // Collect the other contact if provided
  if (channel === 'phone' && email?.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      res.status(400);
      throw new Error('Please provide a valid email');
    }
    const emailTaken = await Customer.findOne({ email: normalizedEmail });
    if (emailTaken) {
      res.status(400);
      throw new Error('This email is already linked to another account');
    }
    payload.email = normalizedEmail;
  }

  if (channel === 'email' && phone?.trim()) {
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      res.status(400);
      throw new Error('Please provide a valid 10-digit phone number');
    }
    const phoneTaken = await Customer.findOne({ phone: normalizedPhone });
    if (phoneTaken) {
      res.status(400);
      throw new Error('This phone number is already linked to another account');
    }
    payload.phone = normalizedPhone;
  }

  const customer = await Customer.create(payload);

  if (customer.email) {
    Promise.all([
      sendWelcomeEmail({ email: customer.email, name: customer.name }),
      sendRegistrationAdminEmail({ customer }),
    ]).catch(() => {});
  } else {
    sendRegistrationAdminEmail({ customer }).catch(() => {});
  }

  res.status(201).json({
    success: true,
    isNewUser: true,
    message: 'Account created successfully',
    token: generateToken(customer._id, 'customer'),
    customer: formatCustomer(customer),
  });
});

// @desc    Get current customer profile
// @route   GET /api/customer/auth/me
// @access  Private (customer)
export const getCustomerMe = asyncHandler(async (req, res) => {
  res.json({ success: true, customer: req.customer });
});

// @desc    Update customer profile
// @route   PUT /api/customer/auth/profile
// @access  Private (customer)
export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  if (req.body.name !== undefined) customer.name = req.body.name.trim();
  if (req.body.email && !customer.email) {
    customer.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.phone && !customer.phone) {
    customer.phone = req.body.phone.replace(/\D/g, '').slice(-10);
  }

  await customer.save();
  res.json({ success: true, customer });
});
