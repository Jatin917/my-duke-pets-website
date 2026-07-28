import asyncHandler from 'express-async-handler';
import EnquiryPromptSettings from '../models/EnquiryPromptSettings.js';

const getOrCreateSettings = async () => {
  let settings = await EnquiryPromptSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await EnquiryPromptSettings.create({ key: 'default' });
  }
  return settings;
};

// @desc    Get enquiry prompt settings
// @route   GET /api/enquiry-prompt
// @access  Public
export const getEnquiryPromptSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

// @desc    Update enquiry prompt settings
// @route   PUT /api/enquiry-prompt
// @access  Private/Admin
export const updateEnquiryPromptSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const body = req.body || {};

  if (body.promptEnabled !== undefined) {
    settings.promptEnabled = body.promptEnabled === true || body.promptEnabled === 'true';
  }

  if (body.promptDelaySeconds !== undefined) {
    settings.promptDelaySeconds = Math.min(600, Math.max(5, Number(body.promptDelaySeconds) || 30));
  }

  ['promptTitle', 'promptMessage', 'promptCtaText'].forEach((field) => {
    if (body[field] !== undefined) settings[field] = String(body[field]);
  });

  await settings.save();
  res.json({ success: true, data: settings });
});
