import asyncHandler from 'express-async-handler';
import {
  sendContactConfirmationEmail,
  sendContactAdminEmail,
  sendHelpEnquiryConfirmationEmail,
  sendHelpEnquiryAdminEmail,
  hasEmailFailure,
  notifyDeliveryFailure,
} from '../utils/email.js';

const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

// @desc    Contact Us form
// @route   POST /api/contact
// @access  Public
export const submitContactForm = asyncHandler(async (req, res) => {
  const form = {
    name: String(req.body.name || '').trim() || 'Pet Parent',
    phone: normalizePhone(req.body.phone),
    email: String(req.body.email || '').trim().toLowerCase(),
    subject: String(req.body.subject || '').trim(),
    message: String(req.body.message || '').trim(),
  };

  if (!form.email || !form.phone || !form.subject || !form.message) {
    res.status(400);
    throw new Error('Name, email, phone, subject, and message are required');
  }

  const results = await Promise.all([
    form.email
      ? sendContactConfirmationEmail({ form })
      : Promise.resolve({ skipped: true }),
    sendContactAdminEmail({ form }),
  ]);

  if (hasEmailFailure(results)) {
    await notifyDeliveryFailure({
      userEmail: form.email,
      userName: form.name,
      context: 'contact message',
      results,
    }).catch(() => {});
  }

  const bothFailed = results.every((r) => r && r.success === false);
  if (bothFailed) {
    res.status(502);
    throw new Error('Could not send your message right now. Please try again or call us.');
  }

  res.status(201).json({
    success: true,
    message: 'Message sent! We will get back to you soon.',
  });
});

// @desc    Help / Enquiries form
// @route   POST /api/contact/help
// @access  Public
export const submitHelpEnquiry = asyncHandler(async (req, res) => {
  const form = {
    intent: String(req.body.intent || '').trim(),
    name: String(req.body.name || '').trim() || 'Pet Parent',
    phone: normalizePhone(req.body.phone),
    email: String(req.body.email || '').trim().toLowerCase(),
    petType: String(req.body.petType || req.body.category || '').trim(),
    breed: String(req.body.breed || '').trim(),
    city: String(req.body.city || '').trim(),
    message: String(req.body.message || '').trim(),
  };

  if (!form.intent || !form.email || !form.phone || !form.petType || !form.city || !form.message) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const results = await Promise.all([
    form.email
      ? sendHelpEnquiryConfirmationEmail({ form })
      : Promise.resolve({ skipped: true }),
    sendHelpEnquiryAdminEmail({ form }),
  ]);

  if (hasEmailFailure(results)) {
    await notifyDeliveryFailure({
      userEmail: form.email,
      userName: form.name,
      context: 'help enquiry',
      results,
    }).catch(() => {});
  }

  const bothFailed = results.every((r) => r && r.success === false);
  if (bothFailed) {
    res.status(502);
    throw new Error('Could not send your enquiry right now. Please try again or call us.');
  }

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted. Our team will contact you soon.',
  });
});
