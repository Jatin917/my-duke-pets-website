import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import DonateSettings from '../models/DonateSettings.js';
import { sendDonationThankYouEmail, sendDonationAdminEmail } from '../utils/email.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getOrCreateSettings = async () => {
  let settings = await DonateSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await DonateSettings.create({ key: 'default' });
  }
  return settings;
};

const deleteOldQr = (qrPath) => {
  if (!qrPath || !qrPath.startsWith('/uploads/')) return;
  const absolute = path.join(uploadsRoot, qrPath.replace(/^\/uploads\//, ''));
  if (fs.existsSync(absolute)) {
    try {
      fs.unlinkSync(absolute);
    } catch {
      /* ignore */
    }
  }
};

// @desc    Get donate page settings
// @route   GET /api/donate
// @access  Public
export const getDonateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

// @desc    Update donate page settings
// @route   PUT /api/donate
// @access  Private/Admin
export const updateDonateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const body = req.body || {};

  const boolFields = ['pageEnabled', 'promptEnabled'];
  boolFields.forEach((field) => {
    if (body[field] !== undefined) {
      settings[field] = body[field] === true || body[field] === 'true';
    }
  });

  if (body.promptDelaySeconds !== undefined) {
    settings.promptDelaySeconds = Math.min(600, Math.max(5, Number(body.promptDelaySeconds) || 30));
  }

  const stringFields = [
    'promptTitle',
    'promptMessage',
    'promptCtaText',
    'heroTitle',
    'heroSubtitle',
    'heroCtaText',
    'upiId',
    'bankDetails',
    'payNote',
    'thankYouTitle',
    'thankYouMessage',
  ];
  stringFields.forEach((field) => {
    if (body[field] !== undefined) settings[field] = String(body[field]);
  });

  if (body.amounts !== undefined) {
    const amounts = parseMaybeJson(body.amounts, settings.amounts);
    settings.amounts = (Array.isArray(amounts) ? amounts : [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 8);
  }

  if (body.impactItems !== undefined) {
    settings.impactItems = parseMaybeJson(body.impactItems, settings.impactItems);
  }
  if (body.stats !== undefined) {
    settings.stats = parseMaybeJson(body.stats, settings.stats);
  }
  if (body.faqs !== undefined) {
    settings.faqs = parseMaybeJson(body.faqs, settings.faqs);
  }
  if (body.thankYous !== undefined) {
    settings.thankYous = parseMaybeJson(body.thankYous, settings.thankYous);
  }

  if (body.removeQr === true || body.removeQr === 'true') {
    deleteOldQr(settings.qrImage);
    settings.qrImage = '';
  }

  if (req.file) {
    deleteOldQr(settings.qrImage);
    settings.qrImage = `/uploads/donate/${req.file.filename}`;
  }

  await settings.save();
  res.json({ success: true, message: 'Donate settings updated', data: settings });
});

// @desc    Acknowledge a donation and email thank-you
// @route   POST /api/donate/acknowledge
// @access  Public
export const acknowledgeDonation = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const note = (req.body.note || '').trim();
  const amountRaw = req.body.amount;
  const amount = amountRaw !== undefined && amountRaw !== '' ? Number(amountRaw) : null;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email for the thank-you receipt');
  }

  if (amount !== null && (!Number.isFinite(amount) || amount <= 0)) {
    res.status(400);
    throw new Error('Please provide a valid donation amount');
  }

  await Promise.all([
    sendDonationThankYouEmail({ email, name, amount }),
    sendDonationAdminEmail({ email, name, amount, note }),
  ]);

  res.json({
    success: true,
    message: 'Thank you! A confirmation email is on its way.',
  });
});
